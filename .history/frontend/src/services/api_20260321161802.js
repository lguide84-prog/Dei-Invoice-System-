import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000//api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for debugging
API.interceptors.request.use(request => {
  console.log('Starting Request:', {
    method: request.method,
    url: request.url,
    data: request.data
  });
  return request;
});

// Add response interceptor for better error handling
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Server Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default {
  // Get all clients
  getClients: async () => {
    try {
      const response = await API.get('/clients');
      return response.data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  // Get single client
  getClient: async (id) => {
    try {
      const response = await API.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  },

  // Create new client - with better error handling
  createClient: async (clientData) => {
    try {
      console.log('Sending client data:', clientData);
      
      // Validate required fields before sending
      if (!clientData.businessName) {
        throw new Error('Business name is required');
      }
      if (!clientData.phoneMobile) {
        throw new Error('Phone number is required');
      }
      
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
      return response.data;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  }
};