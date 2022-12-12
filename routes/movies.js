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
    if (req.body.genre_ids && req.body.id && req.body.original_language && req.body.overview && req.body.poster_path && req.body.release_date && req.body.title && req.body.vote_average) {
        movieModel.find({name: req.body.id}, function (err, result) {
            if (result.length) {
                res.status(404).send({
                    message: 'Movie already exists in db',
                    data: result
                })
            } else {
                movieModel.create({
                    adult: req.body.adult || false,
                    backdrop_path: req.body.backdrop_path || "",
                    genre_ids: req.body.genre_ids || [],
                    id: req.body.id || -1,
                    original_language: req.body.original_language || "",
                    original_title: req.body.original_title || "",
                    overview: req.body.overview || "",
                    popularity: req.body.popularity || -1,
                    poster_path: req.body.poster_path || "",
                    release_date: req.body.release_date || "",
                    title: req.body.title || "",
                    video: req.body.video || true,
                    vote_average: req.body.vote_average || -1,
                    vote_count: req.body.vote_count || -1,
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

router.get('/:id', function (req, res) {
    movieModel.findOne({id: req.params.id}, function (err, result) {
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