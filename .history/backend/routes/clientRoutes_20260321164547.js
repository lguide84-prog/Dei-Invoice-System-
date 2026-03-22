const express = require('express');
const router = express.Router();
// const { protect } = require('../middleware/auth'); // Temporarily comment out
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

// 🔥 TEMPORARILY REMOVE protect FOR TESTING
router.get('/search', searchClients); // Remove protect
router.get('/due', getDueClients); // Remove protect

router.route('/')
  .get(getClients) // Remove protect
  .post(createClient); // Remove protect

router.route('/:id')
  .get(getClientById) // Remove protect
  .put(updateClient) // Remove protect
  .delete(deleteClient); // Remove protect

router.post('/:id/payments', addPayment); // Remove protect
router.put('/:id/status', updatePaymentStatus); // Remove protect

module.exports = router;