const mongoose = require('mongoose');

const paletteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, default: 'Untitled Palette' },
  colors: [{ type: String }], // hex codes
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  source: { type: String, enum: ['manual', 'ai', 'image', 'generate'], default: 'manual' },
}, { timestamps: true });

module.exports = mongoose.model('Palette', paletteSchema);
