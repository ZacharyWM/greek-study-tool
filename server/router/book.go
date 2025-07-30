package router

import (
	"net/http"
	"strconv"

	"github.com/ZacharyWM/greek-study-tool/server/service"
	"github.com/gin-gonic/gin"
)

func getBooksHandler(c *gin.Context) {
	books, err := service.GetBooks()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve books"})
		return
	}

	c.JSON(http.StatusOK, books)
}

func getChaptersHandler(c *gin.Context) {
	bookID, err := strconv.Atoi(c.Param("bookId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bookId is required"})
		return
	}

	chapters, err := service.GetChapters(bookID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve chapters"})
		return
	}

	c.JSON(http.StatusOK, chapters)
}

func getVersesHandler(c *gin.Context) {
	chapterID, err := strconv.Atoi(c.Param("chapterId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "chapterId is required"})
		return
	}

	verses, err := service.GetVerses(chapterID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve verses"})
		return
	}

	c.JSON(http.StatusOK, verses)
}

func getVersesHandlerWithWords(c *gin.Context) {
	startId, err := strconv.Atoi(c.Query("startId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "startId is required"})
		return
	}
	endId, err := strconv.Atoi(c.Query("endId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "endId is required"})
		return
	}

	verses, err := service.GetVersesWithWords(startId, endId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve verses"})
		return
	}

	c.JSON(http.StatusOK, verses)
}

func getStrongsWordHandler(c *gin.Context) {
	code := c.Param("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "code is required"})
		return
	}

	strongsWord, err := service.GetStrongsWord(code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve strongs word"})
		return
	}

	c.JSON(http.StatusOK, strongsWord)
}

func getStrongsWordByTextHandler(c *gin.Context) {
	text := c.Param("text")
	if text == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "text is required"})
		return
	}

	strongsWord, err := service.GetStrongsWordByText(text)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve strongs word by text"})
		return
	}

	c.JSON(http.StatusOK, strongsWord)
}
