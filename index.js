const config = require('./config.json')

const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')

const app = express()

const Movie = require('./models/movie')

mongoose.connect(config.dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
        console.log('connected to db')
        app.listen(process.env.PORT || 3000)
    })
    .catch((err) => console.log(err))

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

app.use(morgan('dev'))

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/dashboard', (req, res) => {
    res.render('dashboard', { movies: {}, message: 'Add some filters and click the submit button' })
})

app.post('/dashboard', (req, res) => {
    let input = req.body
    console.log(input);
    let filters = {};
    if (input.age) {
        filters = { ...filters, Age: input.age }
    }
    if (input.imdb) {
        let x = parseInt(input.imdb)
        filters = { ...filters, IMDb: { $gt: x } }
    }
    if (input.rotten) {
        let x = parseInt(input.rotten)
        console.log(x)
        filters = { ...filters, "Rotten Tomatoes": { $gt: x } }
    }
    if (input.time) {
        let x = parseInt(input.time)
        filters = { ...filters, Runtime: { $gt: x } }
    }
    if (input.netflix || input.prime || input.disney || input.hulu) {
        let x = []
        if (input.netflix) {
            x.push({ Netflix: 1 })
        }
        if (input.prime) {
            x.push({ "Prime Video": 1 })
        }
        if (input.hulu) {
            x.push({ Hulu: 1 })
        }
        if (input.disney) {
            x.push({ "Disney+": 1 })
        }
        filters = { ...filters, $or: x }
    }
    if (input.from || input.to) {
        let timeperiod = {};
        if (input.from) {
            let x = parseInt(input.from)
            timeperiod = { ...timeperiod, $gte: x }
        }
        if (input.to) {
            let x = parseInt(input.to)
            timeperiod = { ...timeperiod, $lt: x }
        }
        filters = { ...filters, Year: timeperiod }
    }
    if (input.searchtext != '') {
        if (input.searchoption === "title") {
            filters = { ...filters, Title: { $regex: new RegExp(input.searchtext, "i") } }
        }
        if (input.searchoption === "director") {
            filters = { ...filters, Directors: { $regex: new RegExp(input.searchtext, "i") } }
        }
        if (input.searchoption === "language") {
            filters = { ...filters, Language: { $regex: new RegExp(input.searchtext, "i") } }
        }
        if (input.searchoption === "genre") {
            filters = { ...filters, Genres: { $regex: new RegExp(input.searchtext, "i") } }
        }
    }
    Movie.find(filters).limit(50)
        .then(result => res.render('dashboard', { movies: result, message: 'Nothing :(' }))
        .catch(e => res.render('dashboard', { movies: {}, message: 'There was an error. Please try again later.' }))
})

app.get('/write-review', (req, res) => {
    res.render('write-review', {movID: req.query.mov, title: req.query.title})
})

app.post('/write-review', (req, res) => {
    let id = req.body.id
    let review = {
        createdAt: new Date(),
        displayName: req.body.name,
        body: req.body.review
    }
    let mov = Movie.findOne({ ID: parseInt(id) })
        .then(result => {
            return result
        })
        .catch(e => console.log(e))
    if (mov.Reviews) {
        console.log('here')
        Movie.updateOne({ ID: id }, { $set: { Reviews: [] } })
    }
    Movie.updateOne({ ID: id }, { $push: { Reviews: review } })
        .then(result => {
            res.render('dashboard', { movies: {}, message: 'Your review has been added!' })})
        .catch(e => res.render('dashboard', { movies: {}, message: 'There was an error, could not add your review :(' }))
})

app.get('/view-reviews', (req, res) => {
    console.log((req.query))
    Movie.findOne({ID: parseInt(req.query.movID)})
        .then(result => res.render('view-reviews', { revs: result }))
        .catch(e => res.render('dashboard', { movies: {}, message: 'There was an error. Please try again later.' }))
})