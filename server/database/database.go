package database

import (
	"database/sql"
	"fmt"
	"log"
	"log/slog"

	_ "embed"

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
	// local use
	connectionString := fmt.Sprintf("host=%s port=%d dbname=%s sslmode=disable", host, port, dbName)

	// vm use
	// connectionString = fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbName)

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
	/*
								createUsersTableCmd := `
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
								_, err := DB.Exec(createUsersTableCmd)
								if err != nil {
									log.Fatalf("Error creating users table: %v", err)
								}

								createAnalyesesTableCmd := `
									CREATE TABLE IF NOT EXISTS analyses (
									id SERIAL PRIMARY KEY,
									user_id INTEGER NOT NULL REFERENCES users(id),
									details JSONB
								);

								CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
								`
								_, err = DB.Exec(createAnalyesesTableCmd)
								if err != nil {
									log.Fatalf("Error creating analyses table: %v", err)
								}

								addFieldsToAnalyesesTableCmd := `
									ALTER TABLE analyses
									ADD COLUMN title VARCHAR(100),
									ADD COLUMN description TEXT,
									ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
									ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
								`
								_, err = DB.Exec(addFieldsToAnalyesesTableCmd)
								if err != nil {
									slog.Debug("This is expected if the 'analyses table already exists")
								}


							// Create Books table
							createBooksTableCmd := `
							CREATE TABLE IF NOT EXISTS books (
								id SERIAL PRIMARY KEY,
								title VARCHAR(255) NOT NULL
							);
							`
							_, err := DB.Exec(createBooksTableCmd)
							if err != nil {
								slog.Debug("This is expected if the 'books' table already exists")
							}

							// Create Chapters table
							createChaptersTableCmd := `
							CREATE TABLE IF NOT EXISTS chapters (
								id SERIAL PRIMARY KEY,
								book_id INTEGER NOT NULL REFERENCES books(id),
								number INTEGER NOT NULL
							);

							CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id);
							`
							_, err = DB.Exec(createChaptersTableCmd)
							if err != nil {
								slog.Debug("This is expected if the 'chapters' table already exists")
							}

							// Create Verses table
							createVersesTableCmd := `
							CREATE TABLE IF NOT EXISTS verses (
								id SERIAL PRIMARY KEY,
								chapter_id INTEGER NOT NULL REFERENCES chapters(id),
								number INTEGER NOT NULL,
								UNIQUE(chapter_id, number)
							);

							CREATE INDEX IF NOT EXISTS idx_verses_chapter_id ON verses(chapter_id);
							`
							_, err = DB.Exec(createVersesTableCmd)
							if err != nil {
								slog.Debug("This is expected if the 'verses' table already exists")
							}

							// Create Words table
							createWordsTableCmd := `
							CREATE TABLE IF NOT EXISTS words (
								id SERIAL PRIMARY KEY,
								verse_id INTEGER NOT NULL REFERENCES verses(id),
								text VARCHAR(255) NOT NULL,
								lemma VARCHAR(255),
								strong VARCHAR(50),
								morph VARCHAR(50)
							);

							CREATE INDEX IF NOT EXISTS idx_words_verse_id ON words(verse_id);
							`
							_, err = DB.Exec(createWordsTableCmd)
							if err != nil {
								slog.Debug("This is expected if the 'words' table already exists")
							}

					addTheBooks()



				// Create Strongs table
				createStrongsTableCmd := `
					CREATE TABLE IF NOT EXISTS strongs (
						id SERIAL PRIMARY KEY,
						code VARCHAR(10) NOT NULL,
						definitions JSON NOT NULL
					);

					CREATE UNIQUE INDEX IF NOT EXISTS idx_strongs_code ON strongs(code);
					`
				_, err := DB.Exec(createStrongsTableCmd)
				if err != nil {
					slog.Debug("This is expected if the 'strongs' table already exists")
				}


			importStrongsData()


		_, err := DB.Exec("ALTER TABLE strongs ADD COLUMN lemma VARCHAR(50);")
		if err != nil {
			slog.Debug("This is expected if the 'lemma' column already exists")
		}

		setLemmasCmd := `
			update strongs s
			set lemma = (
				select w.lemma
				from words w
				where w.strong = s.code
				limit 1
			)
		`
		_, err = DB.Exec(setLemmasCmd)
		if err != nil {
			slog.Error("Error setting lemmas in strongs table", "error", err)
		}
	*/

	slog.Info("Database migrations completed")
}
