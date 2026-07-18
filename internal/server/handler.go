package server

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/qdm12/gluetun/internal/models"
	"github.com/qdm12/gluetun/internal/server/middlewares/auth"
	"github.com/qdm12/gluetun/internal/server/middlewares/log"
)

func newHandler(ctx context.Context, logger Logger, logging bool,
	authSettings auth.Settings,
	buildInfo models.BuildInformation,
	vpnLooper VPNLooper,
	pf PortForwarding,
	dnsLooper DNSLoop,
	updaterLooper UpdaterLooper,
	publicIPLooper PublicIPLoop,
	storage Storage,
	ipv6Supported bool,
) (httpHandler http.Handler, err error) {
	apiHandler := &apiHandler{}

	vpn := newVPNHandler(ctx, vpnLooper, storage, ipv6Supported, logger)
	openvpn := newOpenvpnHandler(ctx, vpnLooper, logger)
	dns := newDNSHandler(ctx, dnsLooper, logger)
	updater := newUpdaterHandler(ctx, updaterLooper, logger)
	publicip := newPublicIPHandler(publicIPLooper, logger)
	portForward := newPortForwardHandler(ctx, pf, logger)

	apiHandler.v0 = newHandlerV0(ctx, logger, vpnLooper, dnsLooper, updaterLooper)
	apiHandler.v1 = newHandlerV1(logger, buildInfo, vpn, openvpn, dns, updater, publicip, portForward)

	authMiddleware, err := auth.New(authSettings, logger)
	if err != nil {
		return nil, fmt.Errorf("creating auth middleware: %w", err)
	}

	middlewares := []func(http.Handler) http.Handler{
		authMiddleware,
		log.New(logger, logging),
	}
	var api http.Handler = apiHandler
	for _, middleware := range middlewares {
		api = middleware(api)
	}

	return &handler{
		api: api,
		ui:  newUIHandler("web"),
	}, nil
}

// handler serves the control server API on the same routes as
// upstream gluetun, with the auth and log middlewares applied, and
// serves the web UI single page application for all other paths,
// without authentication.
type handler struct {
	api http.Handler
	ui  http.Handler
}

func (h *handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if isAPIPath(r.URL.Path) {
		h.api.ServeHTTP(w, r)
		return
	}
	h.ui.ServeHTTP(w, r)
}

// v0Paths are the unversioned API paths, see handlerv0.go.
var v0Paths = map[string]struct{}{ //nolint:gochecknoglobals
	"/version":                 {},
	"/openvpn/actions/restart": {},
	"/unbound/actions/restart": {},
	"/openvpn/portforwarded":   {},
	"/openvpn/settings":        {},
	"/updater/restart":         {},
}

func isAPIPath(path string) bool {
	path = strings.TrimSuffix(path, "/")
	if path == "/v1" || strings.HasPrefix(path, "/v1/") {
		return true
	}
	_, ok := v0Paths[path]
	return ok
}

type apiHandler struct {
	v0 http.Handler
	v1 http.Handler
}

func (h *apiHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	r.RequestURI = strings.TrimSuffix(r.RequestURI, "/")
	if !strings.HasPrefix(r.RequestURI, "/v1/") && r.RequestURI != "/v1" {
		h.v0.ServeHTTP(w, r)
		return
	}
	r.RequestURI = strings.TrimPrefix(r.RequestURI, "/v1")
	h.v1.ServeHTTP(w, r)
}

func newUIHandler(dir string) http.Handler {
	return &uiHandler{
		dir:        dir,
		fileServer: http.FileServer(http.Dir(dir)),
	}
}

type uiHandler struct {
	dir        string
	fileServer http.Handler
}

func (h *uiHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	cleanPath := filepath.Clean("/" + r.URL.Path)
	stat, err := os.Stat(filepath.Join(h.dir, cleanPath))
	if err == nil && !stat.IsDir() {
		h.fileServer.ServeHTTP(w, r)
		return
	}
	// Fallback to index.html for the single page application routes.
	http.ServeFile(w, r, filepath.Join(h.dir, "index.html"))
}
