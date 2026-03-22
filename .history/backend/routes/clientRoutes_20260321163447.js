const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // 🔥 Import auth middleware
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

// 🔥 All routes are now protected
router.get('/search', protect, searchClients);
router.get('/due', protect, getDueClients);

router.route('/')
  .get(protect, getClients)
  .post(protect, createClient);

router.route('/:id')
  .get(protect, getClientById)
  .put(protect, updateClient)
  .delete(protect, deleteClient);

router.post('/:id/payments', protect, addPayment);
router.put('/:id/status', protect, updatePaymentStatus);

module.exports = router;