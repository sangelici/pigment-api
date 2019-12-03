const express = require('express')
const Image = require('../models/image')
const ImageRouter = express.Router()
const multer = require('mutlter')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, Date.now() + file.originalName)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimeType === 'image.jpg' || file.mimeType === 'image.png') {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
})

/*
    stores image in uploads folder
    using multer and creates a reference to the
    file
*/

ImageRouter.route('/uploadmulter')
  .post(upload.single('imageData'), (req, res, next) => {
    console.log(req.body)
    const newImage = new Image({
      imageName: req.body.imageName,
      imageData: req.file.path
    })

    newImage.save()
      .then((result) => {
        console.log(result)
        res.status(200).json({ success: true, document: result })
      })
      .catch(next)
  })

module.exports = ImageRouter
