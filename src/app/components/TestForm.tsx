import { useState, ChangeEvent } from 'react';
import { ArrowLeft, Save, Upload } from 'lucide-react';

interface TestFormProps {
  onNavigate: (page: 'test-list') => void;
}

export function TestForm({ onNavigate }: TestFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    area: '',
    semester: '',
    year: new Date().getFullYear(),
    professor: '',
    examDate: '',
    duration: '',
    allowedMaterials: '',
    description: '',
    content: '',
    additionalInfo: '',
  });

  // GASのデプロイ後に発行されるURLを入力してください
  const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxuF2DgLIcFgg0Pz7Ybv37ouqKkq56l5U9H83-Wt9DMO8BYNDB21xfsdg5kap-8FnZJ/exec';

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('ファイルをアップロードしてください');
      return;
    }

    setIsUploading(true);

    try {
      // ファイルをBase64に変換
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Content = (reader.result as string).split(',')[1];
        
        const payload = {
          ...formData,
          fileData: base64Content,
          fileName: file.name,
          mimeType: file.type,
        };

        // GASへPOST送信
        const response = await fetch(GAS_ENDPOINT, {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          alert('過去問とファイルを登録しました');
          onNavigate('test-list');
        } else {
          throw new Error('送信に失敗しました');
        }
      };
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  // ... (areas, semesters の定義はそのまま)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ... キャンセルボタンなどはそのまま ... */}

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">過去問を登録</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本情報の入力項目（既存） */}
            {/* ... */}

            {/* ファイルアップロード項目の追加 */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">添付ファイル</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  試験問題（PDF/画像） <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        {file ? file.name : "クリックしてファイルをアップロード"}
                      </p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,image/*" required />
                  </label>
                </div>
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isUploading}
                className={`flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Save className="w-5 h-5" />
                {isUploading ? '送信中...' : '登録する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}