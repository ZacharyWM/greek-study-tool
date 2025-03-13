package user

import (
	"net/http"

	"github.com/ZacharyWM/greek-study-tool/database"
	"github.com/ZacharyWM/greek-study-tool/models"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// Handler for the user endpoint
func Handler(c *gin.Context) {
	session := sessions.Default(c)
	profile := session.Get("profile")

	// If profile doesn't exist in session, return empty response
	if profile == nil {
		c.JSON(http.StatusOK, gin.H{})
		return
	}

	// Convert profile to map
	profileMap, ok := profile.(map[string]interface{})
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user profile"})
		return
	}

	// Get user name from profile
	name, ok := profileMap["name"].(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user name"})
		return
	}

	// Check if user exists
	var user models.User
	err := database.DB.QueryRow("SELECT id, name FROM users WHERE name = $1", name).Scan(&user.ID, &user.Name)
	if err != nil {
		// User doesn't exist, create new user
		err = database.DB.QueryRow("INSERT INTO users (name) VALUES ($1) RETURNING id", name).Scan(&user.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
		user.Name = name
	}

	// Return user data
	c.JSON(http.StatusOK, user)
}

// GetUserByID retrieves a user by ID from the database
func GetUserByID(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	err := database.DB.QueryRow("SELECT id, name FROM users WHERE id = $1", id).Scan(&user.ID, &user.Name)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}
