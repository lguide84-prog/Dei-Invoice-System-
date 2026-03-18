import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PaymentModal from './PaymentModal';

export default function ClientTable({ clients, onDelete, onPaymentAdd, onStatusUpdate }) {
  const [selectedClient, setSelectedClient] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'Partial': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Paid': return '✅';
      case 'Pending': return '⏳';
      case 'Overdue': return '⚠️';
      case 'Partial': return '🔄';
      default: return '❓';
    }
  };

  // NEW: Generate WhatsApp message
  const getWhatsAppMessage = (client) => {
    const date = new Date().toLocaleDateString('en-IN');
    const businessName = client.businessName || 'Valued Customer';
    const dueAmount = formatCurrency(client.totalDue);
    const contactPerson = client.contactPerson || 'Sir/Madam';
    
    // Payment reminder message
    if (client.totalDue > 0) {
      return encodeURIComponent(
        `Hello ${contactPerson},\n\n` +
        `This is a friendly reminder regarding your payment with ${businessName}.\n\n` +
        `📊 *Payment Details:*\n` +
        `• Total Due: ${dueAmount}\n` +
        `• Order Number: ${client.orderNumber || 'N/A'}\n` +
        `• Order Date: ${formatDate(client.orderDate)}\n\n` +
        `Please let us know when you'll be making the payment. ` +
        `You can reply to this message or contact us for any queries.\n\n` +
        `Thank you for your business! 🙏\n` +
        `Date: ${date}`
      );
    } else {
      // Thank you message for paid clients
      return encodeURIComponent(
        `Hello ${contactPerson},\n\n` +
        `Thank you for your recent payment! 🙏\n\n` +
        `Your account with ${businessName} is now fully paid.\n` +
        `Order Number: ${client.orderNumber || 'N/A'}\n\n` +
        `We appreciate your business and look forward to serving you again!\n\n` +
        `Date: ${date}`
      );
    }
  };

  // NEW: Handle WhatsApp click
  const handleWhatsAppClick = (client) => {
    if (!client.phoneMobile) {
      alert('Phone number not available for this client');
      return;
    }

    // Remove any non-numeric characters from phone number
    const phoneNumber = client.phoneMobile.replace(/\D/g, '');
    
    // Check if it's a 10-digit Indian number (add +91)
    const whatsappNumber = phoneNumber.length === 10 ? `91${phoneNumber}` : phoneNumber;
    
    const message = getWhatsAppMessage(client);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
  };

  const handlePaymentClick = (client) => {
    setSelectedClient(client);
    setShowPaymentModal(true);
  };

  const handleStatusClick = (client) => {
    if (client.totalDue <= 0) {
      setSelectedClient(client);
      setShowStatusModal(true);
    }
  };

  const handlePaymentSubmit = async (paymentData) => {
    if (onPaymentAdd) {
      await onPaymentAdd(selectedClient._id, paymentData);
    }
    setShowPaymentModal(false);
    setSelectedClient(null);
  };

  const handleStatusUpdate = async (status) => {
    if (onStatusUpdate && selectedClient) {
      await onStatusUpdate(selectedClient._id, status);
    }
    setShowStatusModal(false);
    setSelectedClient(null);
  };

  if (!clients || clients.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow">
        <p className="text-gray-500">No clients found</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {client.businessName}
                  </div>
                  {client.subscriptionService && (
                    <div className="text-xs text-gray-500">
                      {client.subscriptionService}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{client.contactPerson || '-'}</div>
                  <div className="text-xs text-gray-500">{client.email || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.phoneMobile}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {formatCurrency(client.totalAmount || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={client.totalDue > 0 ? 'text-red-600' : 'text-green-600'}>
                    {formatCurrency(client.totalDue)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleStatusClick(client)}
                    className={`px-3 py-1 text-xs rounded-full border flex items-center gap-1 ${getStatusColor(client.paymentStatus)} ${
                      client.totalDue <= 0 ? 'cursor-pointer hover:opacity-75' : 'cursor-default'
                    }`}
                    title={client.totalDue <= 0 ? 'Click to mark as paid' : 'Status updates automatically when payment is added'}
                  >
                    <span>{getStatusIcon(client.paymentStatus)}</span>
                    <span>{client.paymentStatus}</span>
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/client/${client._id}`}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      👁️
                    </Link>
                    <Link
                      to={`/edit/${client._id}`}
                      className="text-green-600 hover:text-green-900"
                      title="Edit Client"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => handlePaymentClick(client)}
                      className="text-purple-600 hover:text-purple-900"
                      title="Add Payment"
                    >
                      💰
                    </button>
                    {/* NEW: WhatsApp Button */}
                    <button
                      onClick={() => handleWhatsAppClick(client)}
                      className="text-green-600 hover:text-green-700"
                      title="Send WhatsApp Message"
                      disabled={!client.phoneMobile}
                      style={{ opacity: client.phoneMobile ? 1 : 0.5 }}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="currentColor"
                        className="inline-block"
                      >
                        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.91 2.75 15.8 3.87 17.35L2.08 21.8L6.63 20.08C8.17 21.15 10.04 21.75 12.04 21.75C17.5 21.75 21.95 17.3 21.95 11.84C21.95 6.38 17.5 2 12.04 2ZM12.04 20.15C10.33 20.15 8.69 19.64 7.31 18.71L6.95 18.48L4.31 19.31L5.16 16.7L4.91 16.32C3.93 14.9 3.38 13.23 3.38 11.51C3.38 6.89 7.14 3.14 11.76 3.14C16.38 3.14 20.14 6.89 20.14 11.51C20.14 16.13 16.66 20.15 12.04 20.15ZM16.24 13.87C15.96 13.73 14.87 13.19 14.62 13.09C14.37 12.99 14.18 12.94 13.99 13.22C13.8 13.5 13.28 14.01 13.12 14.19C12.96 14.37 12.8 14.39 12.52 14.25C12.24 14.11 11.54 13.86 10.71 13.09C10.07 12.5 9.63 11.75 9.47 11.47C9.31 11.19 9.45 11.04 9.59 10.9C9.72 10.77 9.88 10.56 10.02 10.4C10.16 10.24 10.21 10.11 10.29 9.93C10.37 9.75 10.33 9.59 10.27 9.45C10.21 9.31 9.77 8.21 9.59 7.77C9.41 7.33 9.23 7.38 9.09 7.38C8.96 7.38 8.81 7.38 8.66 7.38C8.51 7.38 8.27 7.43 8.06 7.66C7.85 7.89 7.31 8.45 7.31 9.58C7.31 10.71 8.11 11.81 8.22 11.96C8.33 12.11 9.62 14.26 11.61 15.14C12.67 15.62 13.5 15.88 14.12 16.06C15.2 16.38 16.18 16.31 16.96 16.14C17.84 15.95 18.68 15.44 18.9 14.86C19.12 14.28 19.12 13.78 19.04 13.64C18.96 13.5 18.73 13.41 18.45 13.27C18.17 13.13 16.52 12.27 16.24 13.87Z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(client._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Client"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {selectedClient && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedClient(null);
          }}
          onSubmit={handlePaymentSubmit}
          clientName={selectedClient.businessName}
          dueAmount={selectedClient.totalDue}
        />
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Update Payment Status</h3>
            <p className="mb-4">
              Client: <span className="font-semibold">{selectedClient.businessName}</span>
            </p>
            <p className="mb-4 text-green-600">
              Due amount is zero. Do you want to mark as PAID?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate('Paid')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Mark as Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}