// USAGE:
//
// If you have foreman (you should!) set you .env file with
// SINGLY_CLIENT_ID and SINGLY_CLIENT_SECRET and then run:
//
// $ foreman start
//
// Otherwise set SINGLY_CLIENT_ID and SINGLY_CLIENT_SECRET and run:
//
// $ node app

var express = require('express');
var querystring = require('querystring');
var request = require('request');
var sprintf = require('sprintf').sprintf;
var partials = require('express-partials');
var jade = require('jade');

// The port that this express app will listen on
var port = process.env.PORT || 7464;

// Your client ID and secret from http://dev.singly.com/apps
// var clientId = process.env.SINGLY_CLIENT_ID;
// var clientSecret = process.env.SINGLY_CLIENT_SECRET;

var clientId = 'c8a7420029019de07ae0bf406ef94e79';
var clientSecret = 'ffb97ec8fd34015bcdeae0420b47ff59';

var hostBaseUrl = (process.env.HOST || 'http://localhost:' + port);
var apiBaseUrl = process.env.SINGLY_API_HOST || 'https://api.singly.com';

// Create an HTTP server
var app = express();

// Require and initialize the singly module
var expressSingly = require('express-singly')(app, clientId, clientSecret,
  hostBaseUrl, hostBaseUrl + '/callback');

// Pick a secret to secure your session storage
var sessionSecret = '42';

// Setup for the express web framework
app.configure(function() {
  // Use ejs instead of jade because HTML is easy
  app.set('view engine', 'ejs');
  app.use(partials());
  app.use(express.logger());
  app.use(express['static'](__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: sessionSecret
  }));
  expressSingly.configuration();
  app.use(app.router);
});

expressSingly.routes();

// We want exceptions and stracktraces in development
app.configure('development', function() {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});



// The URL of the Singly API endpoint
var apiBaseUrl = 'https://api.singly.com';

// accessToken for using singly
var accessToken = 'LWk5WVTudryYirnLSNFsbCF2jIo';

// A small wrapper for getting data from the Singly API
var singly = {
  get: function(url, options, callback) {
    if (options === undefined ||
      options === null) {
      options = {};
    }

    options.access_token = accessToken;

    //$.getJSON(apiBaseUrl + url, options, callback);
    request(apiBaseUrl + url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body) // Print the google web page.
      }
      callback(body);
    });
  }
};


app.get('/', function(req, res) {
  // Render out views/index.ejs, passing in the session
  res.render('index', {
    session: req.session
  });
});

app.get('/friends', function(req, res) {
  // Get the 5 latest items from the user's statuses feed
  singly.get('/types/statuses_feed', { limit: 5 }, function(items) {
    // _.each(items, function(item) {
    //   $('#statuses').append(sprintf('<li><strong>Status:</strong> %s</li>',
    //     item.oembed.text));
    //   });
    res.json(items);
  });
});

app.listen(port);

console.log(sprintf('Listening at %s using API endpoint %s.', hostBaseUrl,
  apiBaseUrl));
