import { FileText, ClipboardList, Plus } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: 'test-list' | 'assignment-list') => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">過去問共有プラットフォーム</h1>
          <p className="text-lg text-gray-600">みんなで作る、試験対策の知識ベース</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* テスト（過去問） */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 mx-auto">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">テスト（過去問）</h2>
            <p className="text-gray-600 text-center mb-6">
              過去のテスト問題を共有・閲覧できます。領域・開講期・科目別に整理されています。
            </p>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('test-list')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                過去問を閲覧
              </button>
              <button
                onClick={() => onNavigate('test-list')}
                className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                過去問を登録
              </button>
            </div>
          </div>

          {/* 課題 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
              <ClipboardList className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">課題</h2>
            <p className="text-gray-600 text-center mb-6">
              授業の課題情報を共有・閲覧できます。過去の課題内容や注意点を確認できます。
            </p>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('assignment-list')}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                課題を閲覧
              </button>
              <button
                onClick={() => onNavigate('assignment-list')}
                className="w-full border-2 border-green-600 text-green-600 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                課題を登録
              </button>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="mt-16 grid grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">248</div>
            <div className="text-sm text-gray-600">登録過去問</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">142</div>
            <div className="text-sm text-gray-600">課題情報</div>
          </div>
        </div>
      </div>
    </div>
  );
}
