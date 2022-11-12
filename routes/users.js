var users = require('../models/userModel');
var tasks = require('../models/taskModel');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

router.get('/', function (req, res) {
    const conditions = req.query.where ? JSON.parse(req.query.where) : {};
    const projections = req.query.select ? JSON.parse(req.query.select) : (req.query.filter ? JSON.parse(req.query.filter) : {});
    const options = {};
    options.skip = req.query.skip ? JSON.parse(req.query.skip) : 0;
    options.limit = req.query.limit ? JSON.parse(req.query.limit) : 0;
    options.sort = req.query.sort ? JSON.parse(req.query.sort) : {};

    users.find(conditions, projections, options, function (err, results) {
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
    if (req.body.name && req.body.email) {
        users.find({email: req.body.email}, function (err, result) {
            if (result.length) {
                res.status(404).send({
                    message: 'Email already used',
                    data: {}
                })
            } else {
                users.create({
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.name,
                    email: req.body.email,
                    pendingTasks: req.body.pendingTasks || []
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

router.get('/:id', function (req, res) {
    users.findOne({_id: req.params.id}, function (err, user) {
        if (err) {
            res.status(404).send({
                message: 'User Not Found',
                data: {}
            })
        } else {
            res.status(200).send({
                message: 'OK',
                data: user
            })
        }
    })
})

router.delete('/:id', function (req, res) {
    users.findByIdAndDelete(req.params.id, function (err, result) {
        if (err) {
            res.status(404).send({
                message: 'Unsuccessfully deleted User',
                data: {}
            })
        } else {
            tasks.updateMany({_id: {$in: result.pendingTasks }}, {assignedUser: "No assigned User", assignedUserName: "No assigned Username"}, function(err, result) {
                if (err) {
                    res.status(404).send({
                        message: 'Unsuccessfully deleted User'
                    })
                } else {
                    res.status(200).send({
                        message: 'Successfully deleted User',
                        data: {}
                    })
                }
            })
        }
    })
})

router.put('/:id', function (req, res) {
    if (req.body.name && req.body.email) {
        users.findOneAndUpdate({_id: req.params.id}, req.body, {new: true}, function (err, result) {
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

module.exports = router;