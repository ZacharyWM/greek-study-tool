package database

import (
	"encoding/json"
	"fmt"
	"log/slog"
)

// //go:embed books/*
// var booksFS embed.FS

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
