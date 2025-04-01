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
	ID          int                    `json:"id"`
	UserID      int                    `json:"user_id"`
	Title       string                 `json:"title"`
	Description string                 `json:"description"`
	Details     map[string]interface{} `json:"details,omitempty"` // json object
	CreatedAt   string                 `json:"created_at"`
	UpdatedAt   string                 `json:"updated_at"`
}

func InsertAnalysis(analysis Analysis) (int, error) {
	var id int
	detailsJSON, err := json.Marshal(analysis.Details)
	if err != nil {
		slog.Error("Failed to marshal analysis details", "error", err)
		return 0, err
	}

	err = database.DB.QueryRow(
		`INSERT INTO analyses (user_id, details, title, description) 
		VALUES ($1, $2, $3, $4) RETURNING id`,
		analysis.UserID, detailsJSON, analysis.Title, analysis.Description,
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
		`UPDATE analyses 
		SET details = $1, 
		updated_at = NOW(),
		title = $2,
		description = $3
		WHERE id = $4 AND user_id = $5`,
		detailsJSON, analysis.Title, analysis.Description, analysis.ID, analysis.UserID,
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

func GetAnalysisById(id int, userId int) (Analysis, error) {
	var analysis Analysis
	var detailsJSON []byte

	err := database.DB.QueryRow(
		`SELECT id, user_id, details, created_at, updated_at, title, description
		FROM analyses
		WHERE id = $1 AND user_id = $2`,
		id, userId,
	).
		Scan(&analysis.ID,
			&analysis.UserID,
			&detailsJSON,
			&analysis.CreatedAt,
			&analysis.UpdatedAt,
			&analysis.Title,
			&analysis.Description)

	if err != nil {
		if err == sql.ErrNoRows {
			return analysis, errors.New("analysis not found")
		}
		slog.Error("Failed to get analysis", "error", err)
		return analysis, err
	}

	analysis.Details = make(map[string]interface{})
	if err := json.Unmarshal(detailsJSON, &analysis.Details); err != nil {
		slog.Error("Failed to unmarshal details", "error", err)
		return analysis, err
	}

	return analysis, nil
}

func GetAnalysesForUser(userId int) ([]Analysis, error) {
	var analyses []Analysis

	// Include created_at and last_modified timestamps
	rows, err := database.DB.Query(
		`select id, user_id, created_at, updated_at, title, description
		from analyses 
		where user_id = $1
		order by updated_at desc`,
		userId,
	)
	if err != nil {
		slog.Error("Failed to get analyses", "error", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var analysis Analysis
		err := rows.Scan(&analysis.ID,
			&analysis.UserID,
			&analysis.CreatedAt,
			&analysis.UpdatedAt,
			&analysis.Title,
			&analysis.Description)
		if err != nil {
			slog.Error("Failed to scan analysis", "error", err)
			return nil, err
		}
		analyses = append(analyses, analysis)
	}

	if err := rows.Err(); err != nil {
		slog.Error("Error iterating through rows", "error", err)
		return nil, err
	}

	return analyses, nil
}

func GetLastUpdatedAnalysis(userId int) (Analysis, error) {
	var analysis Analysis
	var detailsJSON []byte

	err := database.DB.QueryRow(
		`select id, user_id, details, created_at, updated_at, title, description
		from analyses
		where user_id = $1
		order by updated_at desc
		limit 1`,
		userId,
	).Scan(
		&analysis.ID,
		&analysis.UserID,
		&detailsJSON,
		&analysis.CreatedAt,
		&analysis.UpdatedAt,
		&analysis.Title,
		&analysis.Description)

	if err != nil {
		if err == sql.ErrNoRows {
			return analysis, errors.New("no analyses found for this user")
		}
		slog.Error("failed to get most recent analysis", "error", err)
		return analysis, err
	}

	analysis.Details = make(map[string]interface{})
	if err := json.Unmarshal(detailsJSON, &analysis.Details); err != nil {
		slog.Error("failed to unmarshal details", "error", err)
		return analysis, err
	}

	return analysis, nil
}

func DeleteAnalysis(id int, userId int) error {
	result, err := database.DB.Exec(
		`DELETE FROM analyses 
		WHERE id = $1 AND user_id = $2`,
		id, userId,
	)

	if err != nil {
		slog.Error("Failed to delete analysis", "error", err)
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		slog.Error("Failed to get rows affected", "error", err)
		return err
	}

	if rowsAffected == 0 {
		return errors.New("no analysis found with the given id for this user")
	}

	return nil
}
