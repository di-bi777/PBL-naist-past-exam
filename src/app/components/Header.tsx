import { BookOpen, User, LogOut } from 'lucide-react';

interface HeaderProps {
  isLoggedIn: boolean;
  username?: string;
  onLogout?: () => void;
  onAdminNavigate?: () => void;
}

export function Header({ isLoggedIn, username, onLogout, onAdminNavigate }: HeaderProps) {
  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">過去問共有プラットフォーム</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <button
                  type="button"
                  onClick={onAdminNavigate}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm">{username}</span>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  ログアウト
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
