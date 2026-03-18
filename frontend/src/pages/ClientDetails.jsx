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
      setClient(data.client);
      setPayments(data.payments || []);
      setError('');
    } catch (err) {
      setError('Failed to load client details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (paymentData) => {
    try {
      await api.addPayment(id, paymentData);
      setShowPaymentModal(false);
      await loadClientDetails(); // Reload to show updated data
    } catch (err) {
      setError('Failed to add payment');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!client) return <div className="p-6 text-center">Client not found</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-500 hover:text-blue-700"
        >
          ← Back
        </button>
        <div className="space-x-2">
          <Link
            to={`/edit/${client._id}`}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Edit
          </Link>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Payment
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{client.businessName}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Contact Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Contact Person:</span> {client.contactPerson || 'N/A'}</p>
              <p><span className="font-medium">Phone:</span> {client.phoneMobile}</p>
              <p><span className="font-medium">Email:</span> {client.email || 'N/A'}</p>
              <p><span className="font-medium">Address:</span> {client.address || 'N/A'}</p>
              <p><span className="font-medium">Website:</span> {client.website || 'N/A'}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Business Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Order Number:</span> {client.orderNumber || 'N/A'}</p>
              <p><span className="font-medium">Order Date:</span> {client.orderDate ? formatDate(client.orderDate) : 'N/A'}</p>
              <p><span className="font-medium">Sales Manager:</span> {client.salesManagerName || 'N/A'}</p>
              <p><span className="font-medium">Subscription:</span> {client.subscriptionService || 'N/A'}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Payment Summary</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Total Due:</span> {formatCurrency(client.totalDue)}</p>
              <p><span className="font-medium">Total Paid:</span> {formatCurrency(client.totalPaid)}</p>
              <p><span className="font-medium">Last Payment:</span> {client.lastPaymentDate ? formatDate(client.lastPaymentDate) : 'No payments yet'}</p>
              <p><span className="font-medium">Last Amount:</span> {client.lastPaymentAmount ? formatCurrency(client.lastPaymentAmount) : 'N/A'}</p>
              <p>
                <span className="font-medium">Status:</span>{' '}
                <span className={`px-2 py-1 text-sm rounded-full ${
                  client.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                  client.paymentStatus === 'Overdue' ? 'bg-red-100 text-red-800' :
                  client.paymentStatus === 'Partial' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {client.paymentStatus}
                </span>
              </p>
            </div>
          </div>

          {client.notes && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Notes</h2>
              <p className="text-gray-700">{client.notes}</p>
            </div>
          )}
        </div>
      </div>

      {payments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Payment History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Method</th>
                  <th className="px-4 py-2 text-left">Transaction ID</th>
                  <th className="px-4 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-t">
                    <td className="px-4 py-2">{formatDate(payment.paymentDate)}</td>
                    <td className="px-4 py-2">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-2">{payment.paymentMethod}</td>
                    <td className="px-4 py-2">{payment.transactionId || '-'}</td>
                    <td className="px-4 py-2">{payment.notes || '-'}</td>
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
        dueAmount={client.totalDue}
      />
    </div>
  );
}