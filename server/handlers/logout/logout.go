package logout

import (
	"net/http"
	"net/url"

	auth "github.com/ZacharyWM/greek-study-tool/server/auth"
	"github.com/gin-gonic/gin"
)

// Handler for our logout.
func Handler(ctx *gin.Context) {
	logoutUrl, err := url.Parse("https://" + auth.AUTH0_DOMAIN + "/v2/logout")
	if err != nil {
		ctx.String(http.StatusInternalServerError, err.Error())
		return
	}

	scheme := "http"
	if ctx.Request.TLS != nil {
		scheme = "https"
	}

	returnTo, err := url.Parse(scheme + "://" + ctx.Request.Host)
	if err != nil {
		ctx.String(http.StatusInternalServerError, err.Error())
		return
	}

	parameters := url.Values{}
	parameters.Add("returnTo", returnTo.String())
	parameters.Add("client_id", auth.AUTH0_CLIENT_ID)
	logoutUrl.RawQuery = parameters.Encode()

	ctx.Redirect(http.StatusTemporaryRedirect, logoutUrl.String())
}
