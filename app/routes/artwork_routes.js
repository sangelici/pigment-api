const express = require('express')
const passport = require('passport')
const Artwork = require('../models/artwork')
const multer = require('multer')
const storage = multer.memoryStorage()
const multerArtwork = multer({ storage: storage })
const artworkApi = require('../../lib/artwork-api')

const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

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
router.post('/artworks', multerArtwork.single('file'), requireToken, (req, res, next) => {
  // const artworkFile = req.body.artwork.file
  console.log(req)
  console.table(req.body.artist)
  // console.log('req.body.file is', req.body.artwork.file)
  // console.log('req.body is', req.body)
  req.body.owner = req.user.id

  artworkApi(req.file)
    .then(awsResponse => {
      return Artwork.create(
        req.body.artwork,
        {
          fileName: awsResponse.key,
          fileType: req.file.mimetype,
          title: req.body.title,
          artist: req.body.artist,
          description: req.body.description,
          medium: req.body.medium,
          size: req.body.size,
          price: req.body.price,
          owner: req.user.id
        })
    })
    .then(artwork => {
      res.status(201).json({
        artwork: artwork.toObject()
      })
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

module.exports = router
