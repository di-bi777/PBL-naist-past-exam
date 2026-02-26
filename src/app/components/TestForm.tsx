import { useState, ChangeEvent } from 'react';
import { ArrowLeft, Save, Upload, Loader2 } from 'lucide-react';
import { areaOptions, termOptions, allowedMaterialOptions, getAreaLabel } from '../constants/options';
import { GAS_ENDPOINT } from '../constants/gas';
import { useLanguage } from '../contexts/LanguageContext';

interface TestFormProps {
  onNavigate: (page: 'test-list' | 'home') => void;
  previousPage: 'test-list' | 'home';
}

export function TestForm({ onNavigate, previousPage }: TestFormProps) {
  const { t, language } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    area: '',
    semester: '',
    year: new Date().getFullYear(),
    professor: '',
    allowedMaterials: [] as string[],
    content: '',
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

      // --- ファイル名の自動生成ロジック ---
      // 形式: 領域名_科目名_年度.拡張子
      const extension = file.name.split('.').pop();
      const areaLabel = getAreaLabel(formData.area) || formData.area;
      const generatedFileName = `${areaLabel}_${formData.subject}_${formData.year}.${extension}`;

      const payload = {
        ...formData,
        term: formData.semester,
        instructor: formData.professor,
        fileData: base64Content,
        fileName: generatedFileName, // 自動生成した名前をセット
        mimeType: file.type,
      };

      const response = await fetch(`${GAS_ENDPOINT}?path=upload_exam`, {
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
          ? `過去問を登録しました\n保存名: ${generatedFileName}`
          : `Past exam registered.\nSaved as: ${generatedFileName}`);
        onNavigate('test-list');
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

  const handleCheckboxChange = (item: string) => {
    const current = formData.allowedMaterials;
    const next = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    setFormData({ ...formData, allowedMaterials: next });
  };

  const areaLabelForDisplay = getAreaLabel(formData.area) || (language === 'ja' ? '領域' : 'Area');

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* ローディングオーバーレイ */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-bold text-gray-800">{t('form.exam.uploading')}</p>
            <p className="text-sm text-gray-500 mt-2">
              {language === 'ja'
                ? `${areaLabelForDisplay}_${formData.subject}_${formData.year} として保存しています`
                : `Saving as ${areaLabelForDisplay}_${formData.subject}_${formData.year}`}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => onNavigate(previousPage)}
          disabled={isUploading}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('form.cancel')}
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('form.exam.title')}</h1>

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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    required
                    disabled={isUploading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.exam.instructor')}</label>
                  <input
                    type="text"
                    value={formData.professor}
                    onChange={(e) => handleChange('professor', e.target.value)}
                    placeholder={language === 'ja' ? '佐藤教授' : 'Prof. Smith'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    disabled={isUploading}
                  />
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    required
                    disabled={isUploading}
                  />
                </div>
              </div>
            </div>

            {/* 試験詳細 */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">{t('form.exam.details')}</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('form.exam.allowedMaterials')}</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-white p-4 border border-gray-300 rounded-lg">
                  {allowedMaterialOptions.map((item) => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.allowedMaterials.includes(item.key)}
                        onChange={() => handleCheckboxChange(item.key)}
                        disabled={isUploading}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                        {t(`material.${item.key}`)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 添付ファイル */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">{t('form.exam.attachment')}</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.exam.fileLabel')} <span className="text-red-500">*</span>
                </label>
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${file ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'} ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <Upload className={`w-8 h-8 mb-2 ${file ? 'text-blue-500' : 'text-gray-400'}`} />
                    <p className="text-sm text-gray-600 truncate max-w-xs">
                      {file ? file.name : t('form.fileUpload')}
                    </p>
                    {file && !isUploading && (
                      <p className="text-xs text-blue-500 mt-2 font-medium">
                        {t('form.saveName')} {areaLabelForDisplay}_{formData.subject || (language === 'ja' ? '科目' : 'Subject')}_{formData.year}
                      </p>
                    )}
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange} 
                    accept=".pdf,image/*" 
                    required 
                    disabled={isUploading} 
                  />
                </label>
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isUploading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2 transition-all"
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
