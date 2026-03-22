const Client = require('../models/Client');
const Payment = require('../models/Payment');

// @desc    Get all clients
// @route   GET /api/clients
const getClients = async (req, res) => {
  try {
    const clients = await Client.find({ status: 'Active' }).sort('-createdAt');
    res.json(clients);
    console.log(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single client
// @route   GET /api/clients/:id
const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    // Get payment history
    const payments = await Payment.find({ clientId: client._id }).sort('-paymentDate');
    
    res.json({ client, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new client
// @route   POST /api/clients
const createClient = async (req, res) => {
  try {
    // If totalAmount is provided but totalDue is not, set totalDue = totalAmount
    if (req.body.totalAmount && !req.body.totalDue) {
      req.body.totalDue = req.body.totalAmount;
    }
    
    const client = new Client(req.body);
    const savedClient = await client.save();
    res.status(201).json(savedClient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
const updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete client (soft delete)
// @route   DELETE /api/clients/:id
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { status: 'Inactive' },
      { new: true }
    );
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search clients
// @route   GET /api/clients/search
const searchClients = async (req, res) => {
  try {
    const { q } = req.query;
    const clients = await Client.find({
      $text: { $search: q },
      status: 'Active'
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get clients with most due
// @route   GET /api/clients/due
const getDueClients = async (req, res) => {
  try {
    const clients = await Client.find({ 
      totalDue: { $gt: 0 },
      status: 'Active'
    }).sort('-totalDue').limit(10);
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add payment to client
// @route   POST /api/clients/:id/payments
const addPayment = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Create payment record
    const payment = new Payment({
      clientId: client._id,
      ...req.body
    });
    await payment.save();

    // Update client's payment info
    client.totalPaid += req.body.amount;
    client.totalDue = Math.max(0, client.totalDue - req.body.amount);
    client.lastPaymentDate = req.body.paymentDate || Date.now();
    client.lastPaymentAmount = req.body.amount;
    
    // Status will auto-update via pre-save middleware
    await client.save();

    res.status(201).json({ client, payment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Manually update payment status
// @route   PUT /api/clients/:id/status
const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Only allow manual status update if due amount is zero
    if (status === 'Paid' && client.totalDue > 0) {
      return res.status(400).json({ 
        message: 'Cannot mark as paid when due amount is greater than zero' 
      });
    }

    client.paymentStatus = status;
    await client.save();
    
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  searchClients,
  getDueClients,
  addPayment,
  updatePaymentStatus
};