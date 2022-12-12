var users = require('../models/userModel');
var movies = require('../models/movieModel');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

router.post('/', function (req, res) {
    if (req.body.email && req.body.password) {
        users.find({email: req.body.email}, function (err, result) {
            if (result.length) {
                res.status(404).send({
                    message: 'Email already used',
                    data: {}
                })
            } else {
                users.create({
                    _id: new mongoose.Types.ObjectId(),
                    email: req.body.email,
                    password: req.body.password,
                    movieList: req.body.movieList || []
                }, function(err, newUser) {
                    if (err) {
                        res.status(500).send({
                            message: 'Internal Server Error: Could not create or bad field',
                            data: {}
                        })
                    } else {
                        res.status(201).send({
                            message: 'Successfully created User',
                            data: newUser
                        })
                    }
                })
            }
        })
    } else {
        res.status(404).send({
            message: 'Incorrect Request Syntax',
            data: {}
        })
    }
})

router.put('/:email', function (req, res) {
    if (req.params.email && req.body.movieList) {
        users.findOneAndUpdate({email: req.params.email}, {password: 0}, {movieList: req.body.movieList}, {new: true}, function (err, result) {
            if (err) {
                res.status(404).send({
                    message: 'User not found',
                    data: {}
                })
            } else {
                res.status(200).send({
                    message: 'Successfully updated User',
                    data: result
                })
            }
        })
    } else {
        res.status(404).send({
            message: 'Incorrect Request Syntax',
            data: {}
        })
    }
})

router.get('/:email', function (req, res) {
    if (req.params.email && req.body.password) {
        users.findOne({email: req.params.email, password: req.body.password}, {password: 0}, function (err, user) {
            if (err) {
                res.status(404).send({
                    message: 'User Not Found',
                    data: {}
                })
            } else {
                if (user) {
                    res.status(200).send({
                        message: 'OK',
                        data: user
                    })
                } else {
                    res.status(401).send({
                        message: 'Invalid Email & Password Combination',
                        data: {}
                    })
                }
            }
        })
    }
})

module.exports = router;