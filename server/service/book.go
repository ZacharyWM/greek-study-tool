package service

import (
	"encoding/json"
	"fmt"
	"log/slog"

	"github.com/ZacharyWM/greek-study-tool/server/database"
)

type Book struct {
	ID       int       `json:"id"`
	Title    string    `json:"title"`
	Chapters []Chapter `json:"chapters,omitempty"`
}

type Chapter struct {
	ID     int     `json:"id"`
	BookID int     `json:"bookId"`
	Number int     `json:"number"`
	Verses []Verse `json:"verses,omitempty"`
}

type Verse struct {
	ID        int    `json:"id"`
	ChapterID int    `json:"chapterId"`
	Number    int    `json:"number"`
	Words     []Word `json:"words,omitempty"`
}

type Word struct {
	ID         int    `json:"id"`
	VerseID    int    `json:"verseId"`
	Text       string `json:"text"`
	Lemma      string `json:"lemma"`
	Strong     string `json:"strong"`
	Morph      string `json:"morph"`
	Definition string `json:"definition"`
}

func GetBooks() ([]Book, error) {
	rows, err := database.DB.Query("SELECT id, title FROM books")
	if err != nil {
		return nil, fmt.Errorf("error querying books: %w", err)
	}
	defer rows.Close()

	var books []Book
	for rows.Next() {
		var book Book
		if err := rows.Scan(&book.ID, &book.Title); err != nil {
			return nil, fmt.Errorf("error scanning book: %w", err)
		}
		books = append(books, book)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over books: %w", err)
	}

	return books, nil
}

func GetChapters(bookID int) ([]Chapter, error) {
	rows, err := database.DB.Query("SELECT id, book_id, number FROM chapters WHERE book_id = $1", bookID)
	if err != nil {
		return nil, fmt.Errorf("error querying chapters: %w", err)
	}
	defer rows.Close()

	var chapters []Chapter
	for rows.Next() {
		var chapter Chapter
		if err := rows.Scan(&chapter.ID, &chapter.BookID, &chapter.Number); err != nil {
			return nil, fmt.Errorf("error scanning chapter: %w", err)
		}
		chapters = append(chapters, chapter)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over chapters: %w", err)
	}

	return chapters, nil
}

func GetVerses(chapterID int) ([]Verse, error) {
	rows, err := database.DB.Query("SELECT id, chapter_id, number FROM verses WHERE chapter_id = $1", chapterID)
	if err != nil {
		return nil, fmt.Errorf("error querying verses: %w", err)
	}
	defer rows.Close()

	var verses []Verse
	for rows.Next() {
		var verse Verse
		if err := rows.Scan(&verse.ID, &verse.ChapterID, &verse.Number); err != nil {
			return nil, fmt.Errorf("error scanning verse: %w", err)
		}
		verses = append(verses, verse)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over verses: %w", err)
	}

	return verses, nil
}

func GetVersesWithWords(startID, endID int) ([]Verse, error) {
	query := `
        SELECT
            v.id AS verse_id,
            v.chapter_id,
            v.number AS verse_number,
            w.id AS word_id,
            w.text,
            w.lemma,
            w.strong,
            w.morph,
            COALESCE(s.definitions->0->>'definition', '') AS definition
        FROM verses v
        LEFT JOIN words w ON w.verse_id = v.id
        LEFT JOIN strongs s ON w.strong = s.code
        WHERE v.id BETWEEN $1 AND $2
        ORDER BY v.id, w.id`

	rows, err := database.DB.Query(query, startID, endID)
	if err != nil {
		return nil, fmt.Errorf("error querying verses with words: %w", err)
	}
	defer rows.Close()

	versesMap := make(map[int]*Verse)
	var versesOrder []int

	for rows.Next() {
		var (
			verseID     int
			chapterID   int
			verseNumber int
			wordID      *int
			text        *string
			lemma       *string
			strong      *string
			morph       *string
			definition  *string
		)

		if err := rows.Scan(&verseID, &chapterID, &verseNumber, &wordID, &text, &lemma, &strong, &morph, &definition); err != nil {
			return nil, fmt.Errorf("error scanning verse with words: %w", err)
		}

		v, ok := versesMap[verseID]
		if !ok {
			v = &Verse{
				ID:        verseID,
				ChapterID: chapterID,
				Number:    verseNumber,
			}
			versesMap[verseID] = v
			versesOrder = append(versesOrder, verseID)
		}

		// If there is no word for this row (LEFT JOIN), skip adding a word
		if wordID == nil {
			continue
		}

		w := Word{
			ID:         *wordID,
			VerseID:    verseID,
			Text:       derefString(text),
			Lemma:      derefString(lemma),
			Strong:     derefString(strong),
			Morph:      derefString(morph),
			Definition: derefString(definition),
		}
		v.Words = append(v.Words, w)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over verses with words: %w", err)
	}

	// Build the final ordered slice of verses
	verses := make([]Verse, 0, len(versesOrder))
	for _, id := range versesOrder {
		if v, ok := versesMap[id]; ok {
			verses = append(verses, *v)
		}
	}

	return verses, nil
}

func derefString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
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
	err := database.DB.QueryRow("INSERT INTO books (title) VALUES ($1) RETURNING id",
		book.Title).Scan(&bookID)
	if err != nil {
		return fmt.Errorf("error inserting book: %w", err)
	}

	// Begin a transaction for the rest of the import
	tx, err := database.DB.Begin()
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
