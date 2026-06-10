import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import VPNSettings from './pages/VPNSettings';
import DNSSettings from './pages/DNSSettings';
import UpdaterSettings from './pages/UpdaterSettings';
import ServerConfig from './pages/ServerConfig';
import { ServerProvider } from './context/ServerContext';

function App() {
  return (
    <ServerProvider>
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto max-w-5xl px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vpn" element={<VPNSettings />} />
            <Route path="/dns" element={<DNSSettings />} />
            <Route path="/updater" element={<UpdaterSettings />} />
            <Route path="/config" element={<ServerConfig />} />
          </Routes>
        </main>
      </div>
    </ServerProvider>
  );
}

export default App;
