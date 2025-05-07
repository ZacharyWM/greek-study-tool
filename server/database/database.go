package database

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"log/slog"

	_ "embed"

	_ "github.com/lib/pq"
)

// //go:embed books/*
// var booksFS embed.FS

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

	*/

	slog.Info("Database migrations completed")
}

func bookExists(title string) bool {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM books WHERE title = $1)`

	err := DB.QueryRow(query, title).Scan(&exists)
	if err != nil {
		return false
	}

	return exists
}

// ImportBookDataFromJSON imports book data from JSON and inserts it into the database
func importBook(jsonData []byte) error {
	// Parse JSON into Book struct
	var book Book
	if err := json.Unmarshal(jsonData, &book); err != nil {
		return fmt.Errorf("error parsing book JSON data: %w", err)
	}

	var bookID int

	// Insert the book
	err := DB.QueryRow("INSERT INTO books (title) VALUES ($1) RETURNING id",
		book.Title).Scan(&bookID)
	if err != nil {
		return fmt.Errorf("error inserting book: %w", err)
	}

	// Begin a transaction for the rest of the import
	tx, err := DB.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %w", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// Insert each chapter
	for _, chapter := range book.Chapters {
		// Check if the chapter already exists
		var chapterID int

		// Insert the chapter
		err = tx.QueryRow(
			"INSERT INTO chapters (book_id, number) VALUES ($1, $2) RETURNING id",
			bookID, chapter.Number).Scan(&chapterID)
		if err != nil {
			return fmt.Errorf("error inserting chapter %d: %w", chapter.Number, err)
		}

		// Insert each verse
		for _, verse := range chapter.Verses {
			// Check if the verse already exists
			var verseID int

			// Insert the verse
			err = tx.QueryRow(
				"INSERT INTO verses (chapter_id, number) VALUES ($1, $2) RETURNING id",
				chapterID, verse.Number).Scan(&verseID)
			if err != nil {
				return fmt.Errorf("error inserting verse %d: %w", verse.Number, err)
			}

			// Insert each word
			for _, word := range verse.Words {

				// Check if we need to add text, lemma, and strong fields
				stmt, err := tx.Prepare(`
					INSERT INTO words (verse_id, text, lemma, strong, morph) 
					VALUES ($1, $2, $3, $4, $5)
				`)
				if err != nil {
					return fmt.Errorf("error preparing word statement: %w", err)
				}

				_, err = stmt.Exec(verseID, word.Text, word.Lemma, word.Strong, word.Morph)
				if err != nil {
					return fmt.Errorf("error inserting word: %w", err)
				}
				stmt.Close()
			}
		}
	}

	// Commit the transaction
	if err = tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %w", err)
	}

	slog.Info("Successfully imported book data", "title", book.Title)
	return nil
}

type Book struct {
	ID       int       `json:"id"`
	Title    string    `json:"title"`
	Chapters []Chapter `json:"chapters"`
}

type Chapter struct {
	ID     int     `json:"id"`
	BookID int     `json:"bookId"`
	Number int     `json:"number"`
	Verses []Verse `json:"verses"`
}

type Verse struct {
	ID        int    `json:"id"`
	ChapterID int    `json:"chapterId"`
	Number    int    `json:"number"`
	Words     []Word `json:"words"`
}

type Word struct {
	ID      int    `json:"id"`
	VerseID int    `json:"verseId"`
	Text    string `json:"text"`
	Lemma   string `json:"lemma"`
	Strong  string `json:"strong"`
	Morph   string `json:"morph"`
}

/*
func addTheBooks() {

	truncRows, err := DB.Query("truncate table books, chapters, verses, words")
	if err != nil {
		log.Fatalf("Error truncating tables: %v", err)
	}
	defer truncRows.Close()

	booksMap := make(map[int]string)

	dirEntries, err := booksFS.ReadDir("books")
	if err != nil {
		log.Fatalf("Error reading books directory: %v", err)
	}
	for _, entry := range dirEntries {
		if entry.IsDir() {
			continue
		}
		fileName := entry.Name()

		fileName = strings.TrimSuffix(fileName, ".json")
		splitStr := strings.Split(fileName, "_")

		orderStr := splitStr[0]
		orderNum, err := strconv.Atoi(orderStr)
		if err != nil {
			log.Fatalf("Error converting order string to int: %v", err)
		}

		booksMap[orderNum] = splitStr[1]

	}

	for i := 1; i <= len(booksMap); i++ {
		bookTitle := booksMap[i]
		if !bookExists(bookTitle) {
			data, err := booksFS.ReadFile("books/" + strconv.Itoa(i) + "_" + bookTitle + ".json")
			if err != nil {
				log.Fatalf("Error reading file %s: %v", bookTitle, err)
			}
			err = importBook(data)
			if err != nil {
				log.Fatalf("Error importing book %s: %v", bookTitle, err)
			}
			slog.Info("Successfully imported book data", "title", bookTitle)
		} else {
			slog.Debug("Book already exists in the database", "title", bookTitle)
		}
	}
}
*/
