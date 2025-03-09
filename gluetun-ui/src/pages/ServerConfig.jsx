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
      // Validate URL format
      new URL(inputUrl);
      
      // Update server URL
      setServerUrl(inputUrl);
      
      // Wait a bit for the connection check to complete
      setTimeout(() => {
        setLoading(false);
        if (isConnected) {
          setSuccess('Successfully connected to Gluetun server');
        } else {
          setError(connectionError || 'Failed to connect to Gluetun server');
        }
      }, 1000);
    } catch (error) {
      setError('Invalid URL format');
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Server Configuration</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p>{success}</p>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Gluetun Server URL</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="serverUrl" className="block text-gray-700 dark:text-gray-300 mb-2">
              Server URL
            </label>
            <input
              type="text"
              id="serverUrl"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="http://localhost:8000"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enter the URL of your Gluetun control server, including the port
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {isConnected ? 'Connected' : 'Disconnected'}
                {connectionError && <span className="ml-2 text-red-500">({connectionError})</span>}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={checkConnection}
                className="px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                disabled={loading}
              >
                Test Connection
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Connection Troubleshooting</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          If you're having trouble connecting to your Gluetun server, check the following:
        </p>
        <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2">
          <li>Make sure the Gluetun control server is enabled and running</li>
          <li>Verify the port is correctly exposed if running in Docker</li>
          <li>Check for CORS issues - the server may need to be configured to allow requests from your browser</li>
          <li>Ensure there are no network firewalls blocking the connection</li>
          <li>Try using a tool like curl to test the API directly: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">curl {serverUrl}/v1/version</code></li>
        </ul>
      </div>
      
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Using the Nginx Proxy</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This UI is configured to work with an Nginx proxy that handles CORS issues.
        </p>
        <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2">
          <li>To use the proxy, set the server URL to <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">/api</code></li>
          <li>The proxy will forward requests to the Gluetun control server</li>
          <li>If you're not using the proxy, enter the full URL to your Gluetun server</li>
        </ul>
      </div>
    </div>
  );
};

export default ServerConfig; 