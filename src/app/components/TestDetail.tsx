import { ArrowLeft, User, Calendar, BookOpen, FileText, AlertCircle } from 'lucide-react';

interface TestDetailProps {
  testId: string;
  onNavigate: (page: 'test-list') => void;
}

export function TestDetail({ testId, onNavigate }: TestDetailProps) {
  // モックデータ
  const test = {
    id: testId,
    title: '微分積分学期末試験',
    subject: '微分積分学I',
    area: '数学',
    semester: '前期',
    year: 2025,
    professor: '山本教授',
    examDate: '2025年7月15日',
    duration: '90分',
    allowedMaterials: '電卓、A4用紙1枚（両面可）',
    uploadedBy: '山田太郎',
    uploadedAt: '2026-01-10',
    description: '微分積分学Iの期末試験です。主に積分の応用問題が中心でした。',
    content: `
【大問1】(30点)
次の関数の不定積分を求めよ。
(1) ∫(3x² + 2x - 1)dx
(2) ∫(sin x + cos x)dx
(3) ∫(e^x + 1/x)dx

【大問2】(25点)
次の定積分を計算せよ。
(1) ∫[0→1] (x³ + 2x)dx
(2) ∫[0→π/2] sin x dx

【大問3】(25点)
曲線 y = x² と直線 y = 4 で囲まれた図形の面積を求めよ。

【大問4】(20点)
関数 f(x) = x³ - 3x² + 2 の増減表を作成し、極値を求めよ。
    `,
    additionalInfo: '教科書の例題と似た問題が多く出題されました。特に積分の計算は確実にできるようにしておくべきです。',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 戻るボタン */}
        <button
          onClick={() => onNavigate('test-list')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          一覧に戻る
        </button>

        {/* メイン情報カード */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {test.area}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {test.semester}
                </span>
                <span className="text-gray-500 text-sm">{test.year}年度</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{test.title}</h1>
              
              <div className="space-y-2 text-gray-700">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">科目：</span>
                  <span>{test.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">担当教員：</span>
                  <span>{test.professor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">試験日：</span>
                  <span>{test.examDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">試験時間：</span>
                  <span>{test.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">持ち込み：</span>
                  <span>{test.allowedMaterials}</span>
                </div>
              </div>
            </div>

          </div>

          {/* 投稿者情報 */}
          <div className="pt-6 border-t text-sm text-gray-500">
            投稿者: {test.uploadedBy} | 投稿日: {test.uploadedAt}
          </div>
        </div>

        {/* 説明 */}
        {test.description && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">説明</h2>
            <p className="text-gray-700 leading-relaxed">{test.description}</p>
          </div>
        )}

        {/* 試験内容 */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">試験内容</h2>
          <pre className="bg-gray-50 p-6 rounded-lg text-gray-800 whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {test.content}
          </pre>
        </div>

        {/* 補足情報 */}
        {test.additionalInfo && (
          <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
            <h2 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              補足情報
            </h2>
            <p className="text-blue-800 leading-relaxed">{test.additionalInfo}</p>
          </div>
        )}

      </div>
    </div>
  );
}
