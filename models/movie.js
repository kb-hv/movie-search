const mongoose = require('mongoose')

const schema = mongoose.Schema

const movieSchema = new schema({
    ID: Number,
    Title: String,
    Year: Number,
    Age: String,
    IMDb: Number,
    "Rotten Tomatoes": Number,
    Netflix: Number,
    Hulu: Number,
    "Prime Video": Number,
    "Disney+": Number,
    Directors: String,
    Genres: Array,
    Country: String,
    Language: String,
    Runtime: Number,
    Reviews: [{
        createdAt: Date,
        displayName: String,
        body: String
    }]
})

const Movie = mongoose.model('movie', movieSchema)

module.exports = Movie