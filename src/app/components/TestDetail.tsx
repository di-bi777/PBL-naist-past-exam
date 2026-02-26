import { useState, useEffect } from 'react';
import { ArrowLeft, User, Calendar, BookOpen, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { getAreaLabel, getTermLabel } from '../constants/options';

interface TestDetailProps {
  testId: string;
  onNavigate: (page: 'test-list') => void;
}

interface TestDetailData {
  id: string;
  title: string;
  subject: string;
  area: string;
  semester: string;
  year: number;
  professor: string;
  allowedMaterials: string;
  uploadedBy: string;
  uploadedAt: string;
  pdfUrl: string;
  previewUrl: string; // PDF埋め込み用
}

export function TestDetail({ testId, onNavigate }: TestDetailProps) {
  const [test, setTest] = useState<TestDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 先ほど設定した環境変数を使用
  const GAS_ENDPOINT = import.meta.env.VITE_GAS_DISPLAY_ENDPOINT as string;

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // パスとIDを指定してリクエスト
        const url = `${GAS_ENDPOINT}?path=get_exam_detail&id=${testId}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('データの取得に失敗しました');
        
        const json = await response.json();
        if (json.status === 'error') throw new Error(json.message);

        const row = json.data;
        
        // Google DriveのURLを埋め込み用（/preview）に変換
        const rawPdfUrl = String(row.pdf_url || '');
        const previewUrl = rawPdfUrl.replace(/\/view.*/, '/preview');

        // DBのデータをUI用にマッピング
        setTest({
          id: String(row.id),
          title: `${row.subject} (${row.year}年度)`,
          subject: String(row.subject),
          area: String(row.area),
          semester: String(row.term),
          year: Number(row.year),
          professor: String(row.instructor || '不明'),
          allowedMaterials: String(row.allowedMaterialsStr || '特になし'),
          uploadedBy: String(row.instructor || '不明'), // ※投稿者情報が別途ある場合は変更
          uploadedAt: row.created_gat ? new Date(row.created_at).toLocaleDateString('ja-JP') : '',
          pdfUrl: rawPdfUrl,
          previewUrl: previewUrl,
        });

      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : '読み込みエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [testId, GAS_ENDPOINT]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">詳細データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error || 'データが見つかりませんでした'}</p>
        <button onClick={() => onNavigate('test-list')} className="text-blue-600 hover:underline">
          一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate('test-list')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          一覧に戻る
        </button>

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
              
              <div className="grid md:grid-cols-2 gap-4 text-gray-700">
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
                <div className="flex items-center gap-2 md:col-span-2">
                  <AlertCircle className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">持ち込み：</span>
                  <span>{test.allowedMaterials}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t text-sm text-gray-500 flex justify-between items-center">
            <div>登録者: {test.uploadedBy} | 登録日: {test.uploadedAt}</div>
          </div>
        </div>

        {/* PDFプレビュー表示 */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">試験問題 (PDF)</h2>
            {test.pdfUrl && (
              <a
                href={test.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg"
              >
                <ExternalLink className="w-4 h-4" />
                別タブで開く
              </a>
            )}
          </div>
          
          {test.previewUrl ? (
            <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
              <iframe
                src={test.previewUrl}
                width="100%"
                height="100%"
                title="PDF Preview"
                className="border-none"
                allow="autoplay"
              ></iframe>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
              PDFのURLが登録されていません。
            </div>
          )}
        </div>

      </div>
    </div>
  );
}