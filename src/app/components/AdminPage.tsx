import { ArrowLeft, FileText, User, Calendar, Cloud } from 'lucide-react';
import { assignmentMocks } from '@/app/components/AssignmentList';

interface AdminPageProps {
  onBack: () => void;
}

export function AdminPage({ onBack }: AdminPageProps) {
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
            Google Drive 連携は今後追加予定
          </div>
        </div>

        <div className="bg-white rounded-xl shadow">
          <div className="border-b px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {assignmentMocks.length}件のアップロードが確認できます
            </div>
            <div className="text-xs text-gray-500">最新順（モック）</div>
          </div>

          <div className="divide-y">
            {assignmentMocks.map((assignment) => (
              <div key={assignment.id} className="p-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium text-gray-900">{assignment.fileName}</span>
                      <span className="text-gray-400">•</span>
                      <span>{assignment.fileSize}</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">{assignment.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{assignment.subject}</div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{assignment.uploadedBy}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{assignment.uploadedAt}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Cloud className="w-4 h-4" />
                        <span>{assignment.storageProvider}（予定）</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {assignment.area} / {assignment.semester}
                    </span>
                    {assignment.fileUrl ? (
                      <a
                        href={assignment.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        閲覧
                      </a>
                    ) : (
                      <button
                        className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed"
                        disabled
                      >
                        閲覧準備中
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
