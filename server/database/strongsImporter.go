package database

import (
	_ "embed"
	"encoding/json"
)

// SKIP EMBED go:embed strongs/strongs.json
var strongsData []byte

type StrongsWord struct {
	Strong      string              `json:"strong"`
	Definitions []StrongsDefinition `json:"definitions"`
}

type StrongsDefinition struct {
	Number     int    `json:"number"`
	Definition string `json:"definition"`
}

func importStrongsData() error {
	var strongsWords []StrongsWord
	err := json.Unmarshal(strongsData, &strongsWords)
	if err != nil {
		return err
	}

	// Loop over all strongsWords and insert them into the database
	for _, word := range strongsWords {
		// Convert definitions to JSON for storage
		definitionsJSON, err := json.Marshal(word.Definitions)
		if err != nil {
			return err
		}

		// Insert into strongs table
		_, err = DB.Exec(
			"INSERT INTO strongs (code, definitions) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING",
			word.Strong,
			string(definitionsJSON),
		)
		if err != nil {
			return err
		}
	}

	return nil
}
