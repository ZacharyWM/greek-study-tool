package user

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/ZacharyWM/greek-study-tool/server/auth0const"
	"github.com/ZacharyWM/greek-study-tool/server/database"
	"github.com/gin-gonic/gin"
)

// User represents a user in the system
type User struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Auth0UserInfo struct {
	Sub           string `json:"sub"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Nickname      string `json:"nickname"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	UpdatedAt     string `json:"updated_at"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
}

// Handler for the user endpoint
func Handler(c *gin.Context) {
	jwt := c.GetHeader("Authorization")

	userInfo, err := GetAuth0UserInfo(jwt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// TODO, get user data and save it. Maybe FE can send it.
	c.JSON(http.StatusOK, userInfo)
}

// GetAuth0UserInfo fetches the user information from Auth0's userinfo endpoint
func GetAuth0UserInfo(jwt string) (Auth0UserInfo, error) {
	var userInfo Auth0UserInfo

	req, err := http.NewRequest("GET", auth0const.AUTH0_USER_INFO_URL, nil)
	if err != nil {
		return userInfo, fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Add("Authorization", jwt)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return userInfo, fmt.Errorf("error making request to Auth0: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return userInfo, fmt.Errorf("received non-200 response from Auth0: %d, body: %s", resp.StatusCode, string(body))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return userInfo, fmt.Errorf("error reading response body: %w", err)
	}

	if err := json.Unmarshal(body, &userInfo); err != nil {
		return userInfo, fmt.Errorf("error parsing user info JSON: %w", err)
	}

	return userInfo, nil
}

// GetUserByID retrieves a user by ID from the database
func GetUserByID(c *gin.Context) {
	id := c.Param("id")

	var user User
	err := database.DB.QueryRow("SELECT id, name FROM users WHERE id = $1", id).Scan(&user.ID, &user.Name)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}
