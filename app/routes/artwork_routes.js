const express = require('express')
const passport = require('passport')
const Artwork = require('../models/artwork')
const Image = require('../models/image')
const multer = require('mutlter')

const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

// IMAGE
const storage = multer.diskStorage({
  // storage will require a request, file, and a callback
  destination: function (req, file, cb) {
    cb(null, Date.now() + file.originalName)
  }
})

const fileFilter = (req, file, cb) => {
  // the uploaded image can either be a jpg or a png file
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

router.route('/uploadmulter')
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

// ARTWORK
// public index
router.get('/artworks', (req, res, next) => {
  Artwork.find()
    .then(artworks => {
      return artworks.map(artwork => artwork.toObject())
    })
    .then(artworks => res.status(200).json({ artworks: artworks }))
    .catch(next)
})

// user specific index
router.get('/user_artworks', requireToken, (req, res, next) => {
  let search = { owner: req.user.id }
  Artwork.find(search)
    .then(artworks => {
      return artworks.map(artwork => artwork.toObject())
    })
    .then(artworks => res.status(200).json({ artworks: artworks }))
    .catch(next)
})

// show one user artwork
router.get('/artworks/:id', requireToken, (req, res, next) => {
  Artwork.findById(req.params.id)
    .populate('owner')
    .then(handle404)
    .then(artwork => res.status(200).json({ artwork: artwork.toObject() }))
    .catch(next)
})

// create an artwork
router.post('/artworks', requireToken, (req, res, next) => {
  req.body.artwork.owner = req.user.id

  Artwork.create(req.body.artwork)
    .then(artwork => {
      res.status(201).json({ artwork: artwork.toObject() })
    })
    .catch(next)
})

// update an artwork
router.patch('/artworks/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.artwork.owner
  Artwork.findById(req.params.id)
    .populate('artwork')
    .then(handle404)
    .then(artwork => {
      requireOwnership(req, artwork)
      return artwork.updateOne(req.body.artwork)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// delete an artwork
router.delete('/artworks/:id', requireToken, (req, res, next) => {
  Artwork.findById(req.params.id)
    .populate('artwork')
    .then(handle404)
    .then(artwork => {
      requireOwnership(req, artwork)
      artwork.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = ImageRouter
