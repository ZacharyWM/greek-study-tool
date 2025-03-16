package service

import (
	"context"
	"log/slog"

	"github.com/ZacharyWM/greek-study-tool/server/database"
)

type User struct {
	ID            int64
	IdpID         string
	FirstName     string
	LastName      string
	Nickname      string
	Name          string
	Picture       string
	Email         string
	EmailVerified bool
}

// InsertUser inserts a new user into the database
func InsertUser(ctx context.Context, user User) (int64, error) {
	query := `
		INSERT INTO users (idp_id, first_name, last_name, nickname, name, picture, email, email_verified)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (idp_id) DO UPDATE SET
			first_name = $2,
			last_name = $3,
			nickname = $4,
			name = $5,
			picture = $6,
			email = $7,
			email_verified = $8
		RETURNING id
	`

	var id int64
	row := database.DB.QueryRowContext(
		ctx,
		query,
		user.IdpID,
		user.FirstName,
		user.LastName,
		user.Nickname,
		user.Name,
		user.Picture,
		user.Email,
		user.EmailVerified,
	)

	err := row.Scan(&id)
	if err != nil {
		slog.Error("Failed to insert or update user", "error", err)
		return 0, err
	}

	return id, nil
}

// GetUserByIdpID retrieves a user from the database by their IdP ID
func GetUserByIdpID(ctx context.Context, idpID string) (User, error) {
	query := `
		SELECT id, idp_id, first_name, last_name, nickname, name, picture, email, email_verified 
		FROM users
		WHERE idp_id = $1
	`

	var user User
	row := database.DB.QueryRowContext(ctx, query, idpID)

	err := row.Scan(
		&user.ID,
		&user.IdpID,
		&user.FirstName,
		&user.LastName,
		&user.Nickname,
		&user.Name,
		&user.Picture,
		&user.Email,
		&user.EmailVerified,
	)

	if err != nil {
		slog.Error("Failed to retrieve user by IdP ID", "idpID", idpID, "error", err)
		return User{}, err
	}

	return user, nil
}

// UpdateUserByIdpID updates an existing user in the database by their IdP ID
func UpdateUserByIdpID(ctx context.Context, user User) error {
	query := `
		UPDATE users
		SET 
			first_name = $1,
			last_name = $2,
			nickname = $3,
			name = $4,
			picture = $5,
			email = $6,
			email_verified = $7
		WHERE idp_id = $8
	`

	_, err := database.DB.ExecContext(
		ctx,
		query,
		user.FirstName,
		user.LastName,
		user.Nickname,
		user.Name,
		user.Picture,
		user.Email,
		user.EmailVerified,
		user.IdpID,
	)

	if err != nil {
		slog.Error("Failed to update user", "idpID", user.IdpID, "error", err)
		return err
	}

	return nil
}
