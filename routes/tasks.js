var taskModel = require('../models/taskModel');
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

    taskModel.find(conditions, projections, options, function (err, results) {
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
    if (req.body.name && req.body.deadline) {
        taskModel.create({
            name: req.body.name,
            deadline: req.body.deadline,
            description: req.body.description || "No description",
            completed: req.body.completed || false,
            assignedUser: req.body.assignedUser || "No assigned User",
            assignedUserName: req.body.assignedUserName || "No assigned Username"
        }, function (err, newTask) {
            if (err) {
                res.status(404).send({
                    message: 'Error creating Task',
                    data: {}
                })
            } else {
                if (newTask.assignedUser) {
                    userModel.findById(newTask.assignedUser, function (err, foundUser) {
                        if (err) {
                            res.status(404).send({
                                message: 'Error in finding User',
                                data: {}
                            })
                        }
                        if (foundUser) {
                            foundUser.tasks.push(newTask._id);
                            foundUser.save(function () {
                                res.status(201).send({
                                    message: 'Successfully assigned new Task to User',
                                    data: newTask
                                })
                            })
                        } else {
                            newTask.assignedUser = "No assigned User";
                            newTask.assignedUserName = "No assigned Username";
                            newTask.save(function() {
                                res.status(201).send({
                                    message: 'Created Task but did not assign to User',
                                    data: newTask
                                })
                            })
                        }
                    })
                } else {
                    res.status(201).send({
                        message: 'Successfully created Task',
                        data: newTask
                    })
                }
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
    taskModel.findOne({_id: req.params.id}, function (err, result) {
        if (err) {
            res.status(404).send({
                message: 'Task Not Found',
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
    taskModel.findByIdAndDelete(req.params.id, function (err) {
        if (err) {
            res.status(404).send({
                message: 'Unsuccessfully deleted Task',
                data: {}
            })
        } else {
            userModel.updateOne({tasks: {$elemMatch: {$eq: req.params.id}}}, {$pullAll: {tasks: [req.params.id]}}, function (err, result) {
                if (err) {
                    res.status(404).send({
                        message: 'Unsuccessfully deleted Task',
                        data: {}
                    })
                } else {
                    res.status(200).send({
                        message: 'Successfully deleted Task',
                        data: result
                    })
                }
            })
        }
    })
})

router.put('/:id', function (req, res) {
    if (req.body.name && req.body.deadline) {
        taskModel.findOneAndUpdate({ _id: req.params.id }, req.body, {new: true}, function (err, result) {
            if (err) {
                res.status(404).send({
                    message: 'Task not found',
                    data: {}
                })
            } else {
                res.status(200).send({
                    message: 'Successfully updated Task',
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