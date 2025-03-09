import { useState, useEffect } from 'react';
import { useServer } from '../context/ServerContext';

const VPNSettings = () => {
  const { fetchData, isConnected } = useServer();
  const [settings, setSettings] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [vpnStatus, setVPNStatus] = useState(null);

  useEffect(() => {
    if (isConnected) {
      fetchVPNSettings();
      fetchVPNStatus();
    }
  }, [isConnected]);

  const fetchVPNSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchData('/v1/vpn/settings');
      setSettings(data);
    } catch (error) {
      setError('Failed to fetch VPN settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVPNStatus = async () => {
    try {
      const data = await fetchData('/v1/vpn/status');
      setVPNStatus(data.Status);
    } catch (error) {
      console.error('Failed to fetch VPN status:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => {
      // Handle nested properties
      if (name.includes('.')) {
        const parts = name.split('.');
        const newSettings = { ...prev };
        
        let current = newSettings;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        
        current[parts[parts.length - 1]] = value;
        return newSettings;
      }
      
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      await fetchData('/v1/vpn/settings', 'PUT', settings);
      console.log('VPN settings updated successfully');

      setSuccess('VPN settings updated successfully');
      setEditMode(false);
      
      // Refresh the settings to show the updated values
      await fetchVPNSettings();
    } catch (error) {
      console.error('Error updating VPN settings:', error);
      setError('Failed to update VPN settings');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderSettingsView = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">General Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">VPN Type</p>
            <p className="font-medium">{settings.type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Provider</p>
            <p className="font-medium">{settings.provider.name}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Server Selection</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Countries</p>
            {editMode ? (
              <div className="mt-1">
                <input
                  type="text"
                  value={settings.provider.server_selection.countries?.join(', ') || ''}
                  onChange={(e) => {
                    const countries = e.target.value.split(',').map(c => c.trim()).filter(Boolean);
                    setSettings({
                      ...settings,
                      provider: {
                        ...settings.provider,
                        server_selection: {
                          ...settings.provider.server_selection,
                          countries: countries
                        }
                      }
                    });
                  }}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  placeholder="e.g. netherlands, germany"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Separate multiple countries with commas
                </p>
              </div>
            ) : (
              <p className="font-medium">{settings.provider.server_selection.countries?.join(', ') || 'None'}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Protocol</p>
            <p className="font-medium">{settings.provider.server_selection.openvpn.protocol}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">OpenVPN Configuration</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Version</p>
            <p className="font-medium">{settings.openvpn.version}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Interface</p>
            <p className="font-medium">{settings.openvpn.interface}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Process User</p>
            <p className="font-medium">{settings.openvpn.process_user}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Verbosity</p>
            <p className="font-medium">{settings.openvpn.verbosity}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        {editMode ? (
          <>
            <button
              onClick={() => {
                setEditMode(false);
                fetchVPNSettings(); // Reset to original settings
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Edit Countries
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">VPN Settings</h1>
      
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

      {renderSettingsView()}
    </div>
  );
};

export default VPNSettings; 