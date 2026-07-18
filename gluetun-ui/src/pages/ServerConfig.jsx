import { useState } from 'react';
import { useServer } from '../context/ServerContext';

const ServerConfig = () => {
  const { serverUrl, setServerUrl, isConnected, connectionError, checkConnection } = useServer();
  const [inputUrl, setInputUrl] = useState(serverUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (inputUrl && !inputUrl.startsWith('/')) {
        new URL(inputUrl); // validate absolute URLs
      }
      setServerUrl(inputUrl);
      setTimeout(() => {
        setLoading(false);
        if (isConnected) {
          setSuccess('Connected to gluetun control server');
        } else {
          setError(connectionError || 'Failed to connect to gluetun control server');
        }
      }, 1000);
    } catch {
      setError('Invalid URL format');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl text-fog">Server</h1>

      {error && <div className="alert-error animate-fade-up">{error}</div>}
      {success && <div className="alert-success animate-fade-up">{success}</div>}

      <section className="card animate-fade-up">
        <h2 className="card-title mb-4">Control server URL</h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="serverUrl" className="label-xs block mb-1.5">
            API endpoint
          </label>
          <input
            type="text"
            id="serverUrl"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="input font-mono"
            placeholder="same origin"
          />
          <p className="text-xs text-fog-mute mt-1.5">
            Leave empty when the UI is served by gluetun itself, or set a full URL like{' '}
            <code className="font-mono text-fog-dim">http://localhost:8000</code>
          </p>

          <div className="flex items-center justify-between mt-5">
            <div className="flex items-center gap-2 text-sm">
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-signal' : 'bg-danger'}`} />
              <span className="text-fog-dim">
                {isConnected ? 'connected' : 'disconnected'}
                {connectionError && <span className="ml-2 text-danger text-xs">({connectionError})</span>}
              </span>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={checkConnection} className="btn-ghost text-xs" disabled={loading}>
                Test
              </button>
              <button type="submit" className="btn-primary text-xs" disabled={loading}>
                {loading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="card animate-fade-up">
        <h2 className="card-title mb-3">Troubleshooting</h2>
        <ul className="list-disc pl-5 text-sm text-fog-dim space-y-1.5">
          <li>Make sure the gluetun control server is enabled and running</li>
          <li>Verify port 8000 is exposed if accessing from outside docker</li>
          <li>The API is served on the same routes as upstream gluetun, e.g. <code className="font-mono">/v1/version</code></li>
          <li>
            Test directly:{' '}
            <code className="font-mono bg-ink-900 border border-ink-600 px-2 py-0.5 rounded text-xs">
              curl {serverUrl}/v1/version
            </code>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default ServerConfig;
