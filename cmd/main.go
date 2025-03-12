package main

import (
	"encoding/gob"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/ZacharyWM/greek-study-tool/handlers/callback"
	"github.com/ZacharyWM/greek-study-tool/handlers/login"
	"github.com/ZacharyWM/greek-study-tool/handlers/logout"
	"github.com/ZacharyWM/greek-study-tool/handlers/user"
	"github.com/ZacharyWM/greek-study-tool/platform/authenticator"
	"github.com/ZacharyWM/greek-study-tool/platform/middleware"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Failed to load the env vars: %v", err)
	}

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

	// r.Static("/public", "web/static")
	// r.LoadHTMLGlob("web/template/*")

	auth, err := authenticator.New()
	if err != nil {
		log.Fatalf("Failed to initialize the authenticator: %v", err)
	}

	// router.GET("/", home.Handler)
	r.GET("/login", login.Handler(auth))
	r.GET("/callback", callback.Handler(auth))
	r.GET("/user", middleware.IsAuthenticated, user.Handler)
	r.GET("/logout", logout.Handler)

	r.NoRoute(func(c *gin.Context) {
		c.Status(http.StatusNotFound)
	})

	r.Run() // listen and serve on port 8080
}
