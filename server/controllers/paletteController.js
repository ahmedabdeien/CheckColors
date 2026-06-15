const Palette = require('../models/Palette');
const User = require('../models/User');

// @GET /api/palettes/my
const getMyPalettes = async (req, res) => {
  try {
    const uid = req.user._id;
    const palettes = await Palette.find({ user: uid }).sort({ createdAt: -1 });
    const result = palettes.map(p => ({
      ...p.toObject(),
      likedByMe: p.likedBy.some(id => id.equals(uid)),
    }));
    res.json({ palettes: result });
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

// @POST /api/palettes/:id/like  — toggle like
const likePalette = async (req, res) => {
  try {
    const palette = await Palette.findById(req.params.id);
    if (!palette) return res.status(404).json({ message: 'الباليت غير موجود' });
    const uid = req.user._id;
    const alreadyLiked = palette.likedBy.some(id => id.equals(uid));
    if (alreadyLiked) {
      palette.likedBy.pull(uid);
      palette.likes = Math.max(0, palette.likes - 1);
    } else {
      palette.likedBy.push(uid);
      palette.likes += 1;
    }
    await palette.save();
    res.json({ likes: palette.likes, likedByMe: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMyPalettes, getPublicPalettes, savePalette, updatePalette, deletePalette, likePalette };
