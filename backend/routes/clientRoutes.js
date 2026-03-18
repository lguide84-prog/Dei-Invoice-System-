const express = require('express');
const router = express.Router();
const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  searchClients,
  getDueClients,
  addPayment,
  updatePaymentStatus
} = require('../controllers/clientController');

// Search route - must be before /:id route
router.get('/search', searchClients);
router.get('/due', getDueClients);

// Main routes
router.route('/')
  .get(getClients)
  .post(createClient);

router.route('/:id')
  .get(getClientById)
  .put(updateClient)
  .delete(deleteClient);

// Payment route
router.post('/:id/payments', addPayment);

// Status update route
router.put('/:id/status', updatePaymentStatus);

module.exports = router;