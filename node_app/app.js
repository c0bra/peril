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
var qs = require('querystring');
var request = require('request');
var sprintf = require('sprintf').sprintf;
var partials = require('express-partials');
var jade = require('jade');
var singly = require('singly');

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

var singly = new singly(clientId, clientSecret, hostBaseUrl + '/callback');

//var singlyUrl = singly.getAuthorizeURL('facebook', { redirect_uri: hostBaseUrl + '/callback' });

// Pick a secret to secure your session storage
var sessionSecret = '42';

// Setup for the express web framework
app.configure(function() {
  // Use ejs instead of jade because HTML is easy
  app.set('view engine', 'jade');
  //app.use(partials());
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
var accessToken = 'r2hyvEMa31TJBBrF50F62nCthKQ.15uO48Z547764bea64d8f935c395c3275512326aea78d5280ba59bc300fa7111bf7448252ee914a8789f29e4b0ee52d7eb596edabaadd179feb8f54ade179953fe4d209e625819d64fe17d05bac7d49dc8874b57e9f13f4410b4c66d197f1369b21ea3e3';

// A small wrapper for getting data from the Singly API
var singlyOther = {
  get: function(url, options, callback) {
    if (options === undefined ||
      options === null) {
      options = {};
    }

    options.access_token = accessToken;

    url = apiBaseUrl + url;
    if (qs.stringify(options) !== null && qs.stringify(options) !== "") {
      url = url + '?' + qs.stringify(options);
    }

    //console.log(url);

    //$.getJSON(apiBaseUrl + url, options, callback);
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        //console.log(body) // Print the google web page.
      }

      callback(body);
    });
  }
};

// Allow CORS
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/', function(req, res) {
  // Render out views/index.ejs, passing in the session
  res.render('index', {
    session: req.session
  });
});

app.get('/friends', function(req, res) {
  // Get the 5 latest items from the user's statuses feed
  //singly.get('/types/statuses_feed', { limit: 1 }, function(items) {
  singlyOther.get('/friends/facebook', { limit: 1 }, function(items) {
    // _.each(items, function(item) {
    //   $('#statuses').append(sprintf('<li><strong>Status:</strong> %s</li>',
    //     item.oembed.text));
    //   });

    console.log(items);

    res.send(items);
  });
});

app.put('/user', function(req, res){});
app.get('/user/:id', function(req, res){});
app.get('/user/:id/friends', function(req, res){});
app.put('/user/:id/loc', function(req, res){});
app.get('/authed', function(req, res){
  console.log(req.query["code"]);

  res.render('index');
});

app.get('/friends', function(req, res){});
app.get('/auth', function(req, res){
  res.render('auth', {
    singlyUrl: singly.getAuthorizeURL('facebook')
  });
});

app.listen(port);

console.log(sprintf('Listening at %s using API endpoint %s.', hostBaseUrl,
  apiBaseUrl));