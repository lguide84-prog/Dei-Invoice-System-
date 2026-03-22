import axios from 'axios';

const API = axios.create({
  baseURL: 'https://dei-invoice-system.onrender.com/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Starting Request:', {
      method: config.method,
      url: config.url,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log('Response:', response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Server Error:', {
        status: error.response.status,
        data: error.response.data,
      });
      
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default {
  // Get all clients - FIXED: Added return statement
  getClients: async () => {
    try {
      const response = await API.get('/clients');
      console.log('Clients data received:', response.data);
      return response.data; // 🔥 IMPORTANT: Return the data
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  // Get single client
  getClient: async (id) => {
    try {
      const response = await API.get(`/clients/${id}`);
      console.log('Client details:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  },

  // Create new client
  createClient: async (clientData) => {
    try {
      // Generate unique order number if not provided
      if (!clientData.orderNumber || clientData.orderNumber === '') {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        clientData.orderNumber = `ORD-${timestamp}-${random}`;
      }
      
      console.log('Sending client data:', clientData);
      
      const response = await API.post('/clients', clientData);
      console.log('Client created successfully:', response.data);
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Server validation error:', error.response.data);
        throw new Error(error.response.data.message || 'Failed to create client');
      }
      console.error('Error creating client:', error);
      throw error;
    }
  },

  // Update client
  updateClient: async (id, clientData) => {
    try {
      const response = await API.put(`/clients/${id}`, clientData);
      console.log('Client updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },

  // Delete client
  deleteClient: async (id) => {
    try {
      const response = await API.delete(`/clients/${id}`);
      console.log('Client deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  },

  // Search clients
  searchClients: async (searchTerm) => {
    try {
      const response = await API.get(`/clients/search?q=${searchTerm}`);
      return response.data;
    } catch (error) {
      console.error('Error searching clients:', error);
      throw error;
    }
  },

  // Get due clients
  getDueClients: async () => {
    try {
      const response = await API.get('/clients/due');
      return response.data;
    } catch (error) {
      console.error('Error fetching due clients:', error);
      throw error;
    }
  },

  // Add payment
  addPayment: async (clientId, paymentData) => {
    try {
      const response = await API.post(`/clients/${clientId}/payments`, paymentData);
      console.log('Payment added:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  },

  // Update payment status
  updatePaymentStatus: async (clientId, status) => {
    try {
      const response = await API.put(`/clients/${clientId}/status`, { status });
      console.log('Status updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  }
};