import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Welcome from '@/pages/Welcome';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import RoleSelection from '@/pages/RoleSelection';
import Home from '@/pages/Home';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/home" replace /> : <Welcome />} />
      <Route path="/sign-in" element={user ? <Navigate to="/home" replace /> : <SignIn />} />
      <Route path="/sign-up" element={user ? <Navigate to="/home" replace /> : <SignUp />} />
      <Route
        path="/role-selection"
        element={
          <ProtectedRoute>
            <RoleSelection />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
