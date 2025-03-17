package router

import (
	"net/http"
	"strconv"

	"github.com/ZacharyWM/greek-study-tool/server/auth"
	"github.com/ZacharyWM/greek-study-tool/server/service"
	"github.com/gin-gonic/gin"
)

// getUserIDFromIdpID retrieves the user's internal ID from the IdP ID (sub claim)
func getUserIDFromIdpID(c *gin.Context, idpID string) (int, error) {
	user, err := service.GetUserByIdpID(c.Request.Context(), idpID)
	if err != nil {
		return 0, err
	}
	return user.ID, nil
}

// createAnalysisHandler handles the creation of a new analysis
func createAnalysisHandler(c *gin.Context) {
	claims := auth.ClaimsFromContext(c)
	if claims == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	idpID := claims.RegisteredClaims.Subject
	userID, err := getUserIDFromIdpID(c, idpID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user ID"})
		return
	}

	var analysis service.Analysis
	if err := c.ShouldBindJSON(&analysis); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	analysis.UserID = userID

	id, err := service.InsertAnalysis(analysis)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": id})
}

// updateAnalysisHandler handles updating an existing analysis
func updateAnalysisHandler(c *gin.Context) {
	// Get user's ID from JWT claims
	claims, exists := c.Get("auth")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	idpID := claims.(map[string]interface{})["sub"].(string)
	userID, err := getUserIDFromIdpID(c, idpID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user ID"})
		return
	}

	// Get analysis ID from URL
	analysisID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid analysis ID"})
		return
	}

	// Parse the request body
	var analysisUpdate service.Analysis
	if err := c.ShouldBindJSON(&analysisUpdate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set the user ID and analysis ID
	analysisUpdate.UserID = userID
	analysisUpdate.ID = analysisID

	// Update the analysis
	err = service.UpdateAnalysis(analysisUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// getAnalysisHandler handles retrieving a specific analysis
func getAnalysisHandler(c *gin.Context) {
	// Get user's ID from JWT claims
	claims, exists := c.Get("auth")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	idpID := claims.(map[string]interface{})["sub"].(string)
	userID, err := getUserIDFromIdpID(c, idpID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user ID"})
		return
	}

	// Get analysis ID from URL
	analysisID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid analysis ID"})
		return
	}

	// Get the analysis
	analysis, err := service.GetAnalysisById(analysisID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, analysis)
}
