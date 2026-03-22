import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ClientFilters from '../components/ClientFilters';
import ClientTable from '../components/ClientTable';
import StatsCards from '../components/StatsCards';
import api from '../services/api';

export default function Dashboard() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await api.getClients();
      console.log('Raw API response:', data);
      
      // 🔥 Fix: Handle different response formats
      let clientsArray = [];
      
      if (Array.isArray(data)) {
        clientsArray = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        clientsArray = data.data;
      } else if (data && data.clients && Array.isArray(data.clients)) {
        clientsArray = data.clients;
      } else {
        console.error('Unexpected data format:', data);
        clientsArray = [];
      }
      
      console.log('Processed clients:', clientsArray);
      console.log('Number of clients:', clientsArray.length);
      
      setClients(clientsArray);
      setFilteredClients(clientsArray);
      
    } catch (err) {
      console.error('Error in loadClients:', err);
      setError(err.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    if (!term.trim()) {
      setFilteredClients(clients);
      return;
    }
    const filtered = clients.filter(c => 
      c.businessName?.toLowerCase().includes(term.toLowerCase()) ||
      c.phoneMobile?.includes(term) ||
      c.orderNumber?.includes(term) ||
      c.contactPerson?.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  const handleFilter = (filterType) => {
    if (filterType === 'all') {
      setFilteredClients(clients);
      return;
    }
    
    let filtered = [...clients];
    if (filterType === 'due') {
      filtered.sort((a, b) => (b.totalDue || 0) - (a.totalDue || 0));
    } else {
      filtered = filtered.filter(c => 
        c.paymentStatus?.toLowerCase() === filterType.toLowerCase()
      );
    }
    setFilteredClients(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await api.deleteClient(id);
        await loadClients();
      } catch (err) {
        setError('Failed to delete client');
      }
    }
  };

  const handlePaymentAdd = async (clientId, paymentData) => {
    try {
      await api.addPayment(clientId, paymentData);
      await loadClients();
    } catch (err) {
      setError('Failed to add payment');
    }
  };

  const handleStatusUpdate = async (clientId, status) => {
    try {
      await api.updatePaymentStatus(clientId, status);
      await loadClients();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">
                Client Management System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Welcome,</span> {user?.name}
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Client Dashboard</h1>
            <Link
              to="/add"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              + Add New Client
            </Link>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Error: {error}
            </div>
          )}

          <StatsCards clients={clients} />
          <ClientFilters onSearch={handleSearch} onFilter={handleFilter} />
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <div className="text-gray-500">Loading clients...</div>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first client</p>
              <Link
                to="/add"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg inline-block"
              >
                + Add New Client
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Showing {filteredClients.length} of {clients.length} clients
              </div>
              <ClientTable 
                clients={filteredClients} 
                onDelete={handleDelete}
                onPaymentAdd={handlePaymentAdd}
                onStatusUpdate={handleStatusUpdate}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}