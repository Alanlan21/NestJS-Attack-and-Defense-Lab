import { ShieldX, LogOut, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ForbiddenPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        {/* Erro Card */}
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-lg border border-gray-700 shadow-2xl overflow-hidden">
          {/* Header com gradiente sutil */}
          <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-b border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-red-500/10 rounded-lg border border-red-500/20">
                  <ShieldX className="w-7 h-7 text-red-400" strokeWidth={1.5} />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Acesso Negado</h1>
                <p className="text-sm text-gray-400 mt-1">
                  HTTP 403 - Forbidden
                </p>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6 space-y-6">
            {/* Mensagem Principal */}
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-300 leading-relaxed">
                  Seu usuário não possui as permissões necessárias para acessar
                  o{' '}
                  <span className="font-semibold text-white">
                    SOC Dashboard
                  </span>
                  .
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Entre em contato com o administrador do sistema para solicitar
                  as credenciais apropriadas.
                </p>
              </div>
            </div>

            {/* Info do Usuário */}
            {user && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                  Sessão Atual
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-700/50 rounded-lg border border-gray-600">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {user.name || user.email}
                    </p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-700/50 border border-gray-600 text-xs font-medium text-gray-300 uppercase">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Ação */}
            <div className="pt-2">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500 text-gray-200 rounded-lg transition-all font-medium"
              >
                <LogOut className="w-4 h-4" />
                Encerrar Sessão
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
