const router = require('express').Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// GET my saved colors
router.get('/saved', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('savedColors');
    res.json({ colors: user.savedColors || [] });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST save a color
router.post('/saved', protect, async (req, res) => {
  try {
    const { hex, name, note, tags } = req.body;
    if (!hex) return res.status(400).json({ message: 'hex is required' });
    const user = await User.findById(req.user.id);
    user.savedColors.push({ hex, name: name || '', note: note || '', tags: tags || [] });
    await user.save();
    const saved = user.savedColors[user.savedColors.length - 1];
    res.status(201).json({ color: saved });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a saved color
router.delete('/saved/:colorId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.savedColors = user.savedColors.filter(c => c._id.toString() !== req.params.colorId);
    await user.save();
    res.json({ message: 'Color removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH update a saved color (name/note/tags)
router.patch('/saved/:colorId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const color = user.savedColors.id(req.params.colorId);
    if (!color) return res.status(404).json({ message: 'Not found' });
    const { name, note, tags } = req.body;
    if (name !== undefined) color.name = name;
    if (note !== undefined) color.note = note;
    if (tags !== undefined) color.tags = tags;
    await user.save();
    res.json({ color });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
