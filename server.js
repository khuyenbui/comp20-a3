// 3001 is the gate.

// set Cross-Origin Policy
/*app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });
*/

// Mongo initialization, setting up a connection to a MongoDB  (on Heroku or localhost)
var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/test'; // test is the name of the database we are using in MongoDB
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
  db = databaseConnection;
});

// Initialization
var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator'); // See documentation at https://github.com/chriso/validator.js
var app = express();
// See https://stackoverflow.com/questions/5710358/how-to-get-post-query-in-express-node-js
app.use(bodyParser.json());
// See https://stackoverflow.com/questions/25471856/express-throws-error-as-body-parser-deprecated-undefined-extended
app.use(bodyParser.urlencoded({ extended: true }));


// API for POST.
// how to send the error messages?
// LOG: Need to check the insert function again.

app.post('/sendLocation', function (request, response) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "X-Requested-With");
        var newLat = request.body.lat;
        var newLng = request.body.lng;
        var newLogin = request.body.login;
/*        if (!request.body.lat|| !request.body.lng || !request.body.login) {
                response.send('{"error":"Whoops, something is wrong with your data!"}');
        }
                */
        var timeStamp = new Date();
        // use update with a call back
        // then I need to return everything.
        db.collection('locations', function ( er, collection) {
                collection.update(
                        { "login": newLogin },
                        {
                                "login": newLogin,
                                "lat": parseFloat(newLat),
                                "lng": parseFloat(newLng),
                                "created_at": timeStamp
                        },
                        { upsert: true },
                        function (err, result) {
                          // depending, we need to send back the result
                          // response.send({"error": "some messages"});
                          if (err) {
                                response.status(500);
                                response.send("Whoop something went wrong");
 //                               response.status(500);
                          }
                          else {
                                // how do I send back the result as array? db.find()
                                collection.find().toArray(function (err, resultArray) {
                                    if (!err) {
                                      response.status(200);
                                      response.send(resultArray);
                                    }
                                    else {
                                      response.status(500)
                                      response.send("Whoop something went wrong");
                                    }
                                  });
                                }
                              });
                        });
});

// return a JSON
app.get('/location.json', function (request, response) {
///*
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "X-Requested-With");
  var login = request.query.login;
  db.collection('locations', function (err, collection) {
    // if login name isn't there, send back empty json.
    collection.find({"login": login }).toArray(function (err, result)
      {
        if (err) {
          response.send('{}');
        }
        else {
          response.send(result[0]);
        }
      });
  });
//*/
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
      }
    });
  });
});


// Oh joy! http://stackoverflow.com/questions/15693192/heroku-node-js-error-web-process-failed-to-bind-to-port-within-60-seconds-of
app.listen(process.env.PORT || 3001);