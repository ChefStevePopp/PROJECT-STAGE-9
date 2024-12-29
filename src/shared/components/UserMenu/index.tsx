import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Settings, LogOut, Building2, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/config/routes';
import toast from 'react-hot-toast';

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, displayName, isDev, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate(ROUTES.AUTH.SIGN_IN);
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  if (!user) return null;

  return (
    <div className="relative z-[110]" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
          <User className="w-5 h-5 text-primary-400" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-white">
            {displayName || user.email?.split('@')[0]}
          </p>
          <p className="text-xs text-gray-400">
            {isDev ? 'Developer' : 'Organization Owner'}
          </p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-gray-800 border border-gray-700 shadow-xl">
          <div className="p-2">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-white truncate">
                {user.email}
              </p>
              {isDev && (
                <span className="flex items-center gap-1 text-xs text-primary-400">
                  <Shield className="w-3 h-3" />
                  Developer Access
                </span>
              )}
            </div>

            <div className="border-t border-gray-700 my-2" />

            <Link
              to={ROUTES.ADMIN.SETTINGS}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>

            <Link
              to={ROUTES.ADMIN.ORGANIZATIONS}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Building2 className="w-4 h-4" />
              Organizations
            </Link>

            {isDev && (
              <Link
                to="/admin/dev-management"
                className="flex items-center gap-2 px-3 py-2 text-sm text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Shield className="w-4 h-4" />
                Dev Management
              </Link>
            )}

            <div className="border-t border-gray-700 my-2" />

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};