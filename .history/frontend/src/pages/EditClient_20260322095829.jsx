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
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const data = await api.getClient(id);
      // Ensure numeric values are properly formatted
      const formattedClient = {
        ...data.client,
        totalAmount: parseFloat(data.client.totalAmount) || 0,
        totalPaid: parseFloat(data.client.totalPaid) || 0,
        dueAmount: (parseFloat(data.client.totalAmount) || 0) - (parseFloat(data.client.totalPaid) || 0)
      };
      setClient(formattedClient);
    } catch (err) {
      setError('Failed to load client');
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (formData) => {
    const errors = {};
    
    if (formData.totalAmount < 0) {
      errors.totalAmount = 'Total amount cannot be negative';
    }
    
    if (formData.totalPaid < 0) {
      errors.totalPaid = 'Total paid cannot be negative';
    }
    
    if (formData.totalPaid > formData.totalAmount) {
      errors.totalPaid = 'Total paid cannot exceed total amount';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (formData) => {
    // Validate before submitting
    if (!validateForm(formData)) {
      return;
    }
    
    try {
      // Calculate due amount
      const dueAmount = formData.totalAmount - formData.totalPaid;
      const submissionData = {
        ...formData,
        dueAmount: dueAmount > 0 ? dueAmount : 0
      };
      
      await api.updateClient(id, submissionData);
      navigate(`/client/${id}`);
    } catch (err) {
      setError('Failed to update client');
      console.error('Update error:', err);
    }
  };

  if (loading) return (
    <div className="p-6 text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="mt-2 text-gray-600">Loading client data...</p>
    </div>
  );
  
  if (error) return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );

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

        {/* Client Info with Financial Summary */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">Editing</div>
            <div className="font-medium text-gray-900">{client?.businessName}</div>
            <div className="text-xs text-gray-500 mt-1">
              Total: ₹{client?.totalAmount?.toLocaleString()} | 
              Paid: ₹{client?.totalPaid?.toLocaleString()} | 
              Due: ₹{(client?.totalAmount - client?.totalPaid)?.toLocaleString()}
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full ${
            client?.paymentStatus === 'Paid' ? 'bg-green-500' :
            client?.paymentStatus === 'Pending' ? 'bg-yellow-500' :
            client?.paymentStatus === 'Overdue' ? 'bg-red-500' :
            'bg-blue-500'
          }`} />
        </div>
      </div>

      {/* Display validation errors summary */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm font-medium">Please fix the following errors:</p>
          <ul className="list-disc list-inside text-red-500 text-sm mt-1">
            {Object.values(validationErrors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Client Form */}
      <ClientForm
        key={client?.id} // Add key to force re-render when client changes
        initialData={client}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/')}
        validationErrors={validationErrors}
      />
    </div>
  );
}