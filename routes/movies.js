var movieModel = require('../models/movieModel');
var userModel = require('../models/userModel');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

router.get('/', function (req, res) {
    const conditions = req.query.where ? JSON.parse(req.query.where) : {};
    const projections = req.query.select ? JSON.parse(req.query.select) : (req.query.filter ? JSON.parse(req.query.filter) : {});
    const options = {}
    options.skip = req.query.skip ? JSON.parse(req.query.skip) : 0;
    options.limit = req.query.limit ? JSON.parse(req.query.limit) : 0;
    options.sort = req.query.sort ? JSON.parse(req.query.sort) : {};

    movieModel.find(conditions, projections, options, function (err, results) {
        if (err) {
            res.status(500).send({
                message: 'Internal Server error',
                data: {}
            })
        } else {
            if (req.query.count && req.query.count === true) {
                res.status(200).send({
                    message: 'OK',
                    data: results.length
                })
            } else {
                res.status(200).send({
                    message: 'OK',
                    data: results
                })
            }
        }
    })
})

router.post('/', function (req, res) {
    if (req.body.name && req.body.pictureURL && req.body.genres) {
        movieModel.find({name: req.body.name}, function (err, result) {
            if (result.length) {
                res.status(404).send({
                    message: 'Movie already exists in db',
                    data: result
                })
            } else {
                movieModel.create({
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.name,
                    pictureURL: req.body.pictureURL || "",
                    genres: req.body.genres || [],
                    description: req.body.description || "No description"
                }, function (err, newMovie) {
                    if (err) {
                        res.status(404).send({
                            message: 'Error creating Movie',
                            data: err
                        })
                    } else {
                        res.status(201).send({
                            message: 'Successfully created Movie',
                            data: newMovie
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

router.get('/:id', function (req, res) {
    movieModel.findOne({_id: req.params.id}, function (err, result) {
        if (err) {
            res.status(404).send({
                message: 'Movie Not Found',
                data: {}
            })
        } else {
            res.status(200).send({
                message: 'OK',
                data: result
            })
        }
    })
})

router.get('/:name', function (req, res) {
    movieModel.findOne({name: req.params.name}, function (err, result) {
        if (err) {
            res.status(404).send({
                message: 'Movie Not Found',
                data: {}
            })
        } else {
            res.status(200).send({
                message: 'OK',
                data: result
            })
        }
    })
})

router.delete('/:id', function (req, res) {
    movieModel.findByIdAndDelete(req.params.id, function (err) {
        if (err) {
            res.status(404).send({
                message: 'Unsuccessfully deleted Movie',
                data: {}
            })
        } else {
            userModel.updateMany({movieList: {$elemMatch: {$eq: req.params.id}}}, {$pullAll: {movieList: [req.params.id]}}, function (err, result) {
                if (err) {
                    res.status(404).send({
                        message: 'Unsuccessfully deleted Movie',
                        data: {}
                    })
                } else {
                    res.status(200).send({
                        message: 'Successfully deleted Movie',
                        data: result
                    })
                }
            })
        }
    })
})

module.exports = router;