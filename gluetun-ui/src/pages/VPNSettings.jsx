import { useState, useEffect, useMemo, useCallback } from 'react';
import { useServer } from '../context/ServerContext';
import { StatusPill } from '../components/StatusCard';
import MultiSelect from '../components/MultiSelect';

const VPNSettings = () => {
  const { fetchData, isConnected } = useServer();
  const [settings, setSettings] = useState(null);
  const [choices, setChoices] = useState(null);
  const [choicesError, setChoicesError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [vpnStatus, setVPNStatus] = useState(null);
  const [portForwarded, setPortForwarded] = useState(null);

  // draft selection while editing
  const [draftCountries, setDraftCountries] = useState([]);
  const [draftRegions, setDraftRegions] = useState([]);
  const [draftCities, setDraftCities] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchData('/v1/vpn/settings');
      setSettings(data);
    } catch {
      setError('Failed to fetch VPN settings');
    } finally {
      setLoading(false);
    }
    fetchData('/v1/vpn/status')
      .then((d) => setVPNStatus(d.status ?? d.Status))
      .catch(() => {});
    // /v1/portforward replaced /v1/openvpn/portforwarded in v3.41
    // (the old route 301-redirects, which breaks behind a path prefix proxy)
    fetchData('/v1/portforward')
      .then((d) => setPortForwarded(d.port ?? d.ports?.[0]))
      .catch(() => {});
    fetchData('/v1/vpn/serverchoices')
      .then((d) => {
        setChoices(d);
        setChoicesError(d?.locations?.length ? null : 'empty');
      })
      .catch((e) => {
        setChoices(null);
        setChoicesError(/401/.test(e.message) ? 'unauthorized' : 'unavailable');
      });
  }, [fetchData]);

  useEffect(() => {
    if (isConnected) fetchAll();
  }, [isConnected, fetchAll]);

  const selection = settings?.provider?.server_selection;
  const locations = useMemo(() => choices?.locations || [], [choices]);

  // Aggregated option lists derived from the locations matrix.
  const countryOptions = useMemo(() => {
    const counts = new Map();
    for (const l of locations) {
      if (!l.country) continue;
      counts.set(l.country, (counts.get(l.country) || 0) + l.servers);
    }
    return [...counts.entries()].map(([value, n]) => ({ value, hint: `${n} srv` }));
  }, [locations]);

  const regionOptions = useMemo(() => {
    const counts = new Map();
    for (const l of locations) {
      if (!l.region) continue;
      counts.set(l.region, (counts.get(l.region) || 0) + l.servers);
    }
    return [...counts.entries()].map(([value, n]) => ({ value, hint: `${n} srv` }));
  }, [locations]);

  // Cities cascade: restrict to selected countries when any are picked.
  const cityOptions = useMemo(() => {
    const counts = new Map();
    for (const l of locations) {
      if (!l.city) continue;
      if (draftCountries.length > 0 && !draftCountries.includes(l.country)) continue;
      counts.set(l.city, (counts.get(l.city) || 0) + l.servers);
    }
    return [...counts.entries()].map(([value, n]) => ({ value, hint: `${n} srv` }));
  }, [locations, draftCountries]);

  const startEdit = () => {
    setDraftCountries(selection?.countries || []);
    setDraftRegions(selection?.regions || []);
    setDraftCities(selection?.cities || []);
    setEditMode(true);
    setSuccess(null);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = {
        ...settings,
        provider: {
          ...settings.provider,
          server_selection: {
            ...settings.provider.server_selection,
            countries: draftCountries,
            regions: draftRegions,
            cities: draftCities,
          },
        },
      };
      await fetchData('/v1/vpn/settings', 'PUT', updated);
      setSuccess('Server selection applied — the VPN reconnects with the new filters');
      setEditMode(false);
      await fetchAll();
    } catch {
      setError('Failed to update VPN settings');
    } finally {
      setSaving(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="card text-center py-12 animate-fade-up">
        <h2 className="font-display text-xl text-danger mb-2">Not connected to gluetun</h2>
        <p className="text-fog-dim text-sm">Check the server configuration page</p>
      </div>
    );
  }

  if (loading || !settings) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-ink-500 border-t-signal" />
      </div>
    );
  }

  const summaryChips = (values, emptyLabel) =>
    values?.length ? (
      <div className="flex flex-wrap gap-1.5 mt-1">
        {values.map((v) => (
          <span key={v} className="chip">{v}</span>
        ))}
      </div>
    ) : (
      <p className="text-sm text-fog-mute mt-1">{emptyLabel}</p>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-fog">VPN</h1>
        <StatusPill status={vpnStatus} />
      </div>

      {error && <div className="alert-error animate-fade-up">{error}</div>}
      {success && <div className="alert-success animate-fade-up">{success}</div>}

      <section className="card animate-fade-up">
        <h2 className="card-title mb-4">General</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="label-xs">Type</p>
            <p className="font-mono text-sm mt-1">{settings.type}</p>
          </div>
          <div>
            <p className="label-xs">Provider</p>
            <p className="font-mono text-sm mt-1">{settings.provider?.name}</p>
          </div>
          <div>
            <p className="label-xs">Forwarded port</p>
            <p className="font-mono text-sm mt-1">
              {portForwarded ? (
                <span className="text-signal">{portForwarded}</span>
              ) : (
                <span className="text-fog-mute">none</span>
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="card animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">Server selection</h2>
          {choices && (
            <span className="font-mono text-xs text-fog-mute">
              {locations.reduce((n, l) => n + l.servers, 0)} servers · {choices.provider}
            </span>
          )}
        </div>

        {!editMode ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="label-xs">Countries</p>
                {summaryChips(selection?.countries, 'any country')}
              </div>
              {(selection?.regions?.length > 0 || regionOptions.length > 0) && (
                <div>
                  <p className="label-xs">Regions</p>
                  {summaryChips(selection?.regions, 'any region')}
                </div>
              )}
              <div>
                <p className="label-xs">Cities</p>
                {summaryChips(selection?.cities, 'any city')}
              </div>
              <div>
                <p className="label-xs">Protocol</p>
                <p className="font-mono text-sm mt-1">
                  {selection?.openvpn?.protocol || settings.type}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button onClick={startEdit} className="btn-primary text-xs">
                Edit selection
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {choicesError === 'unauthorized' && (
              <p className="text-sm text-warn">
                The server list endpoint returned 401 — add{' '}
                <code className="font-mono text-xs">"GET /v1/vpn/serverchoices"</code> to the
                routes of the control server auth config (config.toml) and restart gluetun.
              </p>
            )}
            {choicesError === 'empty' && (
              <p className="text-sm text-warn">
                No server list for this provider (custom provider has none) — type filter
                values manually.
              </p>
            )}
            {choicesError === 'unavailable' && (
              <p className="text-sm text-warn">
                Server list unavailable — type filter values manually.
              </p>
            )}
            {(countryOptions.length > 0 || regionOptions.length === 0) && (
              <MultiSelect
                label="Countries"
                options={countryOptions}
                selected={draftCountries}
                onChange={(v) => {
                  setDraftCountries(v);
                  // drop cities that no longer belong to a selected country
                  if (v.length > 0) {
                    const valid = new Set(
                      locations.filter((l) => v.includes(l.country)).map((l) => l.city),
                    );
                    setDraftCities((cities) => cities.filter((c) => valid.has(c)));
                  }
                }}
                placeholder="any country — type to search"
              />
            )}
            {regionOptions.length > 0 && (
              <MultiSelect
                label="Regions"
                options={regionOptions}
                selected={draftRegions}
                onChange={setDraftRegions}
                placeholder="any region — type to search"
              />
            )}
            {cityOptions.length > 0 && (
              <MultiSelect
                label={draftCountries.length > 0 ? 'Cities (within selected countries)' : 'Cities'}
                options={cityOptions}
                selected={draftCities}
                onChange={setDraftCities}
                placeholder="any city — type to search"
              />
            )}
            <p className="text-xs text-fog-mute">
              Leave a filter empty to allow all. Saving reconnects the VPN with the new
              selection.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditMode(false)} className="btn-ghost text-xs" disabled={saving}>
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary text-xs" disabled={saving}>
                {saving ? 'Applying…' : 'Apply & reconnect'}
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="card animate-fade-up">
        <h2 className="card-title mb-4">OpenVPN</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="label-xs">Version</p>
            <p className="font-mono text-sm mt-1">{settings.openvpn?.version}</p>
          </div>
          <div>
            <p className="label-xs">Interface</p>
            <p className="font-mono text-sm mt-1">{settings.openvpn?.interface}</p>
          </div>
          <div>
            <p className="label-xs">Process user</p>
            <p className="font-mono text-sm mt-1">{settings.openvpn?.process_user}</p>
          </div>
          <div>
            <p className="label-xs">Verbosity</p>
            <p className="font-mono text-sm mt-1">{settings.openvpn?.verbosity}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VPNSettings;
