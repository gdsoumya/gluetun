import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getBasePath } from '../utils/basePathUtils';

const ServerContext = createContext();

export const useServer = () => useContext(ServerContext);

// The API is served from the same origin and base path as the UI.
const defaultServerUrl = () => getBasePath().replace(/\/+$/, '');

const initialServerUrl = () => {
  const stored = localStorage.getItem('serverUrl');
  // './api' was the default before the API moved to the root path
  if (!stored || stored === './api') return defaultServerUrl();
  return stored;
};

export const ServerProvider = ({ children }) => {
  const [serverUrl, setServerUrl] = useState(initialServerUrl);
  const [isConnected, setIsConnected] = useState(false);
  const [version, setVersion] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  const checkConnection = useCallback(async () => {
    try {
      setConnectionError(null);
      const response = await fetch(`${serverUrl}/v1/version`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        setVersion(await response.json());
        setIsConnected(true);
      } else {
        setConnectionError(`Server error: ${response.status} ${response.statusText}`);
        setIsConnected(false);
      }
    } catch (error) {
      setConnectionError(`Connection error: ${error.message}`);
      setIsConnected(false);
    }
  }, [serverUrl]);

  useEffect(() => {
    localStorage.setItem('serverUrl', serverUrl);
    checkConnection();
  }, [serverUrl, checkConnection]);

  const fetchData = useCallback(
    async (endpoint, method = 'GET', body = null) => {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      };
      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${serverUrl}${endpoint}`, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      try {
        return await response.json();
      } catch {
        // successful responses without a JSON body
        return true;
      }
    },
    [serverUrl],
  );

  const value = {
    serverUrl,
    setServerUrl,
    isConnected,
    connectionError,
    version,
    fetchData,
    checkConnection,
  };

  return <ServerContext.Provider value={value}>{children}</ServerContext.Provider>;
};
