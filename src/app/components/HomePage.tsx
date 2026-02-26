import { useEffect, useState } from 'react';
import { FileText, ClipboardList, Plus } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { GAS_DB_ENDPOINT } from '../constants/gas';

type StatsStatus = 'idle' | 'loading' | 'ready' | 'error' | 'missing';

type ApprovedCounts = {
  exams: number;
  assignments: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const toNumber = (value: unknown) => (typeof value === 'number' ? value : null);

const extractApprovedCounts = (payload: unknown): ApprovedCounts | null => {
  if (!isRecord(payload)) return null;
  const counts = payload.counts;
  if (!isRecord(counts)) return null;

  const exams = isRecord(counts.exams) ? toNumber(counts.exams.approved) : null;
  const assignments = isRecord(counts.assignments)
    ? toNumber(counts.assignments.approved)
    : null;

  if (exams === null || assignments === null) return null;
  return { exams, assignments };
};

const formatCount = (value: number | null, status: StatsStatus) => {
  if (status === 'loading') return '...';
  if (typeof value === 'number') return value.toLocaleString('ja-JP');
  return '—';
};

interface HomePageProps {
  onNavigate: (page: 'test-list' | 'test-form' | 'assignment-list' | 'assignment-form') => void;
  onAdminLogin: () => void;
  isLoggedIn: boolean;
}

export function HomePage({ onNavigate, onAdminLogin, isLoggedIn }: HomePageProps) {
  const { t } = useLanguage();
  const [counts, setCounts] = useState<ApprovedCounts | null>(null);
  const [statsStatus, setStatsStatus] = useState<StatsStatus>('idle');

  useEffect(() => {
    if (!GAS_DB_ENDPOINT) {
      setStatsStatus('missing');
      return;
    }

    const controller = new AbortController();
    const fetchCounts = async () => {
      setStatsStatus('loading');
      try {
        const response = await fetch(GAS_DB_ENDPOINT, { signal: controller.signal });
        const text = await response.text();
        if (!response.ok) {
          throw new Error(`GAS endpoint error: ${response.status} ${text}`);
        }
        const payload = text ? (JSON.parse(text) as unknown) : null;
        const nextCounts = extractApprovedCounts(payload);
        if (!nextCounts) {
          throw new Error('approved counts not found');
        }
        setCounts(nextCounts);
        setStatsStatus('ready');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        setStatsStatus('error');
      }
    };

    fetchCounts();
    return () => controller.abort();
  }, [GAS_DB_ENDPOINT]);

  const examCountLabel = formatCount(counts?.exams ?? null, statsStatus);
  const assignmentCountLabel = formatCount(counts?.assignments ?? null, statsStatus);

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
            <div className="text-3xl font-bold text-blue-600 mb-2">{examCountLabel}</div>
            <div className="text-sm text-gray-600">{t('home.stats.tests')}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{assignmentCountLabel}</div>
            <div className="text-sm text-gray-600">{t('home.stats.assignments')}</div>
          </div>
        </div>
        {!isLoggedIn && (
          <div className="max-w-3xl mx-auto mt-3 flex justify-end">
            <button
              type="button"
              onClick={onAdminLogin}
              className="text-xs text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm"
            >
              管理者ログイン
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
