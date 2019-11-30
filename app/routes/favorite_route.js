const express = require('express')
const passport = require('passport')
const Favorite = require('../models/favorite.js')

const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.requireOwnership
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()

// index favorite **
router.get('/favorites', requireToken, (req, res, next) => {
  let search = { owner: req.user.id }
  Favorite.find(search)
    .populate('artworks')
    .then(favorites => {
      return favorites.map(favorite => favorite.toObject())
    })
    .then(favorites => res.status(200).json({ favorites: favorites }))
    .catch(next)
})

// show one favorite **??
router.get('/favorites/:id', requireToken, (req, res, next) => {
  Favorite.findById(req.params.id)
    .populate('artwork')
    .then(handle404)
    .then(favorite => res.status(200).json({ favorite: favorite.toObject() }))
    .catch(next)
})

// Create a favorite **
router.post('/favorites', requireToken, (req, res, next) => {
  req.body.favorite.owner = req.user.id
  Favorite.create(req.body.favorite)
    .then(favorite => res.status(201).json({ favorite: favorite.toObject() }))
    .catch(next)
})

// Update favorite
router.patch('/favorites/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.favorite.owner
  Favorite.findById(req.params.id)
    .then(handle404)
    .then(favorite => {
      requireOwnership(req, favorite)
      return favorite.updateOne(req.body.rsvp)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// Delete favorite **
router.delete('/favorites/:id', requireToken, (req, res, next) => {
  Favorite.findById(req.params.id)
    .populate('artwork')
    .then(handle404)
    .then(favorite => {
      requireOwnership(req, favorite)
      favorite.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
