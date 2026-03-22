import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';
import api from '../services/api';

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadClientDetails();
  }, [id]);

  const loadClientDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getClient(id);
      console.log('Client details response:', data);
      
      // 🔥 Fix: Handle different response formats
      if (data && data.client) {
        setClient(data.client);
        setPayments(data.payments || []);
      } else if (data && data._id) {
        setClient(data);
        setPayments(data.payments || []);
      } else {
        setClient(data);
        setPayments([]);
      }
      
      setError('');
    } catch (err) {
      console.error('Error loading client:', err);
      setError(err.message || 'Failed to load client details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (paymentData) => {
    try {
      await api.addPayment(id, paymentData);
      setShowPaymentModal(false);
      await loadClientDetails();
    } catch (err) {
      setError('Failed to add payment');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading) return (
    <div className="p-6 text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
      <div>Loading client details...</div>
    </div>
  );
  
  if (error) return (
    <div className="p-6 text-center">
      <div className="text-red-600 mb-4">{error}</div>
      <button
        onClick={() => navigate(-1)}
        className="text-blue-500 hover:text-blue-700"
      >
        ← Go Back
      </button>
    </div>
  );
  
  if (!client) return (
    <div className="p-6 text-center">
      <div className="text-gray-600 mb-4">Client not found</div>
      <button
        onClick={() => navigate('/')}
        className="text-blue-500 hover:text-blue-700"
      >
        ← Back to Dashboard
      </button>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
        >
          ← Back
        </button>
        <div className="space-x-2">
          <Link
            to={`/edit/${client._id}`}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Edit
          </Link>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Add Payment
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{client.businessName || 'N/A'}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Contact Information</h2>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-medium text-gray-800">Contact Person:</span> {client.contactPerson || 'N/A'}</p>
              <p><span className="font-medium text-gray-800">Phone:</span> {client.phoneMobile || 'N/A'}</p>
              <p><span className="font-medium text-gray-800">Email:</span> {client.email || 'N/A'}</p>
              <p><span className="font-medium text-gray-800">Address:</span> {client.address || 'N/A'}</p>
              <p><span className="font-medium text-gray-800">Website:</span> {client.website || 'N/A'}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Business Details</h2>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-medium text-gray-800">Order Number:</span> {client.orderNumber || 'N/A'}</p>
              <p><span className="font-medium text-gray-800">Order Date:</span> {formatDate(client.orderDate)}</p>
              <p><span className="font-medium text-gray-800">Sales Manager:</span> {client.salesManagerName || 'N/A'}</p>
              <p><span className="font-medium text-gray-800">Subscription:</span> {client.subscriptionService || 'N/A'}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Payment Summary</h2>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-medium text-gray-800">Total Amount:</span> {formatCurrency(client.totalAmount)}</p>
              <p><span className="font-medium text-gray-800">Total Paid:</span> {formatCurrency(client.totalPaid)}</p>
              <p><span className="font-medium text-gray-800">Total Due:</span> {formatCurrency(client.totalDue)}</p>
              <p><span className="font-medium text-gray-800">Last Payment:</span> {formatDate(client.lastPaymentDate)}</p>
              <p><span className="font-medium text-gray-800">Last Amount:</span> {formatCurrency(client.lastPaymentAmount)}</p>
              <p>
                <span className="font-medium text-gray-800">Status:</span>{' '}
                <span className={`px-2 py-1 text-sm rounded-full ${
                  client.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                  client.paymentStatus === 'Overdue' ? 'bg-red-100 text-red-800' :
                  client.paymentStatus === 'Partial' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {client.paymentStatus || 'Pending'}
                </span>
              </p>
            </div>
          </div>

          {client.notes && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Notes</h2>
              <p className="text-gray-600">{client.notes}</p>
            </div>
          )}
        </div>
      </div>

      {payments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Payment History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Method</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Transaction ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Notes</th>
                 </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => (
                  <tr key={payment._id || index} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-600">{formatDate(payment.paymentDate)}</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-800">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{payment.paymentMethod || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{payment.transactionId || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{payment.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handleAddPayment}
        clientName={client.businessName}
        dueAmount={client.totalDue || 0}
      />
    </div>
  );
}