import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  Download,
  Send,
  User,
  Settings,
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/dashboard',
    },
    {
      label: 'Send File',
      icon: <Upload size={20} />,
      path: '/send',
    },
    {
      label: 'Received',
      icon: <Download size={20} />,
      path: '/received',
    },
    {
      label: 'Sent',
      icon: <Send size={20} />,
      path: '/sent',
    },
    {
      label: 'Profile',
      icon: <User size={20} />,
      path: '/profile',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-16">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;