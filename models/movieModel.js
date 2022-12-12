var mongoose = require('mongoose');

var MovieSchema = new mongoose.Schema({
    adult: {type: Boolean, default: false},
    backdrop_path: {type: String, default: ""},
    genre_ids: {type: [Number], required: true},
    id: {type: Number, required: true},
    original_language: {type: String, required: true},
    original_title: {type: String, default: ""},
    overview: {type: String, required: true},
    popularity: {type: Number, default: -1},
    poster_path: {type: String, required: true},
    release_date: {type: String, required: true},
    title: {type: String, required: true},
    video: {type: Boolean, default: true},
    vote_average: {type: Number, required: true},
    vote_count: {type: Number, default: -1},
    dateCreated: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Movie', MovieSchema);