package database

import (
	"database/sql"
	"fmt"
	"log"
	"log/slog"

	_ "github.com/lib/pq"
)

var DB *sql.DB

// TODO - replace with env vars
const (
	host     = "127.0.0.1"
	port     = 5432
	user     = "postgres"
	password = "password1"
	dbName   = "greek_study_tool"
)

// InitDB initializes the database connection
func InitDB() {
	connectionString := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbName)
	var err error
	DB, err = sql.Open("postgres", connectionString)
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}

	err = DB.Ping()
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}

	slog.Info("Database connection established")
}

// TODO - work out a better migration strategy
func RunMigrations() {
	createTableQuery := `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		idp_id VARCHAR(255) NOT NULL,
		first_name VARCHAR(255),
		last_name VARCHAR(255),
		nickname VARCHAR(255),
		name VARCHAR(255),
		picture TEXT,
		email VARCHAR(255),
		email_verified BOOLEAN
	);
	
	CREATE UNIQUE INDEX IF NOT EXISTS idx_users_idp_id ON users(idp_id);
	`
	_, err := DB.Exec(createTableQuery)
	if err != nil {
		log.Fatalf("Error creating users table: %v", err)
	}

	slog.Info("Database migrations completed")
}
