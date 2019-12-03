const mongoose = require('mongoose')

const artworkSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  artist: {
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

// Virtual property that generates the file URL location
artworkSchema.virtual('fileUrl').get(function () {
  // Generating
  const url = 'https://' + process.env.BUCKET_NAME + '.s3.amazonaws.com/' + this.fileName
  // Return the value
  return url
})

module.exports = mongoose.model('Artwork', artworkSchema)
