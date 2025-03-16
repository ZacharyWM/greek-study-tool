package main

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/ZacharyWM/greek-study-tool/server/database"
	"github.com/ZacharyWM/greek-study-tool/server/router"
)

func main() {
	appDir := filepath.Dir(os.Args[0])
	dir, err := filepath.Abs(appDir)
	if err != nil {
		panic(err)
	}
	dir = strings.TrimSuffix(dir, "tmp") // so it work with 'air' hot reloader
	dir = strings.TrimSuffix(dir, "cmd") // so it works from debugger

	database.InitDB()
	database.RunMigrations()

	r := router.New(dir)

	r.Run() // runs on env var PORT, or default 8080
}
