package models

type FilterChoices struct {
	Countries  []string
	Regions    []string
	Cities     []string
	Categories []string
	ISPs       []string
	Names      []string
	Hostnames  []string
}

// ServerLocation is an aggregated view of the available servers
// for a provider, grouped by country, region and city. Providers
// only set a subset of these fields, for example Private Internet
// Access sets the region but not the country.
type ServerLocation struct {
	Country string `json:"country,omitempty"`
	Region  string `json:"region,omitempty"`
	City    string `json:"city,omitempty"`
	Servers int    `json:"servers"`
}
