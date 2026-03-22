import React, { useState, useEffect } from 'react';

export default function ClientForm({ onSubmit, initialData = {}, onCancel }) {
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    phoneMobile: '',
    email: '',
    address: '',
    website: '',
    orderNumber: '',
    orderDate: '',
    salesManagerName: '',
    subscriptionService: '',
    totalAmount: '',  // Keep as string for input
    totalPaid: 0,
    totalDue: '',  // Keep as string for input
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        businessName: initialData.businessName || '',
        contactPerson: initialData.contactPerson || '',
        phoneMobile: initialData.phoneMobile || '',
        email: initialData.email || '',
        address: initialData.address || '',
        website: initialData.website || '',
        orderNumber: initialData.orderNumber || '',
        orderDate: initialData.orderDate ? initialData.orderDate.split('T')[0] : '',
        salesManagerName: initialData.salesManagerName || '',
        subscriptionService: initialData.subscriptionService || '',
        totalAmount: initialData.totalAmount || '',
        totalPaid: initialData.totalPaid || 0,
        totalDue: initialData.totalDue || '',
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    if (!formData.phoneMobile.trim()) {
      newErrors.phoneMobile = 'Phone number is required';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    const totalAmount = parseFloat(formData.totalAmount);
    const totalDue = parseFloat(formData.totalDue);
    
    if (formData.totalAmount && isNaN(totalAmount)) {
      newErrors.totalAmount = 'Please enter a valid number';
    }
    if (formData.totalDue && isNaN(totalDue)) {
      newErrors.totalDue = 'Please enter a valid number';
    }
    if (totalAmount < 0) {
      newErrors.totalAmount = 'Total amount cannot be negative';
    }
    if (totalDue < 0) {
      newErrors.totalDue = 'Due amount cannot be negative';
    }
    if (totalDue > totalAmount && totalAmount > 0) {
      newErrors.totalDue = 'Due amount cannot be greater than total amount';
    }
    return newErrors;
  };

  // 🔥 Fixed handleChange - Better number handling
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-calculate due amount when totalAmount changes
      if (name === 'totalAmount') {
        const totalAmountNum = parseFloat(value) || 0;
        const totalPaidNum = parseFloat(prev.totalPaid) || 0;
        const calculatedDue = totalAmountNum - totalPaidNum;
        
        // Only auto-calculate if due is not manually set or if totalPaid exists
        if (!prev.totalDue || prev.totalDue === '' || prev.totalDue === '0') {
          newData.totalDue = calculatedDue > 0 ? calculatedDue.toString() : '0';
        }
      }
      
      // Auto-calculate due when totalPaid changes (for edit mode)
      if (name === 'totalPaid') {
        const totalAmountNum = parseFloat(prev.totalAmount) || 0;
        const totalPaidNum = parseFloat(value) || 0;
        const calculatedDue = totalAmountNum - totalPaidNum;
        newData.totalDue = calculatedDue > 0 ? calculatedDue.toString() : '0';
      }
      
      return newData;
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // 🔥 Convert string values to numbers for submission
    const submitData = {
      ...formData,
      totalAmount: parseFloat(formData.totalAmount) || 0,
      totalDue: parseFloat(formData.totalDue) || 0,
      totalPaid: parseFloat(formData.totalPaid) || 0
    };
    
    // Calculate payment status based on amounts
    if (submitData.totalAmount > 0) {
      if (submitData.totalDue <= 0) {
        submitData.paymentStatus = 'Paid';
      } else if (submitData.totalDue < submitData.totalAmount) {
        submitData.paymentStatus = 'Partial';
      } else {
        submitData.paymentStatus = 'Pending';
      }
    }
    
    console.log('Submitting client data:', submitData);
    onSubmit(submitData);
  };

  // Calculate payment status for display
  const getPaymentStatus = () => {
    const totalAmount = parseFloat(formData.totalAmount) || 0;
    const totalDue = parseFloat(formData.totalDue) || 0;
    
    if (totalAmount === 0) return null;
    
    if (totalDue <= 0) {
      return { text: 'Paid', color: 'text-green-600 bg-green-50' };
    } else if (totalDue < totalAmount) {
      return { text: 'Partial', color: 'text-blue-600 bg-blue-50' };
    } else {
      return { text: 'Pending', color: 'text-yellow-600 bg-yellow-50' };
    }
  };

  const paymentStatus = getPaymentStatus();

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{initialData._id ? 'Edit Client' : 'Add New Client'}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Business Name *</label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            className={`w-full border p-2 rounded ${errors.businessName ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contact Person</label>
          <input
            type="text"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone/Mobile *</label>
          <input
            type="tel"
            name="phoneMobile"
            value={formData.phoneMobile}
            onChange={handleChange}
            className={`w-full border p-2 rounded ${errors.phoneMobile ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.phoneMobile && <p className="text-red-500 text-sm mt-1">{errors.phoneMobile}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full border p-2 rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Website</label>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Order Number</label>
          <input
            type="text"
            name="orderNumber"
            value={formData.orderNumber}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Order Date</label>
          <input
            type="date"
            name="orderDate"
            value={formData.orderDate}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sales Manager</label>
          <input
            type="text"
            name="salesManagerName"
            value={formData.salesManagerName}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Subscription Service</label>
          <input
            type="text"
            name="subscriptionService"
            value={formData.subscriptionService}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        {/* Total Amount Field */}
        <div>
          <label className="block text-sm font-medium mb-1">Total Amount *</label>
          <input
            type="number"
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleChange}
            min="0"
            step="1"
            className={`w-full border p-2 rounded ${errors.totalAmount ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter total amount"
          />
          {errors.totalAmount && <p className="text-red-500 text-sm mt-1">{errors.totalAmount}</p>}
        </div>

        {/* Total Paid Field (hidden for new clients, show for edit) */}
        {initialData._id && (
          <div>
            <label className="block text-sm font-medium mb-1">Total Paid</label>
            <input
              type="number"
              name="totalPaid"
              value={formData.totalPaid}
              onChange={handleChange}
              min="0"
              step="1"
              className="w-full border border-gray-300 p-2 rounded bg-gray-50"
              readOnly
            />
          </div>
        )}

        {/* Due Amount Field */}
        <div>
          <label className="block text-sm font-medium mb-1">Due Amount</label>
          <input
            type="number"
            name="totalDue"
            value={formData.totalDue}
            onChange={handleChange}
            min="0"
            step="1"
            className={`w-full border p-2 rounded ${errors.totalDue ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Due amount"
          />
          {errors.totalDue && <p className="text-red-500 text-sm mt-1">{errors.totalDue}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>
      </div>

      {/* Payment Status Preview */}
      {paymentStatus && (
        <div className="mt-4 p-3 rounded bg-gray-50">
          <p className="text-sm">
            <span className="font-medium">Payment Status: </span>
            <span className={`px-2 py-1 rounded ${paymentStatus.color}`}>
              {paymentStatus.text}
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {paymentStatus.text === 'Paid' && '✓ Full payment received'}
            {paymentStatus.text === 'Partial' && '⚠️ Partial payment received'}
            {paymentStatus.text === 'Pending' && '⏳ No payment received yet'}
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {initialData._id ? 'Update Client' : 'Save Client'}
        </button>
      </div>
    </form>
  );
}