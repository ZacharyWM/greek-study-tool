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
	vids, ok := c.GetQueryArray("verseId")
	if !ok || len(vids) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "verseIds is required"})
		return
	}

	verseIDs := make([]int, len(vids))
	for i, id := range vids {
		vid, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "verseIds must be integers"})
			return
		}
		verseIDs[i] = vid
	}

	verses, err := service.GetVersesWithWords(verseIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve verses"})
		return
	}

	c.JSON(http.StatusOK, verses)
}
