package main

import (
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	appDir := filepath.Dir(os.Args[0])
	dir, err := filepath.Abs(appDir)
	if err != nil {
		panic(err)
	}
	dir = strings.TrimSuffix(dir, "tmp")

	appPath := path.Join(dir, "frontend/build/App.js")
	htmlPath := path.Join(dir, "frontend/index.html")

	r.StaticFile("/assets/app.js", appPath)
	r.StaticFile("/assets/output.css", path.Join(dir, "frontend/build/style.css"))
	r.StaticFile("/", htmlPath)

	r.NoRoute(func(c *gin.Context) {
		c.Status(http.StatusNotFound)
	})

	r.Run() // listen and serve on port 8080
}
