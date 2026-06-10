import { useState, useEffect } from 'react';
import { useServer } from '../context/ServerContext';

const StatusCard = ({ title, endpoint, statusKey = 'status', onStatusChange }) => {
  const { fetchData } = useServer();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchData(endpoint);
      console.log('Status response:', data);
      setStatus(data[statusKey]);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching status:', err);
      setError('Failed to fetch status');
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const newStatus = status.indexOf('running') > -1 ? 'user-stopped' : 'user-running';
      const data = await fetchData(endpoint, 'PUT', { status: newStatus });
      setStatus(newStatus.replaceAll('user-', ''));
      if (onStatusChange) {
        onStatusChange(newStatus, data.outcome);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to update status');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>
        <div className="flex items-center">
          {loading ? (
            <div className="animate-pulse h-4 w-4 bg-blue-400 rounded-full"></div>
          ) : (
            <div className={`h-4 w-4 rounded-full ${status === 'running' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          )}
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
            {loading ? 'Loading...' : status || 'Unknown'}
          </span>
        </div>
      </div>
      
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      
      <div className="flex justify-between">
        <button
          onClick={fetchStatus}
          className="px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
          disabled={loading}
        >
          Refresh
        </button>
        <button
          onClick={toggleStatus}
          className={`px-4 py-2 rounded transition-colors ${
            status === 'running'
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-green-100 text-green-600 hover:bg-green-200'
          }`}
          disabled={loading}
        >
          {status === 'running' ? 'Stop' : 'Start'}
        </button>
      </div>
    </div>
  );
};

export default StatusCard; 