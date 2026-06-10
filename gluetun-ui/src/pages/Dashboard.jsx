import { useState, useEffect } from 'react';
import { useServer } from '../context/ServerContext';
import StatusCard from '../components/StatusCard';

const Dashboard = () => {
  const { fetchData, isConnected } = useServer();
  const [publicIP, setPublicIP] = useState(null);
  const [ipDetails, setIpDetails] = useState(null);
  const [ipLoading, setIpLoading] = useState(false);
  const [vpnStatus, setVPNStatus] = useState(null);
  const [dnsStatus, setDNSStatus] = useState(null);
  const [updaterStatus, setUpdaterStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected) {
      fetchDashboardData();
    }
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected) return;

    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [isConnected]);

  const fetchDashboardData = async () => {
    try {
      const [ipData, vpnData, dnsData, updaterData] = await Promise.all([
        fetchData('/v1/publicip/ip'),
        fetchData('/v1/vpn/status'),
        fetchData('/v1/dns/status'),
        fetchData('/v1/updater/status')
      ]);
      
      console.log('IP Data:', ipData);
      setPublicIP(ipData.public_ip);
      setIpDetails(ipData);
      setVPNStatus(vpnData.status);
      setDNSStatus(dnsData.status);
      setUpdaterStatus(updaterData.status);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPublicIP = async () => {
    setIpLoading(true);
    try {
      await fetchData('/v1/publicip/refresh', 'GET');
      const ipData = await fetchData('/v1/publicip/ip');
      setPublicIP(ipData.public_ip);
      setIpDetails(ipData);
    } catch (error) {
      console.error('Error refreshing public IP:', error);
    } finally {
      setIpLoading(false);
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
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Public IP</h2>
              <button
                onClick={refreshPublicIP}
                disabled={ipLoading}
                className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors disabled:opacity-50 flex items-center space-x-1"
              >
                <svg
                  className={`h-4 w-4 ${ipLoading ? 'animate-spin' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>{ipLoading ? 'Refreshing...' : 'Refresh IP'}</span>
              </button>
            </div>
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Current IP Address</p>
                <p className="text-lg font-medium text-gray-800 dark:text-white">{publicIP || 'Unknown'}</p>
                {ipDetails && (
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <p>{ipDetails.city}, {ipDetails.region}</p>
                    <p>{ipDetails.country}</p>
                    <p className="text-xs mt-1">{ipDetails.organization}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatusCard 
              title="VPN Status" 
              endpoint="/v1/vpn/status" 
              onStatusChange={(status) => setVPNStatus(status)} 
            />
            <StatusCard 
              title="DNS Status" 
              endpoint="/v1/dns/status" 
              onStatusChange={(status) => setDNSStatus(status)} 
            />
            <StatusCard 
              title="Updater Status" 
              endpoint="/v1/updater/status" 
              onStatusChange={(status) => setUpdaterStatus(status)} 
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard; 