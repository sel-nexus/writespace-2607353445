import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ReadBlog from './pages/ReadBlog.jsx';
import Home from './pages/Home.jsx';
import WriteBlog from './pages/WriteBlog.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import UserManagement from './pages/UserManagement.jsx';

/**
 * Route the static single-page application.
 * @returns {JSX.Element} Application routes.
 */
export default function App() {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
    const title = path === '/login' ? 'Login | WriteSpace'
      : path === '/register' ? 'Register | WriteSpace'
        : path === '/blogs' ? 'All Blogs | WriteSpace'
          : path === '/admin' ? 'Admin Dashboard | WriteSpace'
            : path === '/users' ? 'Manage Users | WriteSpace'
              : path === '/write' ? 'Write a Post | WriteSpace'
                : path.startsWith('/edit/') ? 'Edit Post | WriteSpace'
                  : path.startsWith('/blog/') ? 'Read Post | WriteSpace'
                    : 'WriteSpace';
    document.title = title;
  }, [location.pathname]);
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<ProtectedRoute guestOnly><LoginPage /></ProtectedRoute>} />
      <Route path="/register" element={<ProtectedRoute guestOnly><RegisterPage /></ProtectedRoute>} />
      <Route path="/blogs" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute adminOnly><UserManagement /></ProtectedRoute>} />
      <Route path="/blog/:id" element={<ReadBlog />} />
      <Route path="/write" element={<ProtectedRoute><WriteBlog /></ProtectedRoute>} />
      <Route path="/edit/:id" element={<ProtectedRoute><WriteBlog /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
