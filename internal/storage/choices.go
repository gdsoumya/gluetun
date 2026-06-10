package storage

import (
	"sort"

	"github.com/qdm12/gluetun/internal/configuration/settings/validation"
	"github.com/qdm12/gluetun/internal/constants/providers"
	"github.com/qdm12/gluetun/internal/models"
)

func (s *Storage) GetFilterChoices(provider string) models.FilterChoices {
	if provider == providers.Custom {
		return models.FilterChoices{}
	}

	s.mergedMutex.RLock()
	defer s.mergedMutex.RUnlock()

	serversObject := s.getMergedServersObject(provider)
	servers := serversObject.Servers
	return models.FilterChoices{
		Countries:  validation.ExtractCountries(servers),
		Categories: validation.ExtractCategories(servers),
		Regions:    validation.ExtractRegions(servers),
		Cities:     validation.ExtractCities(servers),
		ISPs:       validation.ExtractISPs(servers),
		Names:      validation.ExtractServerNames(servers),
		Hostnames:  validation.ExtractHostnames(servers),
	}
}

// GetServerLocations returns the list of available locations
// (country/city pairs with their server count) for the provider.
func (s *Storage) GetServerLocations(provider string) (locations []models.ServerLocation) {
	if provider == providers.Custom {
		return nil
	}

	s.mergedMutex.RLock()
	defer s.mergedMutex.RUnlock()

	servers := s.getMergedServersObject(provider).Servers
	indexes := make(map[models.ServerLocation]int, len(servers))
	for _, server := range servers {
		key := models.ServerLocation{
			Country: server.Country,
			Region:  server.Region,
			City:    server.City,
		}
		index, ok := indexes[key]
		if !ok {
			index = len(locations)
			indexes[key] = index
			locations = append(locations, key)
		}
		locations[index].Servers++
	}

	sort.Slice(locations, func(i, j int) bool {
		switch {
		case locations[i].Country != locations[j].Country:
			return locations[i].Country < locations[j].Country
		case locations[i].Region != locations[j].Region:
			return locations[i].Region < locations[j].Region
		default:
			return locations[i].City < locations[j].City
		}
	})
	return locations
}
