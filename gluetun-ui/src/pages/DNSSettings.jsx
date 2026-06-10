import { useState, useEffect } from 'react';
import { useServer } from '../context/ServerContext';

const DNSSettings = () => {
  const { fetchData, isConnected } = useServer();
  const [dnsStatus, setDNSStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isConnected) {
      fetchDNSStatus();
    }
  }, [isConnected]);

  const fetchDNSStatus = async () => {
    setLoading(true);
    try {
      const data = await fetchData('/v1/dns/status');
      setDNSStatus(data.Status);
    } catch (error) {
      setError('Failed to fetch DNS status');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await fetchData('/v1/dns/status', 'PUT', { Status: newStatus });
      setDNSStatus(newStatus);
      setSuccess(`DNS ${newStatus === 'running' ? 'started' : 'stopped'} successfully`);
      
      if (result && result.Outcome) {
        setSuccess(result.Outcome);
      }
    } catch (error) {
      setError(`Failed to ${newStatus === 'running' ? 'start' : 'stop'} DNS`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Not Connected to Gluetun Server</h2>
        <p className="text-gray-600 dark:text-gray-400">Please check your server configuration</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">DNS Settings</h1>
      
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">DNS Status</h2>
          <div className="flex items-center">
            {loading ? (
              <div className="animate-pulse h-4 w-4 bg-blue-400 rounded-full mr-2"></div>
            ) : (
              <div className={`h-4 w-4 rounded-full mr-2 ${dnsStatus === 'running' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            )}
            <span className="text-gray-600 dark:text-gray-300">
              {loading ? 'Loading...' : dnsStatus || 'Unknown'}
            </span>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={fetchDNSStatus}
            disabled={loading}
            className="px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            onClick={() => handleStatusChange(dnsStatus === 'running' ? 'stopped' : 'running')}
            disabled={loading}
            className={`px-4 py-2 rounded transition-colors disabled:opacity-50 ${
              dnsStatus === 'running'
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
          >
            {dnsStatus === 'running' ? 'Stop DNS' : 'Start DNS'}
          </button>
        </div>
      </div>
      
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">DNS Information</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Gluetun provides DNS services that can be configured to use various providers and support DNS over TLS.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> DNS settings are configured through environment variables when starting the Gluetun container. 
            This panel only allows you to start or stop the DNS service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DNSSettings; 