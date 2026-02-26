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
const GAS_APPROVE_ENDPOINT = import.meta.env.VITE_GAS_APPROVE_ENDPOINT as string | undefined;
const GAS_REJECT_ENDPOINT =
  (import.meta.env.VITE_GAS_REJECT_ENDPOINT as string | undefined) ?? GAS_APPROVE_ENDPOINT;
const GAS_REJECT_PATH = 'remove_pending_file';
const APPROVED_FOLDER_ID = '1hh9XU2f80S157AqzrlMsD58iqBIWitz1';

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
  const [approvingFileIds, setApprovingFileIds] = useState<string[]>([]);
  const [rejectingFileIds, setRejectingFileIds] = useState<string[]>([]);

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

  const handleApprove = async (file: DriveFile) => {
    if (!GAS_APPROVE_ENDPOINT) {
      alert('承認エンドポイントが未設定です。VITE_GAS_APPROVE_ENDPOINT を確認してください。');
      return;
    }

    const confirmed = window.confirm(
      `ファイル「${file.name}」を承認して Approved フォルダへ移動します。\n実行しますか？`
    );
    if (!confirmed) return;

    setApprovingFileIds((prev) => [...prev, file.id]);
    try {
      const url = `${GAS_APPROVE_ENDPOINT}${GAS_APPROVE_ENDPOINT.includes('?') ? '&' : '?'}path=approve_pending_file`;
      const response = await fetch(url, {
        method: 'POST',
        // Apps Script Web App への JSON POST は preflight で失敗しやすいため simple request で送信。
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          fileId: file.id,
          approvedFolderId: APPROVED_FOLDER_ID,
        }),
      });

      const text = await response.text();
      let result: { status?: string; message?: string } | null = null;
      if (text) {
        try {
          result = JSON.parse(text) as { status?: string; message?: string };
        } catch {
          result = null;
        }
      }

      if (!response.ok || (result?.status && result.status !== 'success')) {
        throw new Error(result?.message || text || '承認処理に失敗しました');
      }

      setDriveFiles((prev) => prev.filter((f) => f.id !== file.id));
      alert(`承認しました: ${file.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : '不明なエラーが発生しました';
      alert(`承認に失敗しました: ${message}`);
    } finally {
      setApprovingFileIds((prev) => prev.filter((id) => id !== file.id));
    }
  };

  const handleReject = async (file: DriveFile) => {
    if (!GAS_REJECT_ENDPOINT) {
      alert('拒否エンドポイントが未設定です。VITE_GAS_REJECT_ENDPOINT を確認してください。');
      return;
    }

    const confirmed = window.confirm(
      `ファイル「${file.name}」を削除します。\nこの操作は取り消せません。実行しますか？`
    );
    if (!confirmed) return;

    setRejectingFileIds((prev) => [...prev, file.id]);
    try {
      const requests = [
        {
          url: `${GAS_REJECT_ENDPOINT}${GAS_REJECT_ENDPOINT.includes('?') ? '&' : '?'}path=${encodeURIComponent(GAS_REJECT_PATH)}`,
          body: { fileId: file.id },
        },
        {
          url: `${GAS_REJECT_ENDPOINT}${GAS_REJECT_ENDPOINT.includes('?') ? '&' : '?'}path=reject_pending_file`,
          body: { fileId: file.id },
        },
        {
          url: GAS_REJECT_ENDPOINT,
          body: { fileId: file.id },
        },
        {
          url: GAS_REJECT_ENDPOINT,
          body: { file_id: file.id },
        },
      ];

      let finalError = '拒否処理に失敗しました';
      let succeeded = false;

      for (const req of requests) {
        const response = await fetch(req.url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(req.body),
        });
        const text = await response.text();
        let result: { status?: string; message?: string } | null = null;
        if (text) {
          try {
            result = JSON.parse(text) as { status?: string; message?: string };
          } catch {
            result = null;
          }
        }

        if (response.ok && (!result?.status || result.status === 'success')) {
          succeeded = true;
          break;
        }

        finalError = result?.message || text || finalError;
        if (!finalError.includes('unknown path')) {
          break;
        }
      }

      if (!succeeded) {
        throw new Error(finalError);
      }

      setDriveFiles((prev) => prev.filter((f) => f.id !== file.id));
      alert(`削除しました: ${file.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : '不明なエラーが発生しました';
      alert(`拒否に失敗しました: ${message}`);
    } finally {
      setRejectingFileIds((prev) => prev.filter((id) => id !== file.id));
    }
  };

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
              <div>承認エンドポイント: {GAS_APPROVE_ENDPOINT ?? '未設定'}</div>
              <div>拒否エンドポイント: {GAS_REJECT_ENDPOINT ?? '未設定'}</div>
              <div>拒否パス: {GAS_REJECT_PATH}</div>
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

                    <div className="w-fit flex flex-col items-stretch gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(file)}
                          disabled={approvingFileIds.includes(file.id)}
                          className="text-sm px-4 py-2 rounded-lg border border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                        >
                          {approvingFileIds.includes(file.id) ? '承認中...' : '承認'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(file)}
                          disabled={rejectingFileIds.includes(file.id)}
                          className="text-sm px-4 py-2 rounded-lg border border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                        >
                          {rejectingFileIds.includes(file.id) ? '削除中...' : '拒否'}
                        </button>
                      </div>
                      {file.webViewLink ? (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full text-center text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          開く
                        </a>
                      ) : (
                        <button
                          className="w-full text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed"
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
