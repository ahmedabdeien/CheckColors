const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getStats, getUsers, updateUserRole, updateUserPlan,
  toggleUserActive, deleteUser, getMarketingStats,
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/plan', updateUserPlan);
router.put('/users/:id/toggle-active', toggleUserActive);
router.delete('/users/:id', deleteUser);
router.get('/marketing', getMarketingStats);

module.exports = router;
