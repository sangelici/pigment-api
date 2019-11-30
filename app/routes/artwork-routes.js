const express = require('express')
const passport = require('passport')
const Artwork = require('../models/artwork.js')

const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()

// public index -- ?????
router.get('/artworks', (req, res, next) => {
  Artwork.find()
    .then(artworks => {
      return artworks.map(listing => listing.toObject())
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

// show one user listing
router.get('/artworks/:id', requireToken, (req, res, next) => {
  Artwork.findById(req.params.id)
    .then(handle404)
    .then(artwork => res.status(200).json({ artwork: artwork.toObject() }))
    .catch(next)
})

// create an artwork listing
router.post('/artworks', requireToken, (req, res, next) => {
  req.body.listing.owner = req.user.id
  Artwork.create(req.body.listing)
    .then(artwork => res.status(201).json({ artwork: artwork.toObject() }))
    .catch(next)
})

// update an artwork listing
router.patch('/artworks/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.artwork.owner
  Artwork.findById(req.params.id)
    .populate('artwork')
    .then(handle404)
    .then(artwork => {
      requireOwnership(req, artwork)
      return artwork.updateOne(req.body.listing)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// delete an artwork listing
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
