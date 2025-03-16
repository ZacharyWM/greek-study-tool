package auth

import (
	"context"
	"errors"
	"log"
	"net/url"
	"time"

	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
)

// TODO - use env vars
const (
	AUTH0_CLIENT_ID     = "epvq6lnMUVpNxVOYaoYtADPxeFwqgcY0"
	AUTH0_DOMAIN        = "zachsauth.us.auth0.com"
	AUTH0_CLIENT_SECRET = "-"
	AUTH0_CALLBACK_URL  = "https://zachm.dev/callback"

	AUTH0_AUDIENCE      = "https://zachsauth.us.auth0.com/api/v2/"
	AUTH0_USER_INFO_URL = "https://zachsauth.us.auth0.com/userinfo"
)

type Authenticator struct {
	*oidc.Provider
	oauth2.Config
}

func New() (*Authenticator, error) {
	provider, err := oidc.NewProvider(
		context.Background(),
		"https://"+AUTH0_DOMAIN+"/",
	)
	if err != nil {
		return nil, err
	}

	conf := oauth2.Config{
		ClientID:     AUTH0_CLIENT_ID,
		ClientSecret: AUTH0_CLIENT_SECRET,
		RedirectURL:  AUTH0_CALLBACK_URL,
		Endpoint:     provider.Endpoint(),
		Scopes:       []string{oidc.ScopeOpenID, "profile"},
	}

	return &Authenticator{
		Provider: provider,
		Config:   conf,
	}, nil
}

func (a *Authenticator) VerifyIDToken(ctx context.Context, token *oauth2.Token) (*oidc.IDToken, error) {
	rawIDToken, ok := token.Extra("id_token").(string)
	if !ok {
		return nil, errors.New("no id_token field in oauth2 token")
	}

	oidcConfig := &oidc.Config{
		ClientID: a.ClientID,
	}

	return a.Verifier(oidcConfig).Verify(ctx, rawIDToken)
}

func GetJwtValidator() *validator.Validator {
	issuerURL, err := url.Parse("https://" + AUTH0_DOMAIN + "/")
	if err != nil {
		log.Fatalf("Failed to parse the issuer url: %v", err)
	}

	provider := jwks.NewCachingProvider(issuerURL, 5*time.Minute)

	jwtValidator, err := validator.New(
		provider.KeyFunc,
		validator.RS256,
		issuerURL.String(),
		[]string{
			AUTH0_AUDIENCE,
			AUTH0_USER_INFO_URL,
		},
	)
	if err != nil {
		log.Fatalf("Failed to set up the jwt validator")
	}
	return jwtValidator
}
