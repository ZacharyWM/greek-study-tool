package service

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log/slog"

	"github.com/ZacharyWM/greek-study-tool/server/database"
	"github.com/lib/pq"
)

type Analysis struct {
	ID      int                    `json:"id"`
	UserID  int                    `json:"user_id"`
	Details map[string]interface{} `json:"details"` //  json object
}

func InsertAnalysis(analysis Analysis) (int, error) {
	var id int
	detailsJSON, err := json.Marshal(analysis.Details)
	if err != nil {
		slog.Error("Failed to marshal analysis details", "error", err)
		return 0, err
	}

	err = database.DB.QueryRow(
		"INSERT INTO analyses (user_id, details) VALUES ($1, $2) RETURNING id",
		analysis.UserID, detailsJSON,
	).Scan(&id)

	if err != nil {
		slog.Error("Failed to insert analysis", "error", err)
		if pgErr, ok := err.(*pq.Error); ok {
			slog.Error("Postgres error", "code", pgErr.Code)
		}
		return 0, err
	}

	return id, nil
}

func UpdateAnalysis(analysis Analysis) error {
	detailsJSON, err := json.Marshal(analysis.Details)
	if err != nil {
		slog.Error("Failed to marshal analysis details", "error", err)
		return err
	}

	result, err := database.DB.Exec(
		"UPDATE analyses SET details = $1 WHERE id = $2 AND user_id = $3",
		detailsJSON, analysis.ID, analysis.UserID,
	)

	if err != nil {
		slog.Error("Failed to update analysis", "error", err)
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("no analysis found with the given id for this user")
	}

	return nil
}

func GetAnalysisById(id int, userId int) (*Analysis, error) {
	var analysis Analysis
	var detailsJSON []byte

	err := database.DB.QueryRow(
		"SELECT id, user_id, details FROM analyses WHERE id = $1 AND user_id = $2",
		id, userId,
	).Scan(&analysis.ID, &analysis.UserID, &detailsJSON)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("analysis not found")
		}
		slog.Error("Failed to get analysis", "error", err)
		return nil, err
	}

	analysis.Details = make(map[string]interface{})
	if err := json.Unmarshal(detailsJSON, &analysis.Details); err != nil {
		slog.Error("Failed to unmarshal details", "error", err)
		return nil, err
	}

	return &analysis, nil
}

func GetAnalysesByUserId(userId int) ([]*Analysis, error) {
	rows, err := database.DB.Query(
		"SELECT id, user_id, details FROM analyses WHERE user_id = $1",
		userId,
	)

	if err != nil {
		slog.Error("Failed to query analyses", "error", err)
		return nil, err
	}
	defer rows.Close()

	var analyses []*Analysis
	for rows.Next() {
		var analysis Analysis
		var detailsJSON []byte

		if err := rows.Scan(&analysis.ID, &analysis.UserID, &detailsJSON); err != nil {
			slog.Error("Failed to scan analysis row", "error", err)
			return nil, err
		}

		analysis.Details = make(map[string]interface{})
		if err := json.Unmarshal(detailsJSON, &analysis.Details); err != nil {
			slog.Error("Failed to unmarshal details", "error", err)
			return nil, err
		}

		analyses = append(analyses, &analysis)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return analyses, nil
}
