import { FileText, ClipboardList, Plus } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface HomePageProps {
  onNavigate: (page: 'test-list' | 'test-form' | 'assignment-list' | 'assignment-form') => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('home.title')}</h1>
          <p className="text-lg text-gray-600">{t('home.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* テスト（過去問） */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 mx-auto">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">{t('home.test.title')}</h2>
            <p className="text-gray-600 text-center mb-6">
              {t('home.test.description')}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('test-list')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {t('home.test.browse')}
              </button>
              <button
                onClick={() => onNavigate('test-form')}
                className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {t('home.test.register')}
              </button>
            </div>
          </div>

          {/* 課題 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
              <ClipboardList className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">{t('home.assignment.title')}</h2>
            <p className="text-gray-600 text-center mb-6">
              {t('home.assignment.description')}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('assignment-list')}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                {t('home.assignment.browse')}
              </button>
              <button
                onClick={() => onNavigate('assignment-form')}
                className="w-full border-2 border-green-600 text-green-600 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {t('home.assignment.register')}
              </button>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="mt-16 grid grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">248</div>
            <div className="text-sm text-gray-600">{t('home.stats.tests')}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">142</div>
            <div className="text-sm text-gray-600">{t('home.stats.assignments')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
