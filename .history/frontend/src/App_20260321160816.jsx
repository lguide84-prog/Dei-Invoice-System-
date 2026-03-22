import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import ClientDetails from './pages/ClientDetails';
import EditClient from './pages/EditClient';
import ClientForm from './components/ClientForm';
import api from './services/api';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Main App Content with Routes
const AppContent = () => {
  const { user, loading, isRegistrationOpen } = useAuth();

  const handleAddClient = async (formData) => {
    try {
      await api.createClient(formData);
      window.location.href = '/';
    } catch (error) {
      alert('Failed to create client');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl">Loading...</div>
    </div>;
  }

  // If user is logged in, show client management dashboard
  if (user) {
    return (
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/client/:id" element={<ClientDetails />} />
            <Route path="/edit/:id" element={<EditClient />} />
            <Route 
              path="/add" 
              element={
                <div className="p-6">
                  <ClientForm 
                    onSubmit={handleAddClient}
                    onCancel={() => window.location.href = '/'}
                  />
                </div>
              } 
            />
            {/* Redirect any unknown routes to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    );
  }

  // If no user exists in database, show registration
  if (isRegistrationOpen) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // If user exists but not logged in, show login
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

// Main App Component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;