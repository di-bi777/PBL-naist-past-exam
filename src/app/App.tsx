import { useState } from 'react';
import { Header } from '@/app/components/Header';
import { LoginPage } from '@/app/components/LoginPage';
import { HomePage } from '@/app/components/HomePage';
import { TestList } from '@/app/components/TestList';
import { TestDetail } from '@/app/components/TestDetail';
import { TestForm } from '@/app/components/TestForm';
import { AssignmentList } from '@/app/components/AssignmentList';
import { AssignmentDetail } from '@/app/components/AssignmentDetail';
import { AssignmentForm } from '@/app/components/AssignmentForm';
import { AdminPage } from '@/app/components/AdminPage';

type Page = 
  | 'login'
  | 'home' 
  | 'test-list' 
  | 'test-detail' 
  | 'test-form'
  | 'assignment-list' 
  | 'assignment-detail' 
  | 'assignment-form'
  | 'admin';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [returnPage, setReturnPage] = useState<Page>('home');
  const [previousPage, setPreviousPage] = useState<Page | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [username, setUsername] = useState('');
  const [selectedTestId, setSelectedTestId] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');

  const handleLogin = (name: string) => {
    setUsername('管理者');
    setCurrentPage('admin');
  };

  const handleLogout = () => {
    setUsername('');
    setCurrentPage('home');
  };

  const handleNavigate = (page: Page, id?: string) => {
    if (page === 'login') {
      setReturnPage(currentPage);
    }
    if (page === 'test-detail' && id) {
      setSelectedTestId(id);
    } else if (page === 'assignment-detail' && id) {
      setSelectedAssignmentId(id);
    }
    // フォームページに遷移する場合は前のページを記憶
    if (page === 'test-form' || page === 'assignment-form') {
      setPreviousPage(currentPage);
    }
    setCurrentPage(page);
  };

  return (
    <div className="size-full">
      {currentPage !== 'login' && (
        <Header 
          isLoggedIn={Boolean(username)}
          username={username} 
          onLogout={handleLogout}
          onLogin={() => handleNavigate('login')}
          onAdminNavigate={() => handleNavigate('admin')}
        />
      )}

      {currentPage === 'login' && (
        <LoginPage onLogin={handleLogin} />
      )}

      {currentPage === 'home' && (
        <HomePage onNavigate={handleNavigate} />
      )}

      {currentPage === 'test-list' && (
        <TestList 
          onNavigate={handleNavigate}
          onShowForm={() => handleNavigate('test-form')}
        />
      )}

      {currentPage === 'test-detail' && (
        <TestDetail 
          testId={selectedTestId}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'test-form' && (
        <TestForm 
          onNavigate={handleNavigate}
          previousPage={previousPage || 'test-list'}
        />
      )}

      {currentPage === 'assignment-list' && (
        <AssignmentList 
          onNavigate={handleNavigate}
          onShowForm={() => handleNavigate('assignment-form')}
        />
      )}

      {currentPage === 'assignment-detail' && (
        <AssignmentDetail 
          assignmentId={selectedAssignmentId}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'assignment-form' && (
        <AssignmentForm 
          onNavigate={handleNavigate}
          previousPage={previousPage || 'assignment-list'}
        />
      )}

      {currentPage === 'admin' && (
        <AdminPage onBack={() => handleNavigate(returnPage)} />
      )}
    </div>
  );
}
