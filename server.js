// 5000 is the gate.

// Express initialization
var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator'); // See documentation at https://github.com/chriso/validator.js
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
  'mongodb://localhost/test'; // comp20 is the name of the database we are using in MongoDB
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
  db = databaseConnection;
});

// API for POST.
// how to send the error messages?
// LOG: Need to check the insert function again.

app.post('/sendLocation', function (request, response) { // whut is this 1st arg?
        var newLat = parseFloat(request.body.lat);
        var newLng = parseFloat(request.body.lng);
        var newLogin = request.body.login;
        if ('login' in request.body.login) {
                response.send('{"error":"Whoops, something is wrong with your data!"}');
        }
        var timeStamp = request.getDate();
        // use update with a call back
        // then I need to return everything.
        db.collection('locations', function(er, collection) {
                db.locations.update(
                        { login: newLogin },
                        {
                                login: newLogin,
                                lat: newLat,
                                lng: newLng,
                                created_at: timeStamp
                        },
                        { upsert: true },
                        function(err, result) {
                          // depending, we need to send back the result
                          // response.send({"error": "some messages"});
                          if (err) {
                                response.status(500);
                                response.send("Whoop something went wrong");
                          }
                          else {
                                response.send(200);
                                // how do I send back the result as array? db.find()
                                result = json(db.locations.find().toArray());
                                response.send(result);
                          }
                        });
        });
});

// return a JSON
app.get('/location.json', function (request, response) {
  db.collection('locations', function (err, collection) {
/*    var login = request.query.login;
    // if login name isn't there, send back empty json.
    var myLogin = db.locations.findOne(login).toArray(function (err, result)
      {

      });
    if (login == NULL) {
      response.send('{}');
    }
    else {
      response.send(json())  // TODO: send back the object here.
    }
  }); */
});

// the home directory.
app.get('/', function (request, response) {
  response.set('Content-Type', 'text/html');
  var indexPage = '';
  db.collection('locations', function(er, collection) {
    collection.find().toArray(function(err, cursor) {
        if (!err) {
          indexPage += "<!DOCTYPE HTML><html><head><title>Locations</title></head><body><h1>Wonder everyone is?</h1>";
          for (var count = 0; count < cursor.length; count++) {
            var login = cursor[count].login;
            var lat = cursor[count].lat;
            var lng = cursor[count].lng;
            var time = cursor[count].created_at;
            indexPage += "<p>" + login + " checked in at " + lat + " , " + lng + "at time " + time + " </p>";
          }
        indexPage += "</body></html>"
        response.send(indexPage);
        response.send('<p>whut is going on</p>');
      }
    });
  });
});


// Oh joy! http://stackoverflow.com/questions/15693192/heroku-node-js-error-web-process-failed-to-bind-to-port-within-60-seconds-of
app.listen(process.env.PORT || 3001);