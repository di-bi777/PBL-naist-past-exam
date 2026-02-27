import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FileText, Calendar, Cloud, FolderOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  GAS_DRIVE_ENDPOINT,
  GAS_APPROVE_ENDPOINT,
  GAS_REJECT_ENDPOINT,
} from '@/app/constants/gasAdmin';

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

const formatDateTime = (value?: string, locale = 'ja-JP') => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
};

export function AdminPage({ onBack }: AdminPageProps) {
  const { t, language } = useLanguage();
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [dbRows, setDbRows] = useState<any[]>([]); 
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

    const endpoint = GAS_DRIVE_ENDPOINT;
    const controller = new AbortController();
    
    const fetchDriveFiles = async () => {
      setDriveStatus('loading');
      setDriveError('');
      try {
        // キャッシュを無視して常に最新データを取得する
        const urlWithCacheBuster = `${endpoint}${endpoint.includes('?') ? '&' : '?'}t=${new Date().getTime()}`;
        const res = await fetch(urlWithCacheBuster, { 
          signal: controller.signal,
          cache: 'no-store' 
        });
        
        const text = await res.text();
        setDriveRaw(text.slice(0, 1500));
        
        if (!res.ok) {
          throw new Error(`GAS endpoint error: ${res.status} ${text}`);
        }
        
        const data = JSON.parse(text) as { files?: DriveFile[], dbRows?: any[] };
        setDriveFiles(data.files ?? []);
        setDbRows(data.dbRows ?? []);
        
        setDriveStatus('ready');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        setDriveStatus('error');
        setDriveError(error instanceof Error ? error.message : (language === 'ja' ? '不明なエラーが発生しました' : 'An unknown error occurred'));
      }
    };

    fetchDriveFiles();
    return () => controller.abort();
  }, [language]);

  const driveSummary = useMemo(() => {
    if (driveStatus === 'missing') return t('admin.drive.missing');
    if (driveStatus === 'loading') return t('admin.drive.loading');
    if (driveStatus === 'error') return t('admin.drive.error');
    if (driveStatus === 'ready') {
      return language === 'ja'
        ? `Google Drive 連携済み。ファイル ${driveFiles.length}件 / DBデータ ${dbRows.length}件 を表示中。`
        : `Connected to Google Drive. Displaying ${driveFiles.length} file(s) and ${dbRows.length} DB records.`;
    }
    return t('admin.drive.init');
  }, [driveFiles.length, dbRows.length, driveStatus, t, language]);

  const tagsByFileId = useMemo(() => {
    const map = new Map<string, any>();
    
    for (const row of dbRows) {
      // ★エラー防止：どんなデータ型（数字・真偽値）が来ても絶対に文字列に変換してから処理する
      const fileId = String(row.pdf_file_id || row.file_id || '').trim();
      if (!fileId || map.has(fileId)) continue;
      
      map.set(fileId, {
        sourceSheet: row.sourceSheet,
        subject: String(row.subject || '').trim(),
        instructor: String(row.instructor || '').trim(),
        area: String(row.area || '').trim(),
        term: String(row.term || '').trim(),
        year: String(row.year || '').trim(),
        type: String(row.type || '').trim(),
        allowedMaterialsStr: String(row.allowedMaterialsStr || '').trim(),
        matchType: 'id',
      });
    }
    return map;
  }, [dbRows]);

  const resolvedTagsByFileId = useMemo(() => {
    const resolved = new Map<string, any>();

    // 1) IDによる完全一致
    for (const file of driveFiles) {
      const exact = tagsByFileId.get(file.id);
      if (exact) {
        resolved.set(file.id, exact);
      }
    }

    // 2) 推定一致
    for (const file of driveFiles) {
      if (resolved.has(file.id)) continue;
      const fileName = file.name.toLowerCase();

      const candidates = dbRows.filter((row) => {
        // ★エラー防止：文字列に変換してから処理
        const subject = String(row.subject || '').trim().toLowerCase();
        if (!subject || !fileName.includes(subject)) return false;

        const rawYear = String(row.year || '').trim();
        const year = rawYear.endsWith('.0') ? rawYear.slice(0, -2) : rawYear;
        if (!year) return true;
        return fileName.includes(year);
      });

      if (candidates.length !== 1) continue;
      const row = candidates[0];
      resolved.set(file.id, {
        sourceSheet: row.sourceSheet,
        subject: String(row.subject || '').trim(),
        instructor: String(row.instructor || '').trim(),
        area: String(row.area || '').trim(),
        term: String(row.term || '').trim(),
        year: String(row.year || '').trim(),
        type: String(row.type || '').trim(),
        allowedMaterialsStr: String(row.allowedMaterialsStr || '').trim(),
        matchType: 'heuristic',
      });
    }

    return resolved;
  }, [driveFiles, tagsByFileId, dbRows]);

  const examFiles = useMemo(
    () => driveFiles.filter((file) => resolvedTagsByFileId.get(file.id)?.sourceSheet === 'exams'),
    [driveFiles, resolvedTagsByFileId]
  );

  const assignmentFiles = useMemo(
    () => driveFiles.filter((file) => resolvedTagsByFileId.get(file.id)?.sourceSheet === 'assignments'),
    [driveFiles, resolvedTagsByFileId]
  );

  const uncategorizedFiles = useMemo(
    () => driveFiles.filter((file) => !resolvedTagsByFileId.has(file.id)),
    [driveFiles, resolvedTagsByFileId]
  );

  const handleApprove = async (file: DriveFile) => {
    if (!GAS_APPROVE_ENDPOINT) {
      alert(language === 'ja'
        ? '承認エンドポイントが未設定です。VITE_GAS_APPROVE_ENDPOINT を確認してください。'
        : 'Approve endpoint is not configured. Check VITE_GAS_APPROVE_ENDPOINT.');
      return;
    }

    const confirmed = window.confirm(language === 'ja'
      ? `ファイル「${file.name}」を承認して Approved フォルダへ移動します。\n実行しますか？`
      : `Approve file "${file.name}" and move it to the Approved folder.\nProceed?`
    );
    if (!confirmed) return;

    setApprovingFileIds((prev) => [...prev, file.id]);
    try {
      const url = `${GAS_APPROVE_ENDPOINT}${GAS_APPROVE_ENDPOINT.includes('?') ? '&' : '?'}path=approve_pending_file`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
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
        throw new Error(result?.message || text || (language === 'ja' ? '承認処理に失敗しました' : 'Approval failed'));
      }

      setDriveFiles((prev) => prev.filter((f) => f.id !== file.id));
      alert(language === 'ja' ? `承認しました: ${file.name}` : `Approved: ${file.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : (language === 'ja' ? '不明なエラーが発生しました' : 'An unknown error occurred');
      alert(language === 'ja' ? `承認に失敗しました: ${message}` : `Approval failed: ${message}`);
    } finally {
      setApprovingFileIds((prev) => prev.filter((id) => id !== file.id));
    }
  };

  const handleReject = async (file: DriveFile) => {
    if (!GAS_REJECT_ENDPOINT) {
      alert(language === 'ja'
        ? '拒否エンドポイントが未設定です。VITE_GAS_REJECT_ENDPOINT を確認してください。'
        : 'Reject endpoint is not configured. Check VITE_GAS_REJECT_ENDPOINT.');
      return;
    }

    const confirmed = window.confirm(language === 'ja'
      ? `ファイル「${file.name}」を削除します。\nこの操作は取り消せません。実行しますか？`
      : `Delete file "${file.name}".\nThis action cannot be undone. Proceed?`
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

      let finalError = language === 'ja' ? '拒否処理に失敗しました' : 'Rejection failed';
      let succeeded = false;

      for (const req of requests) {
        const response = await fetch(req.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
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
      alert(language === 'ja' ? `削除しました: ${file.name}` : `Deleted: ${file.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : (language === 'ja' ? '不明なエラーが発生しました' : 'An unknown error occurred');
      alert(language === 'ja' ? `拒否に失敗しました: ${message}` : `Rejection failed: ${message}`);
    } finally {
      setRejectingFileIds((prev) => prev.filter((id) => id !== file.id));
    }
  };

  const renderFileRow = (file: DriveFile) => {
    const tag = resolvedTagsByFileId.get(file.id);
    return (
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
                <span>{formatDateTime(file.modifiedTime, language === 'ja' ? 'ja-JP' : 'en-US')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Cloud className="w-4 h-4" />
                <span>Google Drive</span>
              </div>
            </div>
            {tag && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {tag.matchType === 'heuristic' && (
                  <span className="px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
                    {t('admin.tag.estimated')}
                  </span>
                )}
                {tag.subject && (
                  <span className="px-2 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                    {t('admin.tag.subject')} {tag.subject}
                  </span>
                )}
                {tag.instructor && (
                  <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {t('admin.tag.instructor')} {tag.instructor}
                  </span>
                )}
                {tag.area && (
                  <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {t('admin.tag.area')} {tag.area}
                  </span>
                )}
                {tag.term && (
                  <span className="px-2 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                    {t('admin.tag.term')} {tag.term}
                  </span>
                )}
                {tag.year && (
                  <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {t('admin.tag.year')} {tag.year}
                  </span>
                )}
                {tag.type && (
                  <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    {t('admin.tag.type')} {tag.type}
                  </span>
                )}
                {tag.allowedMaterialsStr && (
                  <span className="px-2 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                    {t('admin.tag.materials')} {tag.allowedMaterialsStr}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="w-fit flex flex-col items-stretch gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleApprove(file)}
                disabled={approvingFileIds.includes(file.id)}
                className="text-sm px-4 py-2 rounded-lg border border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
              >
                {approvingFileIds.includes(file.id) ? t('admin.approving') : t('admin.approve')}
              </button>
              <button
                type="button"
                onClick={() => handleReject(file)}
                disabled={rejectingFileIds.includes(file.id)}
                className="text-sm px-4 py-2 rounded-lg border border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
              >
                {rejectingFileIds.includes(file.id) ? t('admin.rejecting') : t('admin.reject')}
              </button>
            </div>
            {file.webViewLink ? (
              <a
                href={file.webViewLink}
                target="_blank"
                rel="noreferrer"
                className="w-full text-center text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {t('admin.open')}
              </a>
            ) : (
              <button
                className="w-full text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed"
                disabled
              >
                {t('admin.noLink')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('admin.backToHome')}
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.title')}</h1>
          <p className="text-gray-600 mt-2">{t('admin.subtitle')}</p>
          <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            {driveSummary}
          </div>
          {driveStatus === 'error' && (
            <div className="mt-2 text-xs text-red-500">{driveError}</div>
          )}
          <details className="mt-3 text-xs text-gray-400">
            <summary className="cursor-pointer select-none">{t('admin.log.title')}</summary>
            <div className="mt-2 space-y-2">
              <div>{t('admin.log.endpoint')} {GAS_DRIVE_ENDPOINT ?? t('admin.log.notSet')}</div>
              <div>{t('admin.log.approveEndpoint')} {GAS_APPROVE_ENDPOINT ?? t('admin.log.notSet')}</div>
              <div>{t('admin.log.rejectEndpoint')} {GAS_REJECT_ENDPOINT ?? t('admin.log.notSet')}</div>
              <div>{t('admin.log.rejectPath')} {GAS_REJECT_PATH}</div>
              <div>{t('admin.log.status')} {driveStatus}</div>
              {driveError && <div>{t('admin.log.error')} {driveError}</div>}
              <div>{t('admin.log.responseSample')} {driveRaw ? driveRaw : t('admin.log.empty')}</div>
            </div>
          </details>
        </div>

        {[
          { key: 'exams', title: language === 'ja' ? 'テスト一覧' : 'Exam List', files: examFiles },
          { key: 'assignments', title: language === 'ja' ? '課題一覧' : 'Assignment List', files: assignmentFiles },
          { key: 'uncategorized', title: language === 'ja' ? '未分類' : 'Uncategorized', files: uncategorizedFiles },
        ].map((section) => (
          <div key={section.key} className="bg-white rounded-xl shadow mb-8">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">{section.title}</div>
              <div className="text-xs text-gray-500">{t('admin.files.sortOrder')}</div>
            </div>

            <div className="divide-y">
              {driveStatus === 'missing' && (
                <div className="p-6 text-sm text-gray-500">{t('admin.files.missingEnv')}</div>
              )}
              {driveStatus === 'loading' && (
                <div className="p-6 text-sm text-gray-500">{t('admin.files.fetching')}</div>
              )}
              {driveStatus === 'error' && (
                <div className="p-6 text-sm text-gray-500">{t('admin.files.fetchError')}</div>
              )}
              {driveStatus === 'ready' && section.files.length === 0 && (
                <div className="p-6 text-sm text-gray-500">
                  {language === 'ja' ? `${section.title}に表示できるファイルがありません。` : `No files to display in ${section.title}.`}
                </div>
              )}
              {driveStatus === 'ready' && section.files.map((file) => renderFileRow(file))}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}