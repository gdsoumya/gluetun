import { useState, useEffect, useCallback } from 'react';
import { useServer } from '../context/ServerContext';

export const statusTone = (status) => {
  if (!status) return 'unknown';
  if (status.includes('running')) return 'up';
  if (status === 'starting' || status === 'stopping') return 'busy';
  if (status === 'completed') return 'done';
  return 'down';
};

export const StatusPill = ({ status, loading }) => {
  const tone = loading ? 'busy' : statusTone(status);
  const styles = {
    up: 'border-signal/30 bg-signal-dark text-signal',
    down: 'border-danger/30 bg-danger-dark text-danger',
    busy: 'border-warn/30 bg-warn-dark text-warn',
    done: 'border-info/30 bg-info-dark text-info',
    unknown: 'border-ink-500 bg-ink-700 text-fog-mute',
  }[tone];
  const dot = {
    up: 'bg-signal animate-pulse-ring',
    down: 'bg-danger',
    busy: 'bg-warn animate-pulse',
    done: 'bg-info',
    unknown: 'bg-fog-mute',
  }[tone];

  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border text-xs font-mono ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {loading ? 'working' : status || 'unknown'}
    </span>
  );
};

const StatusCard = ({ title, endpoint, description, onStatusChange, stopFirewallOption }) => {
  const { fetchData } = useServer();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmingStop, setConfirmingStop] = useState(false);
  const [disableFirewall, setDisableFirewall] = useState(false);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchData(endpoint);
      setStatus(data.status ?? data.Status ?? '');
    } catch {
      setError('failed to fetch status');
    } finally {
      setLoading(false);
    }
  }, [endpoint, fetchData]);

  const applyStatus = async (body) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchData(endpoint, 'PUT', body);
      const display = body.status.replace('user-', '');
      setStatus(display);
      onStatusChange?.(display, data?.outcome);
    } catch {
      setError('failed to update status');
    } finally {
      setLoading(false);
      setConfirmingStop(false);
    }
  };

  const toggleStatus = () => {
    if (!status.includes('running')) {
      applyStatus({ status: 'user-running' });
      return;
    }
    if (stopFirewallOption && !confirmingStop) {
      setDisableFirewall(false);
      setConfirmingStop(true);
      return;
    }
    applyStatus({ status: 'user-stopped', disable_firewall: disableFirewall });
  };

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const running = status.includes('running');

  return (
    <div className="card animate-fade-up">
      <div className="flex justify-between items-start mb-1">
        <h2 className="card-title">{title}</h2>
        <StatusPill status={status} loading={loading} />
      </div>
      {description && <p className="text-sm text-fog-mute mb-4">{description}</p>}

      {error && <p className="text-danger text-xs font-mono mb-3">{error}</p>}

      {confirmingStop && (
        <div className="mt-4 rounded border border-danger/30 bg-danger-dark/40 p-3 space-y-3">
          <label className="flex items-start gap-2 text-xs text-fog-dim cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 accent-current"
              checked={disableFirewall}
              onChange={(e) => setDisableFirewall(e.target.checked)}
            />
            <span>
              Also turn off the firewall kill-switch, allowing traffic outside the VPN tunnel
              while stopped
            </span>
          </label>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setConfirmingStop(false)}
              className="btn-ghost text-xs px-3 py-1.5"
              disabled={loading}
            >
              Cancel
            </button>
            <button onClick={toggleStatus} className="btn-danger text-xs px-3 py-1.5" disabled={loading}>
              Stop VPN
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <button onClick={fetchStatus} className="btn-ghost text-xs px-3 py-1.5" disabled={loading}>
          Refresh
        </button>
        <button
          onClick={toggleStatus}
          className={`${running ? 'btn-danger' : 'btn-start'} text-xs px-3 py-1.5`}
          disabled={loading || confirmingStop}
        >
          {running ? 'Stop' : 'Start'}
        </button>
      </div>
    </div>
  );
};

export default StatusCard;
