import { BookOpen, User, LogOut, LogIn, Globe } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface HeaderProps {
  isLoggedIn: boolean;
  username?: string;
  onLogout?: () => void;
  onLogin?: () => void;
  onAdminNavigate?: () => void;
}

export function Header({ isLoggedIn, username, onLogout, onLogin, onAdminNavigate }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ja' ? 'en' : 'ja');
  };

  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">{t('header.title')}</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
              title={language === 'ja' ? 'Switch to English' : '日本語に切り替え'}
            >
              <Globe className="w-4 h-4" />
              {language === 'ja' ? 'JP' : 'EN'}
            </button>

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
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t('header.logout')}
                </button>
              </>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                {t('header.login')}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
