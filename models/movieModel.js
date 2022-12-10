var mongoose = require('mongoose');

var MovieSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    pictureURL: {type: String},
    genres: [String],
    description: {type: String, default: "No description"},
    dateCreated: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Movie', MovieSchema);