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
    totalAmount: 0,  // NEW FIELD
    totalDue: 0,
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
        totalAmount: initialData.totalAmount || 0,
        totalDue: initialData.totalDue || 0,
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
    if (formData.totalAmount < 0) {
      newErrors.totalAmount = 'Total amount cannot be negative';
    }
    if (formData.totalDue < 0) {
      newErrors.totalDue = 'Due amount cannot be negative';
    }
    if (formData.totalDue > formData.totalAmount) {
      newErrors.totalDue = 'Due amount cannot be greater than total amount';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numValue = name.includes('total') ? parseFloat(value) || 0 : value;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: numValue
      };
      
      // Auto-calculate due amount if it's a new client and totalAmount is set
      if (name === 'totalAmount' && !prev._id && prev.totalDue === 0) {
        newData.totalDue = numValue;
      }
      
      return newData;
    });
    
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
    onSubmit(formData);
  };

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
            className={`w-full border p-2 rounded ${errors.businessName ? 'border-red-500' : ''}`}
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
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone/Mobile *</label>
          <input
            type="tel"
            name="phoneMobile"
            value={formData.phoneMobile}
            onChange={handleChange}
            className={`w-full border p-2 rounded ${errors.phoneMobile ? 'border-red-500' : ''}`}
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
            className={`w-full border p-2 rounded ${errors.email ? 'border-red-500' : ''}`}
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
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Website</label>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Order Number</label>
          <input
            type="text"
            name="orderNumber"
            value={formData.orderNumber}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Order Date</label>
          <input
            type="date"
            name="orderDate"
            value={formData.orderDate}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sales Manager</label>
          <input
            type="text"
            name="salesManagerName"
            value={formData.salesManagerName}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Subscription Service</label>
          <input
            type="text"
            name="subscriptionService"
            value={formData.subscriptionService}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* NEW FIELD: Total Amount */}
        <div>
          <label className="block text-sm font-medium mb-1">Total Amount *</label>
          <input
            type="number"
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`w-full border p-2 rounded ${errors.totalAmount ? 'border-red-500' : ''}`}
            placeholder="0.00"
          />
          {errors.totalAmount && <p className="text-red-500 text-sm mt-1">{errors.totalAmount}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Due Amount</label>
          <input
            type="number"
            name="totalDue"
            value={formData.totalDue}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`w-full border p-2 rounded ${errors.totalDue ? 'border-red-500' : ''}`}
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
            className="w-full border p-2 rounded"
          />
        </div>
      </div>

      {/* Payment Status Preview */}
      {formData.totalAmount > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="text-sm">
            <span className="font-medium">Payment Status: </span>
            {formData.totalDue <= 0 ? (
              <span className="text-green-600">Paid</span>
            ) : formData.totalDue < formData.totalAmount ? (
              <span className="text-blue-600">Partial</span>
            ) : (
              <span className="text-yellow-600">Pending</span>
            )}
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