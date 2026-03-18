import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ClientFilters from '../components/ClientFilters';
import ClientTable from '../components/ClientTable';
import StatsCards from '../components/StatsCards';
import api from '../services/api';

export default function Dashboard() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await api.getClients();
      setClients(data);
      setFilteredClients(data);
      setError('');
    } catch (err) {
      setError('Failed to load clients');
      console.error(err);
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
      filtered.sort((a, b) => b.totalDue - a.totalDue);
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

  // NEW: Handle payment addition
  const handlePaymentAdd = async (clientId, paymentData) => {
    try {
      await api.addPayment(clientId, paymentData);
      await loadClients(); // Reload to show updated status
    } catch (err) {
      setError('Failed to add payment');
    }
  };

  // NEW: Handle manual status update
  const handleStatusUpdate = async (clientId, status) => {
    try {
      await api.updatePaymentStatus(clientId, status);
      await loadClients(); // Reload to show updated status
    } catch (err) {
      setError('Failed to update status');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Client Dashboard</h1>
        <Link
          to="/add"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Add New Client
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <StatsCards clients={clients} />
      <ClientFilters onSearch={handleSearch} onFilter={handleFilter} />
      
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <ClientTable 
          clients={filteredClients} 
          onDelete={handleDelete}
          onPaymentAdd={handlePaymentAdd}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}