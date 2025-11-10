import { Link } from 'react-router-dom';
import { Lock, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useContext } from 'react';
import { TransferContext } from '../../context/transferContext.js';

const Header = () => {
  const { user, logout } = useAuth();
  const { newTransferCount } = useContext(TransferContext);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Lock className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-gray-900">SecureTransfer</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Link
              to="/received"
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Received Files"
            >
              <Bell size={20} />
              {newTransferCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {newTransferCount > 9 ? '9+' : newTransferCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="bg-primary-100 p-2 rounded-full">
                  <User size={18} className="text-primary-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.username}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;