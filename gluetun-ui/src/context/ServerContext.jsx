import { createContext, useState, useContext, useEffect } from 'react';

const ServerContext = createContext();

export const useServer = () => useContext(ServerContext);

export const ServerProvider = ({ children }) => {
  // Use the proxied API URL by default
  const [serverUrl, setServerUrl] = useState(localStorage.getItem('serverUrl') || './api');
  const [isConnected, setIsConnected] = useState(false);
  const [version, setVersion] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    localStorage.setItem('serverUrl', serverUrl);
    checkConnection();
  }, [serverUrl]);

  const checkConnection = async () => {
    try {
      setConnectionError(null);
      console.log(`Attempting to connect to ${serverUrl}/v1/version`);
      
      const response = await fetch(`${serverUrl}/v1/version`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Version data:', data);
        setVersion(data);
        setIsConnected(true);
      } else {
        const errorText = await response.text();
        console.error('Server responded with error:', response.status, errorText);
        setConnectionError(`Server error: ${response.status} ${response.statusText}`);
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Connection error:', error.message);
      setConnectionError(`Connection error: ${error.message}`);
      setIsConnected(false);
    }
  };

  const fetchData = async (endpoint, method = 'GET', body = null) => {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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
      } catch (parseError) {
        // If JSON parsing fails, return true for successful non-JSON responses
        return true;
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };

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