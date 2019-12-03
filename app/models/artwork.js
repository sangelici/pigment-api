const mongoose = require('mongoose')

const artworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  medium: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  imageName: {
    type: String,
    default: 'none',
    required: true
  },
  imageData: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJson: { virtuals: true }
})

module.exports = mongoose.model('Artwork', artworkSchema)
