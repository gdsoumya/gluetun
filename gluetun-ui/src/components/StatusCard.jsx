import { useState, useEffect, useCallback } from 'react';
import { useServer } from '../context/ServerContext';

export const statusTone = (status) => {
  if (!status) return 'unknown';
  if (status.includes('running')) return 'up';
  if (status === 'starting' || status === 'stopping') return 'busy';
  return 'down';
};

export const StatusPill = ({ status, loading }) => {
  const tone = loading ? 'busy' : statusTone(status);
  const styles = {
    up: 'border-signal/30 bg-signal-dark text-signal',
    down: 'border-danger/30 bg-danger-dark text-danger',
    busy: 'border-warn/30 bg-warn-dark text-warn',
    unknown: 'border-ink-500 bg-ink-700 text-fog-mute',
  }[tone];
  const dot = {
    up: 'bg-signal animate-pulse-ring',
    down: 'bg-danger',
    busy: 'bg-warn animate-pulse',
    unknown: 'bg-fog-mute',
  }[tone];

  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border text-xs font-mono ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {loading ? 'working' : status || 'unknown'}
    </span>
  );
};

const StatusCard = ({ title, endpoint, description, onStatusChange }) => {
  const { fetchData } = useServer();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const toggleStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const running = status.includes('running');
      const newStatus = running ? 'user-stopped' : 'user-running';
      const data = await fetchData(endpoint, 'PUT', { status: newStatus });
      const display = newStatus.replace('user-', '');
      setStatus(display);
      onStatusChange?.(display, data?.outcome);
    } catch {
      setError('failed to update status');
    } finally {
      setLoading(false);
    }
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

      <div className="flex justify-between items-center mt-4">
        <button onClick={fetchStatus} className="btn-ghost text-xs px-3 py-1.5" disabled={loading}>
          Refresh
        </button>
        <button
          onClick={toggleStatus}
          className={`${running ? 'btn-danger' : 'btn-start'} text-xs px-3 py-1.5`}
          disabled={loading}
        >
          {running ? 'Stop' : 'Start'}
        </button>
      </div>
    </div>
  );
};

export default StatusCard;
