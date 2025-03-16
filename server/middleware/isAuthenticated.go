package middleware

import (
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/ZacharyWM/greek-study-tool/server/auth0const"
	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/gin-gonic/gin"
)

// JwtAuth is a middleware that will check the validity of our JWT.
func JwtAuth() gin.HandlerFunc {
	jwtValidator := getJwtValidator()

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

func getJwtValidator() *validator.Validator {
	issuerURL, err := url.Parse("https://" + auth0const.AUTH0_DOMAIN + "/")
	if err != nil {
		log.Fatalf("Failed to parse the issuer url: %v", err)
	}

	provider := jwks.NewCachingProvider(issuerURL, 5*time.Minute)

	jwtValidator, err := validator.New(
		provider.KeyFunc,
		validator.RS256,
		issuerURL.String(),
		[]string{
			auth0const.AUTH0_AUDIENCE,
			auth0const.AUTH0_USER_INFO_URL,
		},
	)
	if err != nil {
		log.Fatalf("Failed to set up the jwt validator")
	}
	return jwtValidator
}
