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
  },
  en: {
    // Header
    'header.title': 'Past Exam Sharing Platform',
    'header.logout': 'Log Out',
    'header.login': 'Log In',

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
