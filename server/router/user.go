package router

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/ZacharyWM/greek-study-tool/server/auth"
	"github.com/ZacharyWM/greek-study-tool/server/database"
	"github.com/ZacharyWM/greek-study-tool/server/service"
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

// upsertUserHandler for the user endpoint
func upsertUserHandler(c *gin.Context) {
	ctx := c.Request.Context()
	jwt := c.GetHeader("Authorization")

	userInfo, err := getAuth0UserInfo(jwt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	user, err := service.GetUserByIdpID(ctx, userInfo.Sub)

	upsertUser := service.User{
		IdpID:         userInfo.Sub,
		FirstName:     userInfo.GivenName,
		LastName:      userInfo.FamilyName,
		Nickname:      userInfo.Nickname,
		Name:          userInfo.Name,
		Picture:       userInfo.Picture,
		Email:         userInfo.Email,
		EmailVerified: userInfo.EmailVerified,
	}

	insert := err != nil || user.ID == 0

	if insert {
		userID, err := service.InsertUser(ctx, upsertUser)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"userId": userID})
		return
	}

	err = service.UpdateUserByIdpID(ctx, upsertUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"userId": user.ID})
}

// getAuth0UserInfo fetches the user information from Auth0's userinfo endpoint
func getAuth0UserInfo(jwt string) (Auth0UserInfo, error) {
	var userInfo Auth0UserInfo

	req, err := http.NewRequest("GET", auth.AUTH0_USER_INFO_URL, nil)
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

func getUserHandler(c *gin.Context) {
	id := c.Param("id")

	// TODO - move to a data/service layer
	var user User
	err := database.DB.QueryRow("SELECT id, name FROM users WHERE id = $1", id).Scan(&user.ID, &user.Name)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}
