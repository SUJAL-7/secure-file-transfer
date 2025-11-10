import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { CryptoProvider } from './context/CryptoContext.jsx';
import { TransferProvider } from './context/TransferContext.jsx';
import { useAuth } from './hooks/useAuth.js';
import { useWebSocket } from './hooks/useWebSocket.js';
import { useEffect } from 'react';

// Layout
import Layout from './components/layout/Layout.jsx';

// Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import KeySetup from './pages/KeySetup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SendFilePage from './pages/SendFilePage.jsx';
import ReceivedFiles from './pages/ReceivedFiles.jsx';
import SentFiles from './pages/SentFiles.jsx';
import Profile from './pages/Profile.jsx';

// Loader
import Loader from './components/common/Loader.jsx';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen text="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// WebSocket Initializer
const WebSocketInitializer = ({ children }) => {
  const { isAuthenticated } = useAuth();
  useWebSocket(); // Initialize WebSocket connection

  return children;
};

// App Content (with auth context)
const AppContent = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <WebSocketInitializer>
                <Layout />
              </WebSocketInitializer>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="send" element={<SendFilePage />} />
          <Route path="received" element={<ReceivedFiles />} />
          <Route path="sent" element={<SentFiles />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route
          path="/key-setup"
          element={
            <ProtectedRoute>
              <KeySetup />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CryptoProvider>
          <TransferProvider>
            <AppContent />
          </TransferProvider>
        </CryptoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;