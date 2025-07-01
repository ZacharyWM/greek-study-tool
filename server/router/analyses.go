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

func updateAnalysisHandler(c *gin.Context) {
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

	analysisID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid analysis ID"})
		return
	}

	var analysisUpdate service.Analysis
	if err := c.ShouldBindJSON(&analysisUpdate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	analysisUpdate.UserID = userID
	analysisUpdate.ID = analysisID

	err = service.UpdateAnalysis(analysisUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func getAnalysisHandler(c *gin.Context) {
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

	analysisID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid analysis ID"})
		return
	}

	// TODO - Could have query param to determine if we want latest or new.
	if analysisID == 0 {
		analysis, err := service.GetLastUpdatedAnalysis(userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, analysis)
		return
	}

	analysis, err := service.GetAnalysisById(analysisID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, analysis)
}

func getUserAnalysesHandler(c *gin.Context) {
	claims := auth.ClaimsFromContext(c)
	if claims == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: missing claims"})
		return
	}

	idpID := claims.RegisteredClaims.Subject
	userID, err := getUserIDFromIdpID(c, idpID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user ID"})
		return
	}

	analyses, err := service.GetAnalysesForUser(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, analyses)
}

func deleteAnalysisHandler(c *gin.Context) {
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

	analysisID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid analysis ID"})
		return
	}

	err = service.DeleteAnalysis(analysisID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
