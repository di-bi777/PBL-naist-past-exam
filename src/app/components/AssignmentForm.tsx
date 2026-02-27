import { useState, ChangeEvent } from 'react';
import { ArrowLeft, Save, Upload, Loader2 } from 'lucide-react';
import { areaOptions, termOptions, getAreaLabel } from '../constants/options';
import { GAS_ENDPOINT } from '../constants/gas';
import { useLanguage } from '../contexts/LanguageContext';

interface AssignmentFormProps {
  onNavigate: (page: 'assignment-list' | 'home') => void;
  previousPage: 'assignment-list' | 'home';
}

export function AssignmentForm({ onNavigate, previousPage }: AssignmentFormProps) {
  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
  const { t, language } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // 必要な情報のみに絞ったState
  const [formData, setFormData] = useState({
    subject: '',        // 科目名
    area: '',           // 領域
    semester: '',       // 開講期
    year: new Date().getFullYear(), // 年度
    lectureNumber: '',  // 第何回講義
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert(language === 'ja' ? 'ファイルをアップロードしてください' : 'Please upload a file');
      return;
    }
    if (file.size >= MAX_FILE_SIZE_BYTES) {
      alert(language === 'ja' ? 'ファイルサイズは10MB未満にしてください' : 'File size must be under 10MB');
      return;
    }

    setIsUploading(true);

    try {
      const base64Content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const res = reader.result as string;
          resolve(res.split(',')[1]);
        };
        reader.onerror = reject;
      });

      // --- ファイル名の自動生成ロジック (課題用) ---
      // 形式: 領域名_科目名_第X回_課題.拡張子
      const extension = file.name.split('.').pop();
      // lectureNumberが数字だけの場合は「第〇回」を付与、すでに文字が含まれる場合はそのまま結合するなど調整可能
      // ここでは入力値をそのまま使用し、ファイル名生成時に「第」「回」を付与します
      const areaLabel = getAreaLabel(formData.area) || formData.area;
      const generatedFileName = `${areaLabel}_${formData.subject}_第${formData.lectureNumber}回_課題.${extension}`;

      const payload = {
        ...formData,
        lecture_no: formData.lectureNumber,
        term: formData.semester,
        fileData: base64Content,
        fileName: generatedFileName, // 生成したファイル名をセット
        mimeType: file.type,
        type: '課題', // スプレッドシート側で判別できるようにタイプを固定
      };

      const response = await fetch(`${GAS_ENDPOINT}?path=upload_assignment`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify(payload),
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

      if (response.ok && result?.status === 'success') {
        alert(language === 'ja'
          ? `課題を登録しました\n保存名: ${generatedFileName}`
          : `Assignment registered.\nSaved as: ${generatedFileName}`);
        onNavigate('assignment-list');
      } else {
        const message = result?.message ? String(result.message) : text || (language === 'ja' ? '送信に失敗しました' : 'Submission failed');
        throw new Error(message);
      }
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : String(error);
      alert(language === 'ja' ? `エラーが発生しました\n${msg}` : `An error occurred\n${msg}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const areaLabelForDisplay = getAreaLabel(formData.area) || (language === 'ja' ? '領域' : 'Area');

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* --- 全画面ローディングオーバーレイ --- */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-bold text-gray-800">{t('form.assignment.uploading')}</p>
            <p className="text-sm text-gray-500 mt-2">
              {language === 'ja'
                ? `${areaLabelForDisplay}_${formData.subject}_第${formData.lectureNumber}回_課題 として保存しています`
                : `Saving as ${areaLabelForDisplay}_${formData.subject}_Lecture${formData.lectureNumber}_Assignment`}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <button
          onClick={() => onNavigate(previousPage)}
          disabled={isUploading}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('form.cancel')}
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('form.assignment.title')}</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 基本情報 */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">{t('form.basicInfo')}</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('form.subject')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    placeholder={language === 'ja' ? '例：データ構造とアルゴリズム' : 'e.g. Data Structures and Algorithms'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-100"
                    required
                    disabled={isUploading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('form.assignment.lectureNumber')} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {t('form.assignment.lecturePrefix') && <span className="text-gray-600 font-medium">{t('form.assignment.lecturePrefix')}</span>}
                    <input
                      type="number"
                      value={formData.lectureNumber}
                      onChange={(e) => handleChange('lectureNumber', e.target.value)}
                      placeholder="1"
                      min="1"
                      max="15"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-100 text-center"
                      required
                      disabled={isUploading}
                    />
                    {t('form.assignment.lectureSuffix') && <span className="text-gray-600 font-medium">{t('form.assignment.lectureSuffix')}</span>}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('form.area')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.area}
                    onChange={(e) => handleChange('area', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-100"
                    required
                    disabled={isUploading}
                  >
                    <option value="">{t('form.pleaseSelect')}</option>
                    {areaOptions.map((area) => (
                      <option key={area.key} value={area.key}>{t(`area.${area.key}`)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('form.semester')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => handleChange('semester', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-100"
                    required
                    disabled={isUploading}
                  >
                    <option value="">{t('form.pleaseSelect')}</option>
                    {termOptions.map((term) => (
                      <option key={term.key} value={term.key}>{t(`term.${term.key}`)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('form.year')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleChange('year', parseInt(e.target.value))}
                    min="2000"
                    max="2030"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-100"
                    required
                    disabled={isUploading}
                  />
                </div>
              </div>
            </div>

            {/* 添付ファイル */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">{t('form.assignment.fileSection')}</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.assignment.fileLabel')} <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${file ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'} ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                      <Upload className={`w-8 h-8 mb-2 ${file ? 'text-blue-500' : 'text-gray-400'}`} />
                      <p className="text-sm text-gray-600 truncate max-w-xs">
                        {file ? file.name : t('form.fileUpload')}
                      </p>
                      {file && !isUploading && (
                        <p className="text-xs text-blue-500 mt-2 font-medium">
                          {t('form.saveName')}{' '}
                          {language === 'ja'
                            ? `${areaLabelForDisplay}_${formData.subject || '科目'}_第${formData.lectureNumber || 'X'}回_課題`
                            : `${areaLabelForDisplay}_${formData.subject || 'Subject'}_Lecture${formData.lectureNumber || 'X'}_Assignment`}
                        </p>
                      )}
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileChange} 
                      // PDF, 画像, 一般的なコードファイルを許可
                      accept=".pdf,image/*,.c,.cpp,.py,.java,.js,.ts,.html,.css,.txt,.zip" 
                      required 
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => onNavigate(previousPage)}
                disabled={isUploading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {t('form.cancel')}
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="flex-[2] px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2 transition-all"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('form.submitting')}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {t('form.submit')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
