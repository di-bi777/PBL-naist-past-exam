import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, ExternalLink, Loader2 } from 'lucide-react';
import { getAreaLabel, getTermLabel } from '../constants/options';

interface AssignmentDetailProps {
  assignmentId: string;
  onNavigate: (page: 'assignment-list') => void;
}

interface AssignmentDetailData {
  id: string;
  title: string;
  subject: string;
  lectureNumber: string;
  area: string;
  semester: string;
  year: number;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  fileUrl: string;
  previewUrl: string; // iframe埋め込み用
}

export function AssignmentDetail({ assignmentId, onNavigate }: AssignmentDetailProps) {
  const [assignment, setAssignment] = useState<AssignmentDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 環境変数からエンドポイントを取得
  const GAS_ENDPOINT = import.meta.env.VITE_GAS_DISPLAY_ENDPOINT as string;

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const url = `${GAS_ENDPOINT}?path=get_assignment_detail&id=${assignmentId}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('データの取得に失敗しました');
        
        const json = await response.json();
        if (json.status === 'error') throw new Error(json.message);

        const row = json.data;
        
        // Google DriveのURLを埋め込み用（/preview）に変換
        const rawFileUrl = String(row.file_url || '');
        const previewUrl = rawFileUrl.replace(/\/view.*/, '/preview');

        // DBのデータをUI用にマッピング
        setAssignment({
          id: String(row.id),
          title: `${row.subject} (第${row.lecture_no}回)`,
          subject: String(row.subject),
          lectureNumber: String(row.lecture_no),
          area: String(row.area),
          semester: String(row.term),
          year: Number(row.year),
          type: '課題',
          uploadedBy: '不明', // スプレッドシートに投稿者情報がないためデフォルト値
          uploadedAt: row.created_at ? new Date(row.created_at).toLocaleDateString('ja-JP') : '',
          fileUrl: rawFileUrl,
          previewUrl: previewUrl,
        });

      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : '読み込みエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    if (GAS_ENDPOINT) {
      fetchDetail();
    } else {
      setError('エンドポイントが設定されていません');
      setIsLoading(false);
    }
  }, [assignmentId, GAS_ENDPOINT]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">詳細データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error || 'データが見つかりませんでした'}</p>
        <button onClick={() => onNavigate('assignment-list')} className="text-green-600 hover:underline">
          一覧に戻る
        </button>
      </div>
    );
  }

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
              </div>
            </div>
          </div>

          {/* 登録情報 */}
          <div className="pt-6 border-t text-sm text-gray-500">
            <div>登録者: {assignment.uploadedBy} | 登録日: {assignment.uploadedAt}</div>
          </div>
        </div>

        {/* ファイルプレビュー表示 */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">課題ファイル</h2>
            {assignment.fileUrl && (
              <a
                href={assignment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 bg-green-50 px-3 py-1.5 rounded-lg"
              >
                <ExternalLink className="w-4 h-4" />
                別タブで開く
              </a>
            )}
          </div>
          
          {assignment.previewUrl ? (
            <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
              <iframe
                src={assignment.previewUrl}
                width="100%"
                height="100%"
                title="File Preview"
                className="border-none"
                allow="autoplay"
              ></iframe>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
              ファイルのURLが登録されていません。
            </div>
          )}
        </div>

      </div>
    </div>
  );
}