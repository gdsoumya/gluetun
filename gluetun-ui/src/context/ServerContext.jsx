import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getBasePath } from '../utils/basePathUtils';

const ServerContext = createContext();

export const useServer = () => useContext(ServerContext);

// The API is served from the same origin and base path as the UI.
// Resolved at request time so the same browser works whether the UI
// is reached directly or through a reverse proxy path prefix.
const defaultServerUrl = () => getBasePath().replace(/\/+$/, '');

// Empty string means "auto" (same origin and base path as the UI).
const initialServerUrl = () => {
  const stored = localStorage.getItem('serverUrl');
  if (!stored) return '';
  // pre-root-API endpoints pointed at the /api prefix
  if (stored === './api') return '';
  if (stored.endsWith('/api')) return stored.slice(0, -'/api'.length).replace(/\/+$/, '');
  return stored;
};

export const ServerProvider = ({ children }) => {
  const [serverUrl, setServerUrl] = useState(initialServerUrl);
  const [isConnected, setIsConnected] = useState(false);
  const [version, setVersion] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  const apiBase = serverUrl || defaultServerUrl();

  const checkConnection = useCallback(async () => {
    try {
      setConnectionError(null);
      const response = await fetch(`${apiBase}/v1/version`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        setConnectionError(`Server error: ${response.status} ${response.statusText}`);
        setIsConnected(false);
        return;
      }
      try {
        setVersion(await response.json());
        setIsConnected(true);
      } catch {
        setConnectionError(
          `${apiBase || '/'}/v1/version did not return JSON — check the API endpoint setting`,
        );
        setIsConnected(false);
      }
    } catch (error) {
      setConnectionError(`Connection error: ${error.message}`);
      setIsConnected(false);
    }
  }, [apiBase]);

  useEffect(() => {
    // only persist explicit user-set endpoints, never the computed default
    if (serverUrl) {
      localStorage.setItem('serverUrl', serverUrl);
    } else {
      localStorage.removeItem('serverUrl');
    }
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

      const response = await fetch(`${apiBase}${endpoint}`, options);
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
    [apiBase],
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
