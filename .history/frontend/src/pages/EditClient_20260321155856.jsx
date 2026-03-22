import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ClientForm from '../components/ClientForm';
import api from '../services/api';

export default function EditClient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const data = await api.getClient(id);
      setClient(data.client);
    } catch (err) {
      setError('Failed to load client');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await api.updateClient(id, formData);
      navigate(`/client/${id}`);
    } catch (err) {
      setError('Failed to update client');
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb Navigation */}
      <nav className="mb-4 flex items-center text-sm text-gray-500">
        <Link to="/" className="hover:text-blue-600 transition-colors">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <Link to={`/client/${id}`} className="hover:text-blue-600 transition-colors">
          {client?.businessName || 'Client Details'}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Edit</span>
      </nav>

      {/* Header with Back Button and Title */}
      <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          {/* Back to Home Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            title="Back to Dashboard"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Dashboard</span>
          </button>

          {/* Back to Client Button */}
          <button
            onClick={() => navigate(`/client/${id}`)}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            title="Back to Client Details"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Client Details</span>
          </button>
        </div>

        {/* Client Info */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-gray-500">Editing</div>
            <div className="font-medium text-gray-900">{client?.businessName}</div>
          </div>
          <div className={`w-2 h-2 rounded-full ${
            client?.paymentStatus === 'Paid' ? 'bg-green-500' :
            client?.paymentStatus === 'Pending' ? 'bg-yellow-500' :
            client?.paymentStatus === 'Overdue' ? 'bg-red-500' :
            'bg-blue-500'
          }`} />
        </div>
      </div>

      {/* Client Form */}
      <ClientForm
        initialData={client}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/')} // Cancel goes to home page
      />
    </div>
  );
}