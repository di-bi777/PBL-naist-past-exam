import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Language = 'ja' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ja: {
    // Header
    'header.title': '過去問共有プラットフォーム',
    'header.logout': 'ログアウト',
    'header.login': 'ログイン',
    'header.admin': '管理者',

    // HomePage
    'home.title': '過去問共有プラットフォーム',
    'home.subtitle': 'みんなで作る、試験対策の知識ベース',
    'home.test.title': 'テスト（過去問）',
    'home.test.description': '過去のテスト問題を共有・閲覧できます。領域・開講期・科目別に整理されています。',
    'home.test.browse': '過去問を閲覧',
    'home.test.register': '過去問を登録',
    'home.assignment.title': '課題',
    'home.assignment.description': '授業の課題情報を共有・閲覧できます。過去の課題内容や注意点を確認できます。',
    'home.assignment.browse': '課題を閲覧',
    'home.assignment.register': '課題を登録',
    'home.stats.tests': '登録過去問',
    'home.stats.assignments': '課題情報',
    'home.admin.login': '管理者ログイン',

    // AdminPage
    'admin.backToHome': 'ホームに戻る',
    'admin.title': '管理者ページ',
    'admin.subtitle': 'アップロードされたファイルの閲覧・確認',
    'admin.drive.missing': 'GAS 連携の設定が未完了です（VITE_GAS_DRIVE_ENDPOINT）。',
    'admin.drive.loading': 'Google Drive からフォルダ内容を取得しています。',
    'admin.drive.error': 'Google Drive との連携に失敗しました。',
    'admin.drive.init': 'Google Drive 連携の初期化中です。',
    'admin.log.title': '実行ログ',
    'admin.log.endpoint': 'エンドポイント:',
    'admin.log.approveEndpoint': '承認エンドポイント:',
    'admin.log.rejectEndpoint': '拒否エンドポイント:',
    'admin.log.rejectPath': '拒否パス:',
    'admin.log.status': 'ステータス:',
    'admin.log.error': 'エラー:',
    'admin.log.responseSample': '応答サンプル:',
    'admin.log.empty': '（空）',
    'admin.log.notSet': '未設定',
    'admin.files.title': 'Google Drive フォルダ内のファイル',
    'admin.files.sortOrder': '更新日順',
    'admin.files.missingEnv': '環境変数 `VITE_GAS_DRIVE_ENDPOINT` を設定すると表示されます。',
    'admin.files.fetching': '取得中...',
    'admin.files.fetchError': 'Google Drive の取得に失敗しました。権限設定やフォルダ共有設定を確認してください。',
    'admin.files.empty': 'フォルダ内にファイルが見つかりません。',
    'admin.approve': '承認',
    'admin.approving': '承認中...',
    'admin.reject': '拒否',
    'admin.rejecting': '削除中...',
    'admin.open': '開く',
    'admin.noLink': 'リンクなし',

    // Shared form
    'form.cancel': 'キャンセル',
    'form.basicInfo': '基本情報',
    'form.subject': '科目名',
    'form.area': '領域',
    'form.semester': '開講期',
    'form.year': '年度',
    'form.pleaseSelect': '選択してください',
    'form.saveName': '保存名:',
    'form.fileUpload': 'クリックしてファイルをアップロード',
    'form.submit': '登録する',
    'form.submitting': '送信中...',

    // AssignmentForm
    'form.assignment.title': '課題を登録',
    'form.assignment.lectureNumber': '第何回講義',
    'form.assignment.lecturePrefix': '第',
    'form.assignment.lectureSuffix': '回',
    'form.assignment.fileSection': '課題ファイル',
    'form.assignment.fileLabel': 'ファイル（PDF, 写真, コードなど）',
    'form.assignment.uploading': '課題データを送信中...',

    // TestForm
    'form.exam.title': '過去問を登録',
    'form.exam.instructor': '担当教員',
    'form.exam.details': '試験詳細',
    'form.exam.allowedMaterials': '持ち込み可能品',
    'form.exam.attachment': '添付ファイル',
    'form.exam.fileLabel': '試験問題（PDF/画像）',
    'form.exam.uploading': 'データを送信中...',

    // Option labels
    'area.Information': '情報科学領域',
    'area.Biological': 'バイオサイエンス領域',
    'area.Materials': '物質創生科学領域',
    'term.spring': '春学期',
    'term.fall': '秋学期',
    'material.calc': '電卓',
    'material.dict': '辞書',
    'material.textbook': '教科書',
    'material.notes': 'ノート',
    'material.memo': '自作メモ',
  },
  en: {
    // Header
    'header.title': 'Past Exam Sharing Platform',
    'header.logout': 'Log Out',
    'header.login': 'Log In',
    'header.admin': 'Admin',

    // HomePage
    'home.title': 'Past Exam Sharing Platform',
    'home.subtitle': 'A collaborative knowledge base for exam preparation',
    'home.test.title': 'Tests (Past Exams)',
    'home.test.description': 'Share and browse past exam questions. Organized by field, semester, and subject.',
    'home.test.browse': 'Browse Exams',
    'home.test.register': 'Register Exam',
    'home.assignment.title': 'Assignments',
    'home.assignment.description': 'Share and browse assignment information. Check past assignment details and notes.',
    'home.assignment.browse': 'Browse Assignments',
    'home.assignment.register': 'Register Assignment',
    'home.stats.tests': 'Registered Exams',
    'home.stats.assignments': 'Assignment Info',
    'home.admin.login': 'Admin Login',

    // AdminPage
    'admin.backToHome': 'Back to Home',
    'admin.title': 'Admin Page',
    'admin.subtitle': 'Browse and review uploaded files',
    'admin.drive.missing': 'GAS integration is not configured (VITE_GAS_DRIVE_ENDPOINT).',
    'admin.drive.loading': 'Fetching folder contents from Google Drive.',
    'admin.drive.error': 'Failed to connect to Google Drive.',
    'admin.drive.init': 'Initializing Google Drive connection.',
    'admin.log.title': 'Execution Log',
    'admin.log.endpoint': 'Endpoint:',
    'admin.log.approveEndpoint': 'Approve Endpoint:',
    'admin.log.rejectEndpoint': 'Reject Endpoint:',
    'admin.log.rejectPath': 'Reject Path:',
    'admin.log.status': 'Status:',
    'admin.log.error': 'Error:',
    'admin.log.responseSample': 'Response Sample:',
    'admin.log.empty': '(empty)',
    'admin.log.notSet': 'Not set',
    'admin.files.title': 'Files in Google Drive Folder',
    'admin.files.sortOrder': 'By Modified Date',
    'admin.files.missingEnv': 'Set the `VITE_GAS_DRIVE_ENDPOINT` environment variable to display files.',
    'admin.files.fetching': 'Fetching...',
    'admin.files.fetchError': 'Failed to fetch from Google Drive. Check permission and folder sharing settings.',
    'admin.files.empty': 'No files found in folder.',
    'admin.approve': 'Approve',
    'admin.approving': 'Approving...',
    'admin.reject': 'Reject',
    'admin.rejecting': 'Deleting...',
    'admin.open': 'Open',
    'admin.noLink': 'No Link',

    // Shared form
    'form.cancel': 'Cancel',
    'form.basicInfo': 'Basic Information',
    'form.subject': 'Subject Name',
    'form.area': 'Area',
    'form.semester': 'Semester',
    'form.year': 'Year',
    'form.pleaseSelect': 'Please select',
    'form.saveName': 'Save as:',
    'form.fileUpload': 'Click to upload a file',
    'form.submit': 'Register',
    'form.submitting': 'Sending...',

    // AssignmentForm
    'form.assignment.title': 'Register Assignment',
    'form.assignment.lectureNumber': 'Lecture Number',
    'form.assignment.lecturePrefix': '',
    'form.assignment.lectureSuffix': '',
    'form.assignment.fileSection': 'Assignment File',
    'form.assignment.fileLabel': 'File (PDF, photos, code, etc.)',
    'form.assignment.uploading': 'Sending assignment data...',

    // TestForm
    'form.exam.title': 'Register Past Exam',
    'form.exam.instructor': 'Instructor',
    'form.exam.details': 'Exam Details',
    'form.exam.allowedMaterials': 'Allowed Materials',
    'form.exam.attachment': 'Attachment',
    'form.exam.fileLabel': 'Exam Questions (PDF/Image)',
    'form.exam.uploading': 'Sending data...',

    // Option labels
    'area.Information': 'Information Science',
    'area.Biological': 'Bioscience',
    'area.Materials': 'Materials Science',
    'term.spring': 'Spring Semester',
    'term.fall': 'Fall Semester',
    'material.calc': 'Calculator',
    'material.dict': 'Dictionary',
    'material.textbook': 'Textbook',
    'material.notes': 'Notebook',
    'material.memo': 'Personal Notes',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'ja') ? saved : 'ja';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
