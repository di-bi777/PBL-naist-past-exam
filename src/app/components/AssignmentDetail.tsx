import { ArrowLeft, BookOpen, FileText, User, AlertCircle } from 'lucide-react';
import { getAreaLabel, getTermLabel } from '../constants/options';

interface AssignmentDetailProps {
  assignmentId: string;
  onNavigate: (page: 'assignment-list') => void;
}

export function AssignmentDetail({ assignmentId, onNavigate }: AssignmentDetailProps) {
  // モックデータ
  const assignment = {
    id: assignmentId,
    title: 'データ構造とアルゴリズムのレポート課題',
    subject: 'データ構造とアルゴリズム',
    area: 'cs',
    semester: 'spring',
    year: 2025,
    professor: '佐藤教授',
    type: 'レポート',
    submissionMethod: 'オンライン提出（学習管理システム）',
    pageRequirement: 'A4用紙3〜5枚',
    uploadedBy: '山田太郎',
    uploadedAt: '2026-01-10',
    description: 'データ構造とアルゴリズムに関するレポート課題です。特定のアルゴリズムを選択し、その効率性について分析します。',
    content: `
【課題内容】
以下のアルゴリズムから1つを選択し、レポートを作成してください。

1. クイックソート
2. マージソート
3. ヒープソート
4. ダイクストラ法
5. 動的計画法（任意の問題）

【レポート構成】
1. 選択したアルゴリズムの概要説明
2. 時間計算量と空間計算量の分析
3. 実装例（擬似コードまたはプログラムコード）
4. 他のアルゴリズムとの比較
5. 実用例と適用場面
6. 参考文献

【評価基準】
- アルゴリズムの理解度：40%
- 計算量分析の正確性：30%
- 実装の品質：20%
- レポートの構成と表現：10%

【注意事項】
- 必ず参考文献を明記すること
- コピー＆ペーストは厳禁
- 図や表を適切に使用すること
    `,
    tips: '過去の受講生からのアドバイス：教科書の該当章をしっかり読み込むことが重要です。特に計算量の証明は詳しく書くと評価が高くなります。また、実装例は実際に動作確認をしてから記載することをお勧めします。',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 戻るボタン */}
        <button
          onClick={() => onNavigate('assignment-list')}
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
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {getAreaLabel(assignment.area) || assignment.area}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {getTermLabel(assignment.semester) || assignment.semester}
                </span>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  {assignment.type}
                </span>
                <span className="text-gray-500 text-sm">{assignment.year}年度</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{assignment.title}</h1>
              
              <div className="space-y-2 text-gray-700">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">科目：</span>
                  <span>{assignment.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">担当教員：</span>
                  <span>{assignment.professor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">提出方法：</span>
                  <span>{assignment.submissionMethod}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">分量：</span>
                  <span>{assignment.pageRequirement}</span>
                </div>
              </div>
            </div>

          </div>

          {/* 投稿者情報 */}
          <div className="pt-6 border-t text-sm text-gray-500">
            <div>投稿者: {assignment.uploadedBy} | 投稿日: {assignment.uploadedAt}</div>
          </div>
        </div>

        {/* 説明 */}
        {assignment.description && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">概要</h2>
            <p className="text-gray-700 leading-relaxed">{assignment.description}</p>
          </div>
        )}

        {/* 課題内容 */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">課題詳細</h2>
          <pre className="bg-gray-50 p-6 rounded-lg text-gray-800 whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {assignment.content}
          </pre>
        </div>

        {/* ヒントとアドバイス */}
        {assignment.tips && (
          <div className="bg-green-50 rounded-xl p-6 mb-6 border border-green-200">
            <h2 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              ヒントとアドバイス
            </h2>
            <p className="text-green-800 leading-relaxed">{assignment.tips}</p>
          </div>
        )}

      </div>
    </div>
  );
}
