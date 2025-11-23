import { LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Título */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SOC Dashboard</h1>
              <p className="text-xs text-gray-400">
                Security Operations Center
              </p>
            </div>
          </div>

          {/* User Info e Logout */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-full border border-cyan-500/30">
                    <User className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {user.role || 'admin'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-all group"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors" />
                  <span className="hidden sm:inline text-sm font-medium text-red-400 group-hover:text-red-300 transition-colors">
                    Sair
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
