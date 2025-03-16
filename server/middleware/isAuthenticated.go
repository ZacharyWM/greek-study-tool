package middleware

import (
	"log"
	"net/http"
	"strings"

	"github.com/ZacharyWM/greek-study-tool/server/authenticator"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/gin-gonic/gin"
)

// JwtAuth is a middleware that will check the validity of our JWT.
func JwtAuth() gin.HandlerFunc {
	jwtValidator := authenticator.GetJwtValidator()

	return func(ctx *gin.Context) {
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			ctx.JSON(http.StatusUnauthorized, gin.H{"message": "Authorization header missing or invalid"})
			ctx.Abort()
			return
		}

		token, err := jwtValidator.ValidateToken(
			ctx.Request.Context(),
			strings.TrimPrefix(authHeader, "Bearer "),
		)
		if err != nil {
			log.Printf("encountered error while validating JWT: %v", err)
			ctx.JSON(http.StatusUnauthorized, gin.H{"message": "Failed to validate JWT"})
			ctx.Abort()
			return
		}

		claims := token.(*validator.ValidatedClaims)
		ctx.Set("claims", claims)

		ctx.Next()
	}
}
