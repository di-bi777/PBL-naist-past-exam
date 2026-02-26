import { useState, useEffect } from 'react'; // useEffectを追加
import { Search, Plus, ThumbsUp, ThumbsDown, Calendar, BookOpen, ArrowLeft, Loader2 } from 'lucide-react';

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
}

interface TestListProps {
  onNavigate: (page: 'home' | 'test-detail', testId?: string) => void;
  onShowForm: () => void;
}

export function TestList({ onNavigate, onShowForm }: TestListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  
  // データ取得用のState
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // GASのURL (doPostと同じURLでOK)
  const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyeejxUY7FJ-omW-CeSm9Ww_Gk-rN4iLqFr9Bf0SrkwEhys-XaLQY5SPU0IaEwHakwE/exec';

  // 初回レンダリング時にデータを取得
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch(GAS_ENDPOINT);
        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }
        const data = await response.json();
        
        // エラーオブジェクトが返ってきていないか確認
        if (data.error) {
          throw new Error(data.error);
        }

        setTests(data);
      } catch (err) {
        console.error(err);
        setError('過去問データの読み込みに失敗しました。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, []);

  const areas = ['all', '情報科学領域', 'バイオサイエンス領域', '物質創成科学領域'];
  const semesters = ['all', '春学期', '秋学期'];

  // フィルタリング処理
  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = selectedArea === 'all' || test.area === selectedArea;
    const matchesSemester = selectedSemester === 'all' || test.semester === selectedSemester;
    return matchesSearch && matchesArea && matchesSemester;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">データを読み込んでいます...</p>
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
            className="mt-4 text-blue-600 hover:underline"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            ホームに戻る
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">テスト（過去問）</h1>
              <p className="text-gray-600 mt-2">過去のテスト問題を検索・閲覧</p>
            </div>
            <button
              onClick={onShowForm}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              過去問を登録
            </button>
          </div>
        </div>

        {/* 検索とフィルター */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="科目名・タイトルで検索"
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
                  <option key={area} value={area}>
                    {area === 'all' ? '全ての領域' : area}
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
                  <option key={semester} value={semester}>
                    {semester === 'all' ? '全ての開講期' : semester}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 検索結果 */}
        <div className="mb-4 text-gray-600">
          {filteredTests.length}件の過去問が見つかりました
        </div>

        {/* 過去問リスト */}
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
                      {test.area}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {test.semester}
                    </span>
                    <span className="text-gray-500 text-sm">{test.year}年度</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{test.title}</h3>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                    <BookOpen className="w-4 h-4" />
                    <span>{test.subject}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>投稿者: {test.uploadedBy}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {test.uploadedAt}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 ml-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-green-600">
                      <ThumbsUp className="w-5 h-5" />
                      <span className="font-medium">{test.upvotes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <ThumbsDown className="w-5 h-5" />
                      <span className="font-medium">{test.downvotes}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {test.commentCount}件のコメント
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