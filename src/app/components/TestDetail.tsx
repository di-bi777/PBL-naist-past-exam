import { useState } from 'react';
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle, User, Calendar, BookOpen, FileText, AlertCircle } from 'lucide-react';
import { getAreaLabel, getTermLabel } from '../constants/options';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  upvotes: number;
}

interface TestDetailProps {
  testId: string;
  onNavigate: (page: 'test-list') => void;
}

export function TestDetail({ testId, onNavigate }: TestDetailProps) {
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [commentText, setCommentText] = useState('');
  
  // モックデータ
  const test = {
    id: testId,
    title: '微分積分学期末試験',
    subject: '微分積分学I',
    area: 'mat',
    semester: 'spring',
    year: 2025,
    professor: '山本教授',
    examDate: '2025年7月15日',
    duration: '90分',
    allowedMaterials: '電卓、A4用紙1枚（両面可）',
    upvotes: 42,
    downvotes: 3,
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

  const comments: Comment[] = [
    {
      id: '1',
      author: '佐藤花子',
      content: 'とても参考になりました！大問3の面積計算がポイントですね。',
      timestamp: '2026-01-12 14:30',
      upvotes: 12,
    },
    {
      id: '2',
      author: '鈴木一郎',
      content: '教科書の練習問題をしっかりやっておけば解ける内容でした。',
      timestamp: '2026-01-13 09:15',
      upvotes: 8,
    },
    {
      id: '3',
      author: '田中次郎',
      content: '時間配分が重要です。大問1,2を素早く終わらせて、大問3,4に時間を使いましょう。',
      timestamp: '2026-01-14 16:45',
      upvotes: 15,
    },
  ];

  const handleVote = (type: 'up' | 'down') => {
    if (userVote === type) {
      setUserVote(null);
    } else {
      setUserVote(type);
    }
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      // コメント送信処理（モック）
      setCommentText('');
      alert('コメントを投稿しました');
    }
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
                  {getAreaLabel(test.area) || test.area}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {getTermLabel(test.semester) || test.semester}
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

            {/* 評価ボタン */}
            <div className="flex flex-col items-center gap-4 ml-6">
              <button
                onClick={() => handleVote('up')}
                className={`flex flex-col items-center gap-1 px-6 py-3 rounded-lg transition-colors ${
                  userVote === 'up'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                }`}
              >
                <ThumbsUp className="w-6 h-6" />
                <span className="font-bold text-lg">{test.upvotes + (userVote === 'up' ? 1 : 0)}</span>
              </button>
              
              <button
                onClick={() => handleVote('down')}
                className={`flex flex-col items-center gap-1 px-6 py-3 rounded-lg transition-colors ${
                  userVote === 'down'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                }`}
              >
                <ThumbsDown className="w-6 h-6" />
                <span className="font-bold text-lg">{test.downvotes + (userVote === 'down' ? 1 : 0)}</span>
              </button>
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

        {/* コメントセクション */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            コメント ({comments.length})
          </h2>

          {/* コメント入力 */}
          <div className="mb-6">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="コメントを入力..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleCommentSubmit}
                disabled={!commentText.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                投稿
              </button>
            </div>
          </div>

          {/* コメント一覧 */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-t pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{comment.author}</div>
                      <div className="text-xs text-gray-500">{comment.timestamp}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">{comment.upvotes}</span>
                  </div>
                </div>
                <p className="text-gray-700 ml-10">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
