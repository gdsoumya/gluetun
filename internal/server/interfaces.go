package server

import (
	"context"

	"github.com/qdm12/gluetun/internal/configuration/settings"
	"github.com/qdm12/gluetun/internal/models"
)

type VPNLooper interface {
	GetStatus() (status models.LoopStatus)
	ApplyStatus(ctx context.Context, status models.LoopStatus) (
		outcome string, err error)
	GetSettings() (settings settings.VPN)
	SetSettings(ctx context.Context, settings settings.VPN) (outcome string)
	SetFirewall(ctx context.Context, enable bool) error
}

type DNSLoop interface {
	ApplyStatus(ctx context.Context, status models.LoopStatus) (
		outcome string, err error)
	GetStatus() (status models.LoopStatus)
}

type PortForwarding interface {
	GetPortsForwarded() (ports []uint16)
	SetPortsForwarded(ports []uint16) (err error)
}

type PublicIPLoop interface {
	GetData() (data models.PublicIP)
	RunOnce(ctx context.Context) (err error)
}

type Storage interface {
	GetFilterChoices(provider string) models.FilterChoices
	GetServerLocations(provider, vpnType string) (locations []models.ServerLocation)
}
