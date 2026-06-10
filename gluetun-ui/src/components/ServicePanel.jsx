import { useState, useEffect, useCallback } from 'react';
import { useServer } from '../context/ServerContext';
import { StatusPill } from './StatusCard';

/**
 * Full page panel to view and toggle a gluetun service loop
 * (DNS, updater), with an informational footer card.
 */
const ServicePanel = ({ title, endpoint, infoTitle, info, note }) => {
  const { fetchData, isConnected } = useServer();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchData(endpoint);
      setStatus(data.status ?? data.Status ?? '');
    } catch {
      setError(`Failed to fetch ${title} status`);
    } finally {
      setLoading(false);
    }
  }, [endpoint, fetchData, title]);

  useEffect(() => {
    if (isConnected) fetchStatus();
  }, [isConnected, fetchStatus]);

  const handleToggle = async () => {
    const running = status?.includes('running');
    const newStatus = running ? 'stopped' : 'running';
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await fetchData(endpoint, 'PUT', { status: newStatus });
      setStatus(newStatus);
      setSuccess(result?.outcome || `${title} ${newStatus === 'running' ? 'started' : 'stopped'}`);
    } catch {
      setError(`Failed to ${newStatus === 'running' ? 'start' : 'stop'} ${title}`);
    } finally {
      setLoading(false);
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

  const running = status?.includes('running');

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl text-fog">{title}</h1>

      {error && <div className="alert-error animate-fade-up">{error}</div>}
      {success && <div className="alert-success animate-fade-up">{success}</div>}

      <section className="card animate-fade-up">
        <div className="flex justify-between items-center">
          <h2 className="card-title">Service status</h2>
          <StatusPill status={status} loading={loading} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={fetchStatus} disabled={loading} className="btn-ghost text-xs">
            Refresh
          </button>
          <button
            onClick={handleToggle}
            disabled={loading || status === null}
            className={`${running ? 'btn-danger' : 'btn-start'} text-xs`}
          >
            {running ? `Stop ${title}` : `Start ${title}`}
          </button>
        </div>
      </section>

      <section className="card animate-fade-up">
        <h2 className="card-title mb-3">{infoTitle}</h2>
        <p className="text-sm text-fog-dim mb-4">{info}</p>
        <div className="border border-info/30 bg-info-dark rounded-lg px-4 py-3">
          <p className="text-xs text-info">{note}</p>
        </div>
      </section>
    </div>
  );
};

export default ServicePanel;
