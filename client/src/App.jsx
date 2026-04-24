import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner'; 
import DashboardLayout from './layouts/DashboardLayout';

// Intelligence Components
import VoiceIntelligence from './pages/VoiceIntelligence'; // 1. IMPORT MIC HERE

// Auth Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

// Production Pages
import Dashboard from './pages/Dashboard.jsx'; 
import Scanner from './pages/Scanner.jsx'; 
import Invoices from './pages/Invoices.jsx';
import Email from './pages/Email.jsx';
import Chatbot from './pages/Chatbot.jsx';
import Analytics from './pages/Analytics.jsx';
import Records from './pages/Records.jsx';

// Protected Route Logic
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token || token === "undefined" || token === "null") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Route Logic
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token && token !== "undefined" && token !== "null") {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <>
      {/* --- NEURAL TOASTER --- */}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        theme="dark"
        expand={true}
        toastOptions={{
          style: { 
            borderRadius: '1.5rem', 
            padding: '20px',
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f8fafc',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          },
        }}
      />

      {/* --- 2. GLOBAL VOICE INTELLIGENCE --- */}
      {/* We only show the mic if the user is logged in */}
      {isAuthenticated && <VoiceIntelligence />}

      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Dashboard Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="scanner" element={<Scanner />} /> 
          <Route path="invoices" element={<Invoices />} />
          <Route path="records" element={<Records />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="chatbot" element={<Chatbot />} />
          <Route path="email" element={<Email />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;