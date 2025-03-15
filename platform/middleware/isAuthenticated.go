package middleware

import (
	"context"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/ZacharyWM/greek-study-tool/platform/auth0const"
	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

type CustomClaims struct {
	Scope string `json:"scope"`
}

// Needed to satify validator.CustomClaims interface.
func (c CustomClaims) Validate(ctx context.Context) error {
	return nil
}

// Needed to satify validator.CustomClaims interface.
func (c CustomClaims) HasScope(expectedScope string) bool {
	return false
	// result := strings.Split(c.Scope, " ")
	// for i := range result {
	// 	if result[i] == expectedScope {
	// 		return true
	// 	}
	// }

	// return false
}

// IsAuthenticated is a middleware that checks if
// the user has already been authenticated previously.
func IsAuthenticated(ctx *gin.Context) {
	if sessions.Default(ctx).Get("profile") == nil {
		ctx.Redirect(http.StatusSeeOther, "/")
	} else {
		ctx.Next()
	}
}

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

		// TODO - probably don't care about this
		claims := token.(*validator.ValidatedClaims)
		ctx.Set("claims", claims)

		// TODO - probably don't care about this
		if customClaims, ok := claims.CustomClaims.(*CustomClaims); ok {
			session := sessions.Default(ctx)
			session.Set("auth_scope", customClaims.Scope)
			session.Save()
		}

		ctx.JSON(http.StatusOK, gin.H{"message": "Token is valid", "claims": claims})

		// Continue to the next middleware/handler
		// ctx.Next()
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
			auth0const.AUTH0_AUDIENCE_1,
			auth0const.AUTH0_AUDIENCE_2,
		},
		// TODO - can I get get of validator.WithCustomClaims?
		validator.WithCustomClaims(
			func() validator.CustomClaims {
				return &CustomClaims{}
			},
		),
		// TODO - what the heck is this?
		validator.WithAllowedClockSkew(time.Minute),
	)
	if err != nil {
		log.Fatalf("Failed to set up the jwt validator")
	}
	return jwtValidator
}
