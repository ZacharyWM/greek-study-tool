package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

var DB *sql.DB

const (
	host   = "127.0.0.1"
	port   = 5432
	dbName = "greek_study_tool"
)

// InitDB initializes the database connection
func InitDB() {
	connectionString := fmt.Sprintf("host=%s port=%d dbname=%s sslmode=disable", host, port, dbName)
	var err error
	DB, err = sql.Open("postgres", connectionString)
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}

	// Check the connection
	err = DB.Ping()
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}

	fmt.Println("Database connection established")
}

// RunMigrations runs database migrations
func RunMigrations() {
	// Create users table if it doesn't exist
	createTableQuery := `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		name VARCHAR(255) NOT NULL
	);
	`
	_, err := DB.Exec(createTableQuery)
	if err != nil {
		log.Fatalf("Error creating users table: %v", err)
	}

	fmt.Println("Database migrations completed")
}
