import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ClientDetails from './pages/ClientDetails';
import EditClient from './pages/EditClient';
import ClientForm from './components/ClientForm';
import api from './services/api';

function App() {
  const handleAddClient = async (formData) => {
    try {
      await api.createClient(formData);
      window.location.href = '/';
    } catch (error) {
      alert('Failed to create client');
    }
  };

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
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;