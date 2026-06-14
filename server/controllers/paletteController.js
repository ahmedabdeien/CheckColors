const Palette = require('../models/Palette');
const User = require('../models/User');

// @GET /api/palettes/my
const getMyPalettes = async (req, res) => {
  try {
    const palettes = await Palette.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ palettes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/palettes/public
const getPublicPalettes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const palettes = await Palette.find({ isPublic: true })
      .populate('user', 'name avatar')
      .sort({ likes: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Palette.countDocuments({ isPublic: true });
    res.json({ palettes, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/palettes
const savePalette = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.canSavePalette())
      return res.status(403).json({
        message: 'وصلت للحد الأقصى من الباليتات في الخطة المجانية (10 باليتات)',
        upgrade: true,
      });

    const { name, colors, tags, isPublic, source } = req.body;
    if (!colors?.length) return res.status(400).json({ message: 'الألوان مطلوبة' });

    const palette = await Palette.create({
      user: req.user._id,
      name: name || 'Untitled Palette',
      colors,
      tags: tags || [],
      isPublic: isPublic || false,
      source: source || 'manual',
    });

    user.savedPalettes += 1;
    await user.save();

    res.status(201).json({ message: 'تم حفظ الباليت', palette });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/palettes/:id
const updatePalette = async (req, res) => {
  try {
    const palette = await Palette.findOne({ _id: req.params.id, user: req.user._id });
    if (!palette) return res.status(404).json({ message: 'الباليت غير موجود' });

    Object.assign(palette, req.body);
    await palette.save();
    res.json({ message: 'تم التحديث', palette });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/palettes/:id
const deletePalette = async (req, res) => {
  try {
    const palette = await Palette.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!palette) return res.status(404).json({ message: 'الباليت غير موجود' });

    await User.findByIdAndUpdate(req.user._id, { $inc: { savedPalettes: -1 } });
    res.json({ message: 'تم الحذف' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/palettes/:id/like
const likePalette = async (req, res) => {
  try {
    const palette = await Palette.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!palette) return res.status(404).json({ message: 'الباليت غير موجود' });
    res.json({ likes: palette.likes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMyPalettes, getPublicPalettes, savePalette, updatePalette, deletePalette, likePalette };
