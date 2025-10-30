import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  MessageCircle,
  Search,
  PawPrint,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
  Calendar
} from 'lucide-react';
import NotificationCenter from '@/components/notifications/NotificationCenter';

interface NavigationProps {
  userRole?: string;
}

export default function Navigation({ userRole }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isBreeder = userRole === 'breeder_registered' || userRole === 'breeder_independent';
  const isBuyer = userRole === 'buyer';
  const isShelter = userRole === 'shelter';
  const isVet = userRole === 'vet';

  const getDashboardPath = () => {
    if (isBreeder) return '/breeder';
    if (isBuyer) return '/buyer';
    if (isShelter) return '/shelter';
    if (isVet) return '/vet';
    return '/home';
  };

  const navItems = [
    {
      name: 'Dashboard',
      icon: Home,
      path: getDashboardPath(),
      show: true,
    },
    {
      name: 'Heat Hub',
      icon: Calendar,
      path: '/breeder',
      show: isBreeder,
    },
    {
      name: 'Discover',
      icon: Search,
      path: '/buyer',
      show: isBuyer,
    },
    {
      name: 'My Pets',
      icon: PawPrint,
      path: '/my-pets',
      show: isBreeder,
    },
    {
      name: 'Waitlists',
      icon: Heart,
      path: '/my-waitlists',
      show: isBuyer,
    },
    {
      name: 'Messages',
      icon: MessageCircle,
      path: '/messages',
      show: true,
    },
    {
      name: 'Profile',
      icon: User,
      path: '/profile',
      show: true,
    },
    {
      name: 'Settings',
      icon: Settings,
      path: '/settings',
      show: true,
    },
  ];

  const filteredNavItems = navItems.filter(item => item.show);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>

              <button onClick={() => navigate(getDashboardPath())} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <PawPrint className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900 hidden sm:block">PawMatch</span>
              </button>
            </div>

            <nav className="hidden lg:flex items-center gap-2">
              {filteredNavItems.slice(0, -2).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-lg transition-colors text-base ${
                      isActive
                        ? 'bg-orange-100 text-orange-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100 font-medium'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <NotificationCenter />

              <button
                onClick={() => navigate('/profile')}
                className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="w-7 h-7" />
              </button>

              <button
                onClick={handleSignOut}
                className="hidden sm:flex items-center gap-2 px-5 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-[57px] bottom-0 w-64 bg-white shadow-xl z-50 lg:hidden overflow-y-auto">
            <nav className="p-4 space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-orange-100 text-orange-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}

              <button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-4"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
