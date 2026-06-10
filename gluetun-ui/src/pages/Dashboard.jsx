import { useState, useEffect, useCallback } from 'react';
import { useServer } from '../context/ServerContext';
import StatusCard, { StatusPill } from '../components/StatusCard';

const Dashboard = () => {
  const { fetchData, isConnected } = useServer();
  const [ipDetails, setIpDetails] = useState(null);
  const [ipLoading, setIpLoading] = useState(false);
  const [vpnStatus, setVPNStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [ipData, vpnData] = await Promise.all([
        fetchData('/v1/publicip/ip'),
        fetchData('/v1/vpn/status'),
      ]);
      setIpDetails(ipData);
      setVPNStatus(vpnData.status ?? vpnData.Status);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    if (!isConnected) return;
    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(intervalId);
  }, [isConnected, fetchDashboardData]);

  const refreshPublicIP = async () => {
    setIpLoading(true);
    try {
      await fetchData('/v1/publicip/refresh');
      // the refresh runs async server side, give it a moment
      await new Promise((r) => setTimeout(r, 1500));
      const ipData = await fetchData('/v1/publicip/ip');
      setIpDetails(ipData);
    } catch (error) {
      console.error('Error refreshing public IP:', error);
    } finally {
      setIpLoading(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-ink-500 border-t-signal" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="card relative overflow-hidden animate-fade-up">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-signal/5 to-transparent pointer-events-none" />
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="card-title mb-3">Tunnel exit</p>
            <p className="font-mono text-3xl md:text-4xl text-fog tracking-tight">
              {ipDetails?.public_ip || '—'}
            </p>
            <div className="mt-3 space-y-0.5 text-sm text-fog-dim">
              <p>
                {[ipDetails?.city, ipDetails?.region, ipDetails?.country]
                  .filter(Boolean)
                  .join(' · ') || 'location unknown'}
              </p>
              {ipDetails?.organization && (
                <p className="font-mono text-xs text-fog-mute">{ipDetails.organization}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <StatusPill status={vpnStatus} />
            <button onClick={refreshPublicIP} disabled={ipLoading} className="btn-ghost text-xs px-3 py-1.5">
              <svg
                className={`h-3.5 w-3.5 ${ipLoading ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {ipLoading ? 'refreshing' : 'refresh ip'}
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatusCard
          title="VPN"
          endpoint="/v1/vpn/status"
          description="OpenVPN / WireGuard tunnel"
          onStatusChange={(status) => setVPNStatus(status)}
        />
        <StatusCard title="DNS" endpoint="/v1/dns/status" description="Encrypted DNS resolver" />
        <StatusCard title="Updater" endpoint="/v1/updater/status" description="Server list updater" />
      </div>
    </div>
  );
};

export default Dashboard;
