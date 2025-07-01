package service

import (
	"encoding/json"
	"fmt"

	"github.com/ZacharyWM/greek-study-tool/server/database"
)

type StrongsWord struct {
	Strong      string              `json:"strong"`
	Definitions []StrongsDefinition `json:"definitions"`
}

type StrongsDefinition struct {
	Number     int    `json:"number"`
	Definition string `json:"definition"`
}

func GetStrongsWord(code string) (StrongsWord, error) {
	var strongsWord StrongsWord
	var definitionsJSON []byte

	row := database.DB.QueryRow("SELECT code, definitions FROM strongs WHERE code = $1", code)

	err := row.Scan(&strongsWord.Strong, &definitionsJSON)
	if err != nil {
		return StrongsWord{}, fmt.Errorf("error querying strongs data for code %s: %w", code, err)
	}

	err = json.Unmarshal(definitionsJSON, &strongsWord.Definitions)
	if err != nil {
		return StrongsWord{}, fmt.Errorf("error unmarshalling definitions JSON for code %s: %w", code, err)
	}

	return strongsWord, nil
}

func GetStrongsWordByText(text string) (StrongsWord, error) {
	var strongCode string
	var definitionsJSON []byte

	// Join words and strongs tables to get the strongs code and definitions by word text
	row := database.DB.QueryRow(`
		SELECT s.code, s.definitions
		FROM words w
		JOIN strongs s ON w.strong = s.code
		WHERE w.text = $1
		LIMIT 1
	`, text)

	err := row.Scan(&strongCode, &definitionsJSON)
	if err != nil {
		return StrongsWord{}, fmt.Errorf("error querying strongs data for word text '%s': %w", text, err)
	}

	var strongsWord StrongsWord
	strongsWord.Strong = strongCode
	err = json.Unmarshal(definitionsJSON, &strongsWord.Definitions)
	if err != nil {
		return StrongsWord{}, fmt.Errorf("error unmarshalling definitions JSON for word text '%s': %w", text, err)
	}

	return strongsWord, nil
}
