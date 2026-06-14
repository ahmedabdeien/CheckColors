const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  getMyPalettes, getPublicPalettes, savePalette,
  updatePalette, deletePalette, likePalette,
} = require('../controllers/paletteController');

router.get('/public', getPublicPalettes);
router.get('/my', protect, getMyPalettes);
router.post('/', protect, savePalette);
router.put('/:id', protect, updatePalette);
router.delete('/:id', protect, deletePalette);
router.post('/:id/like', protect, likePalette);

module.exports = router;
