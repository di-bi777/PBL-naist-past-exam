import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
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

type NavState = {
  from?: string;
};

const resolvePath = (page: Page, id?: string) => {
  switch (page) {
    case 'home':
      return '/';
    case 'login':
      return '/login';
    case 'admin':
      return '/admin';
    case 'test-list':
      return '/tests';
    case 'test-form':
      return '/tests/new';
    case 'test-detail':
      return id ? `/tests/${id}` : '/tests';
    case 'assignment-list':
      return '/assignments';
    case 'assignment-form':
      return '/assignments/new';
    case 'assignment-detail':
      return id ? `/assignments/${id}` : '/assignments';
    default:
      return '/';
  }
};

const shouldCaptureFrom = (page: Page) =>
  page === 'login' || page === 'test-form' || page === 'assignment-form' || page === 'admin';

const getTestFormPrevious = (fromPath?: string): 'test-list' | 'home' => {
  if (!fromPath) {
    return 'test-list';
  }
  if (fromPath.startsWith('/tests')) {
    return 'test-list';
  }
  return 'home';
};

const getAssignmentFormPrevious = (fromPath?: string): 'assignment-list' | 'home' => {
  if (!fromPath) {
    return 'assignment-list';
  }
  if (fromPath.startsWith('/assignments')) {
    return 'assignment-list';
  }
  return 'home';
};

export default function App() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as NavState | null;
  const fromPath = state?.from;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  const handleNavigate = (page: Page, id?: string) => {
    const path = resolvePath(page, id);
    const navState = shouldCaptureFrom(page) ? { from: location.pathname } : undefined;
    navigate(path, navState ? { state: navState } : undefined);
  };

  const handleLogout = () => {
    setUsername('');
    navigate('/');
  };

  const loginReturnTo = fromPath ?? '/';
  const adminReturnTo = fromPath ?? '/';

  const TestDetailRoute = () => {
    const { testId } = useParams<{ testId: string }>();
    if (!testId) {
      return <Navigate to="/tests" replace />;
    }
    return <TestDetail testId={testId} onNavigate={(page) => handleNavigate(page)} />;
  };

  const AssignmentDetailRoute = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    if (!assignmentId) {
      return <Navigate to="/assignments" replace />;
    }
    return (
      <AssignmentDetail
        assignmentId={assignmentId}
        onNavigate={(page) => handleNavigate(page)}
      />
    );
  };

  return (
    <div className="size-full">
      {location.pathname !== '/login' && (
        <Header
          isLoggedIn={Boolean(username)}
          username={username}
          onLogout={handleLogout}
          onLogin={() => handleNavigate('login')}
          onAdminNavigate={() => handleNavigate('admin')}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onNavigate={(page) => handleNavigate(page)}
              onAdminLogin={() => handleNavigate('login')}
              isLoggedIn={Boolean(username)}
            />
          }
        />
        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={(_name) => {
                setUsername('管理者');
                navigate('/admin', { state: { from: loginReturnTo } });
              }}
              onBack={() => navigate(loginReturnTo)}
            />
          }
        />
        <Route
          path="/tests"
          element={
            <TestList
              onNavigate={(page, id) => handleNavigate(page, id)}
              onShowForm={() => handleNavigate('test-form')}
            />
          }
        />
        <Route
          path="/tests/new"
          element={
            <TestForm
              onNavigate={(page) => handleNavigate(page)}
              previousPage={getTestFormPrevious(fromPath)}
            />
          }
        />
        <Route path="/tests/:testId" element={<TestDetailRoute />} />
        <Route
          path="/assignments"
          element={
            <AssignmentList
              onNavigate={(page, id) => handleNavigate(page, id)}
              onShowForm={() => handleNavigate('assignment-form')}
            />
          }
        />
        <Route
          path="/assignments/new"
          element={
            <AssignmentForm
              onNavigate={(page) => handleNavigate(page)}
              previousPage={getAssignmentFormPrevious(fromPath)}
            />
          }
        />
        <Route path="/assignments/:assignmentId" element={<AssignmentDetailRoute />} />
        <Route path="/admin" element={<AdminPage onBack={() => navigate(adminReturnTo)} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
