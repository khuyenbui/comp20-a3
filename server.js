// Express initialization
var express = require('express');
var app = express();

// set Cross-Origin Policy
app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

// Mongo initialization, setting up a connection to a MongoDB  (on Heroku or localhost)
var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/whereintheworld'; // comp20 is the name of the database we are using in MongoDB
var mongo = require('mongodb');
var db = mongo.Db.connect(mongoUri, function (error, databaseConnection) {
  db = databaseConnection;
});

// API for POST.
// how to send the error messages?

app.post('/sendLocation', function(request, response) { // whut is this 1st arg?
        var lat = request.lat;
        var lng = request.lng;
        var login = request.login;
        if (lat == NULL || lng == NULL || login == NULL) {
                response.send('{"error":"Whoops, something is wrong with your data!"}');
        }
        var timeStamp = request.Timestamp;
        var toInsert = {
                "location": lat, lng, login, timeStamp,
        };
        // make sure it's not repeated.
        db.locations.update(
                {login: login},
                {
                        login: "login",
                        lat: lat,
                        lng: lng,
                }
                { upsert: true }
                )
        /*
        db.collection('locations', function(er, collection) {
                if (db.collection.update(login))
                var id = collection.insert(toInsert, function(err, saved) {
                        if (err) {
                                response.send(500);
                        }
                        else {
                                response.send(200);
                        }
            });
        });
        */
});

app.get('/', function (request, response) {
  response.set('Content-Type', 'text/html');
  response.send('<p>Hey, it works!</p>');
});


// Oh joy! http://stackoverflow.com/questions/15693192/heroku-node-js-error-web-process-failed-to-bind-to-port-within-60-seconds-of
app.listen(process.env.PORT || 3000);