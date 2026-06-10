import { Link } from 'react-router-dom';
import { useServer } from '../context/ServerContext';

const Navbar = () => {
  const { isConnected, version } = useServer();

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="font-bold text-xl">Gluetun Control Panel</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex space-x-4">
              <Link to="/" className="hover:text-blue-200">Dashboard</Link>
              <Link to="/vpn" className="hover:text-blue-200">VPN</Link>
              <Link to="/dns" className="hover:text-blue-200">DNS</Link>
              <Link to="/updater" className="hover:text-blue-200">Updater</Link>
              <Link to="/config" className="hover:text-blue-200">Server Config</Link>
            </div>
            
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-500'}`}></div>
              <span className="text-sm">
                {isConnected ? `Connected v${version?.Version || ''}` : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 