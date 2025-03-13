package main

import (
	"encoding/gob"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/ZacharyWM/greek-study-tool/database"
	"github.com/ZacharyWM/greek-study-tool/handlers/callback"
	"github.com/ZacharyWM/greek-study-tool/handlers/login"
	"github.com/ZacharyWM/greek-study-tool/handlers/logout"
	"github.com/ZacharyWM/greek-study-tool/handlers/user"
	"github.com/ZacharyWM/greek-study-tool/platform/authenticator"
	"github.com/ZacharyWM/greek-study-tool/platform/middleware"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

func main() {
	database.InitDB()
	database.RunMigrations()

	r := gin.Default()

	appDir := filepath.Dir(os.Args[0])
	dir, err := filepath.Abs(appDir)
	if err != nil {
		panic(err)
	}
	dir = strings.TrimSuffix(dir, "tmp")
	dir = strings.TrimSuffix(dir, "cmd") // so it works from debugger

	appPath := path.Join(dir, "frontend/build/App.js")
	htmlPath := path.Join(dir, "frontend/index.html")

	r.StaticFile("/assets/app.js", appPath)
	r.StaticFile("/assets/output.css", path.Join(dir, "frontend/build/style.css"))
	r.StaticFile("/assets/SBLBibLit.ttf", path.Join(dir, "frontend/build/SBLBibLit.ttf"))
	r.StaticFile("/", htmlPath)

	r.GET("/healthcheck", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	// To store custom types in our cookies,
	// we must first register them using gob.Register
	gob.Register(map[string]interface{}{})

	store := cookie.NewStore([]byte("secret"))
	r.Use(sessions.Sessions("auth-session", store))

	auth, err := authenticator.New()
	if err != nil {
		log.Fatalf("Failed to initialize the authenticator: %v", err)
	}

	r.GET("/login", login.Handler(auth))
	r.GET("/callback", callback.Handler(auth))
	r.GET("/api/user/:id", user.GetUserByID)
	r.GET("/logout", logout.Handler)

	r.GET("/user", middleware.IsAuthenticated, user.Handler)

	r.NoRoute(func(c *gin.Context) {
		c.Status(http.StatusNotFound)
	})

	r.Run() // listen and serve on port 8080
}
