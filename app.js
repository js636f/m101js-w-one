var express = require('express'),
	app = express(),
	engines = require('consolidate'),
	bodyParser = require('body-parser'),
	MongoClient = require('mongodb').MongoClient,
	assert = require('assert'),
	util = require('util'),
	app_port = process.env.app_port || 8124;

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({
		extended: true
	}));

// Handler for internal server errors
function errorHandler(err, req, res, next) {
	console.error(err.message);
	console.error(err.stack);
	res.status(500).render('error_template', {
		error: err
	});
};

MongoClient.connect('DB_CONNECTION_STRING', function (err, db) {
	assert.equal(null, err);
	console.log('Successfully connect to MongoDB.');

	app.get('/', function (req, res, next) {
		res.render('addMovieForm',{});
	});

	app.get('/movies', function (req, res) {

		db.collection('movies').find({}).toArray(function (err, docs) {
			res.render('movies', {
				'movies': docs
			});
		});
	});
	
	app.get('*', function (req, res) {
		res.status(404).render('404_template', {});
	});

	app.post('/add_movie', function (req, res, next) {
		var title = req.body.title;
		var year = req.body.year;
		var imdb = req.body.imdb;

		console.log(title + ' ' + year + ' ' + imdb);

		if ((title == '') || (year == '') || (imdb == '')) {
			next('Please fill the fields!');
		} else {

			db.collection('movies').insertOne({
				"title": title,
				"year": year,
				"imdb": imdb
			},
				function (err, result) {
				assert.equal(err, null);

				res.render('success_add', {
					'id': result.insertedId
				});

			});

		};
	});

	app.use(errorHandler);
	


	var server = app.listen(app_port, function () {
			const host = server.address().address;
			const port = server.address().port;

			console.log(`Example app listening at http://${host}:${port}`);
		});

});
