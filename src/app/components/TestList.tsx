import { useState, useEffect } from 'react';
import { Search, Plus, Calendar, BookOpen, ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { GAS_DISPLAY_ENDPOINT } from '../constants/gas';

interface Test {
  id: string;
  title: string;
  subject: string;
  area: string;
  semester: string;
  year: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  uploadedBy: string;
  uploadedAt: string;
  pdfUrl: string;
  type: string;
}

interface TestListProps {
  onNavigate: (page: 'home' | 'test-detail', testId?: string) => void;
  onShowForm: () => void;
}

const areaToTranslationKey: Record<string, string> = {
  '情報科学領域': 'area.Information',
  'バイオサイエンス領域': 'area.Biological',
  '物質創生科学領域': 'area.Materials',
  '物質創成科学領域': 'area.Materials',
};

const semesterToTranslationKey: Record<string, string> = {
  '春学期': 'term.spring',
  '秋学期': 'term.fall',
};

export function TestList({ onNavigate, onShowForm }: TestListProps) {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');

  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const url = `${GAS_DISPLAY_ENDPOINT}?path=get_approved_exams`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();

        if (json.status === 'error' || json.error) {
          throw new Error(json.message || json.error || 'データの取得に失敗しました');
        }

        const rawData = json.data || [];

        // ★ 修正ポイント2: GAS側ですでにフィルタされているはずですが、念のためマッピング処理のみ抽出
        const formattedTests: Test[] = rawData.map((row: any) => ({
          id: String(row.id),
          title: `${row.subject} (${row.year})`,
          subject: String(row.subject),
          area: String(row.area),
          semester: String(row.term),
          year: Number(row.year),
          upvotes: 0,
          downvotes: 0,
          commentCount: 0,
          uploadedBy: String(row.instructor || ''),
          uploadedAt: row.created_at
            ? new Date(row.created_at).toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US')
            : '',
          pdfUrl: String(row.pdf_url || ''),
          type: String(row.type),
        }));

        setTests(formattedTests);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : t('testList.fetchError'));
      } finally {
        setIsLoading(false);
      }
    };

    if (GAS_DISPLAY_ENDPOINT) {
        fetchTests();
    } else {
        setError('エンドポイントが設定されていません。');
        setIsLoading(false);
    }
  }, [GAS_DISPLAY_ENDPOINT]);

  // ★ 修正ポイント3: スプレッドシートに入っている生の値（または key）に合わせて選択肢を定義
  // もし options.ts を使っているなら、そちらを import して使う方がより安全です
  const areas = [
    { value: 'all', label: '全ての領域' },
    { value: 'is', label: '情報科学領域' },
    { value: 'bs', label: 'バイオサイエンス領域' },
    { value: 'ms', label: '物質創成科学領域' },
    // 英語表記など、スプシの実態に合わせて追加・修正してください
    { value: '情報科学領域', label: '情報科学領域(直接)' },
    { value: 'バイオサイエンス領域', label: 'バイオサイエンス領域(直接)' },
    { value: '物質創成科学領域', label: '物質創成科学領域(直接)' }
  ];
  
  const semesters = [
    { value: 'all', label: '全ての開講期' },
    { value: 'spring', label: '春学期' },
    { value: 'fall', label: '秋学期' },
    { value: '春学期', label: '春学期(直接)' },
    { value: '秋学期', label: '秋学期(直接)' }
  ];

  const getAreaLabel = (area: string) => {
    if (area === 'all') return t('testList.area.all');
    const key = areaToTranslationKey[area];
    return key ? t(key) : area;
  };

  const getSemesterLabel = (semester: string) => {
    if (semester === 'all') return t('testList.semester.all');
    const key = semesterToTranslationKey[semester];
    return key ? t(key) : semester;
  };

  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 値が 'all' の場合はパス、それ以外は部分一致か完全一致で判定
    const matchesArea = selectedArea === 'all' || test.area === selectedArea;
    const matchesSemester = selectedSemester === 'all' || test.semester === selectedSemester;
    
    return matchesSearch && matchesArea && matchesSemester;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('testList.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            {t('testList.reload')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('testList.backToHome')}
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('testList.title')}</h1>
              <p className="text-gray-600 mt-2">{t('testList.subtitle')}</p>
            </div>
            <button
              onClick={onShowForm}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('testList.register')}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('testList.search.placeholder')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {areas.map((area) => (
                  <option key={area.value} value={area.value}>
                    {getAreaLabel(area.value)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {semesters.map((semester) => (
                  <option key={semester.value} value={semester.value}>
                    {getSemesterLabel(semester.value)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4 text-gray-600">
          {language === 'ja'
            ? `${filteredTests.length}件の過去問が見つかりました`
            : `${filteredTests.length} exam(s) found`}
        </div>

        <div className="space-y-4">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              onClick={() => onNavigate('test-detail', test.id)}
              className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow p-6 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {getAreaLabel(test.area)}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {getSemesterLabel(test.semester)}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {language === 'ja' ? `${test.year}年度` : String(test.year)}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {language === 'ja' ? `${test.subject} (${test.year}年度)` : `${test.subject} (${test.year})`}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                    <BookOpen className="w-4 h-4" />
                    <span>{test.subject}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{t('testList.instructor')} {test.uploadedBy || t('testList.unknown')}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {t('testList.registeredDate')} {test.uploadedAt}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
