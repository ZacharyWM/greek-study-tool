package router

import (
	"log"
	"net/http"
	"path"

	"github.com/ZacharyWM/greek-study-tool/server/auth"
	"github.com/ZacharyWM/greek-study-tool/server/middleware"
	"github.com/gin-gonic/gin"
)

func New(appDir string) *gin.Engine {
	r := gin.Default()

	appPath := path.Join(appDir, "frontend/build/App.js")
	htmlPath := path.Join(appDir, "frontend/index.html")

	r.StaticFile("/assets/app.js", appPath)
	r.StaticFile("/assets/output.css", path.Join(appDir, "frontend/build/style.css"))
	r.StaticFile("/assets/SBLBibLit.ttf", path.Join(appDir, "frontend/build/SBLBibLit.ttf"))
	r.StaticFile("/", htmlPath)

	r.GET("/healthcheck", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	auth, err := auth.New()
	if err != nil {
		log.Fatalf("Failed to initialize the authenticator: %v", err)
	}

	r.GET("/login", loginHandler(auth))
	r.GET("/callback", callbackHandler(auth))
	r.GET("/logout", logoutHandler)

	secureRouter := r.Group("/api", middleware.JwtAuth())

	secureRouter.GET("/user/:id", getUserHandler)
	secureRouter.POST("/user", upsertUserHandler)

	secureRouter.POST("/analyses", createAnalysisHandler)
	secureRouter.PATCH("/analyses/:id", updateAnalysisHandler)
	secureRouter.GET("/analyses/:id", getAnalysisHandler)
	secureRouter.GET("/analyses", getUserAnalysesHandler)

	r.NoRoute(func(c *gin.Context) {
		c.File(path.Join(appDir, "frontend/index.html"))
	})

	return r
}
