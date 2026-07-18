package server

import (
	"fmt"

	"github.com/qdm12/gluetun/internal/constants"
	"github.com/qdm12/gluetun/internal/models"
)

type statusWrapper struct {
	Status string `json:"status"`
	// DisableFirewall optionally turns the firewall kill-switch off
	// when stopping the VPN with status user-stopped.
	DisableFirewall bool `json:"disable_firewall,omitempty"`
}

func (sw *statusWrapper) getStatus() (status models.LoopStatus, err error) {
	status = models.LoopStatus(sw.Status)
	switch status {
	case constants.Stopped, constants.Running,
		constants.UserStopped, constants.UserRunning:
		return status, nil
	default:
		return "", fmt.Errorf("invalid status: %s: possible values are: %s, %s",
			sw.Status, constants.Stopped, constants.Running)
	}
}

type portsWrapper struct {
	Port  uint16   `json:"port"` // TODO v4 remove
	Ports []uint16 `json:"ports"`
}

type outcomeWrapper struct {
	Outcome string `json:"outcome"`
}
