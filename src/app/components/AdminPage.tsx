import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FileText, Calendar, Cloud, FolderOpen } from 'lucide-react';

interface AdminPageProps {
  onBack: () => void;
}

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
};

const GAS_DRIVE_ENDPOINT = import.meta.env.VITE_GAS_DRIVE_ENDPOINT as string | undefined;

const formatBytes = (bytes?: string) => {
  if (!bytes) return '—';
  const size = Number(bytes);
  if (!Number.isFinite(size)) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = size;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value < 10 && unitIndex > 0 ? 1 : 0)}${units[unitIndex]}`;
};

const formatDateTime = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('ja-JP', { dateStyle: 'medium', timeStyle: 'short' });
};

export function AdminPage({ onBack }: AdminPageProps) {
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [driveStatus, setDriveStatus] = useState<'idle' | 'loading' | 'ready' | 'error' | 'missing'>('idle');
  const [driveError, setDriveError] = useState<string>('');
  const [driveRaw, setDriveRaw] = useState<string>('');

  useEffect(() => {
    if (!GAS_DRIVE_ENDPOINT) {
      setDriveStatus('missing');
      return;
    }

    const controller = new AbortController();
    const fetchDriveFiles = async () => {
      setDriveStatus('loading');
      setDriveError('');
      try {
        const res = await fetch(GAS_DRIVE_ENDPOINT, { signal: controller.signal });
        const text = await res.text();
        setDriveRaw(text.slice(0, 1500));
        if (!res.ok) {
          throw new Error(`GAS endpoint error: ${res.status} ${text}`);
        }
        const data = JSON.parse(text) as { files?: DriveFile[] };
        setDriveFiles(data.files ?? []);
        setDriveStatus('ready');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        setDriveStatus('error');
        setDriveError(error instanceof Error ? error.message : '不明なエラーが発生しました');
      }
    };

    fetchDriveFiles();
    return () => controller.abort();
  }, []);

  const driveSummary = useMemo(() => {
    if (driveStatus === 'missing') {
      return 'GAS 連携の設定が未完了です（VITE_GAS_DRIVE_ENDPOINT）。';
    }
    if (driveStatus === 'loading') {
      return 'Google Drive からフォルダ内容を取得しています。';
    }
    if (driveStatus === 'error') {
      return 'Google Drive との連携に失敗しました。';
    }
    if (driveStatus === 'ready') {
      return `Google Drive 連携済み。${driveFiles.length}件のファイルを表示中。`;
    }
    return 'Google Drive 連携の初期化中です。';
  }, [driveFiles.length, driveStatus]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          ホームに戻る
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">管理者ページ</h1>
          <p className="text-gray-600 mt-2">アップロードされたファイルの閲覧・確認</p>
          <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            {driveSummary}
          </div>
          {driveStatus === 'error' && (
            <div className="mt-2 text-xs text-red-500">{driveError}</div>
          )}
          <details className="mt-3 text-xs text-gray-400">
            <summary className="cursor-pointer select-none">実行ログ</summary>
            <div className="mt-2 space-y-2">
              <div>エンドポイント: {GAS_DRIVE_ENDPOINT ?? '未設定'}</div>
              <div>ステータス: {driveStatus}</div>
              {driveError && <div>エラー: {driveError}</div>}
              <div>応答サンプル: {driveRaw ? driveRaw : '（空）'}</div>
            </div>
          </details>
        </div>

        <div className="bg-white rounded-xl shadow mb-8">
          <div className="border-b px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">Google Drive フォルダ内のファイル</div>
            <div className="text-xs text-gray-500">更新日順</div>
          </div>

          <div className="divide-y">
            {driveStatus === 'missing' && (
              <div className="p-6 text-sm text-gray-500">
                環境変数 `VITE_GAS_DRIVE_ENDPOINT` を設定すると表示されます。
              </div>
            )}
            {driveStatus === 'loading' && (
              <div className="p-6 text-sm text-gray-500">取得中...</div>
            )}
            {driveStatus === 'error' && (
              <div className="p-6 text-sm text-gray-500">
                Google Drive の取得に失敗しました。権限設定やフォルダ共有設定を確認してください。
              </div>
            )}
            {driveStatus === 'ready' && driveFiles.length === 0 && (
              <div className="p-6 text-sm text-gray-500">フォルダ内にファイルが見つかりません。</div>
            )}
            {driveStatus === 'ready' &&
              driveFiles.map((file) => (
                <div key={file.id} className="p-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                        {file.mimeType === 'application/vnd.google-apps.folder' ? (
                          <FolderOpen className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                        <span className="font-medium text-gray-900">{file.name}</span>
                        <span className="text-gray-400">•</span>
                        <span>{formatBytes(file.size)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDateTime(file.modifiedTime)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Cloud className="w-4 h-4" />
                          <span>Google Drive</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="text-sm px-4 py-2 rounded-lg border border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                        >
                          承認
                        </button>
                        <button
                          type="button"
                          className="text-sm px-4 py-2 rounded-lg border border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                        >
                          拒否
                        </button>
                      </div>
                      {file.webViewLink ? (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          開く
                        </a>
                      ) : (
                        <button
                          className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed"
                          disabled
                        >
                          リンクなし
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

      </div>
    </div>
  );
}
