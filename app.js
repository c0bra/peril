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

var _ = require('underscore');
var express = require('express');
var RedisStore = require('connect-redis')(express);
var qs = require('querystring');
var request = require('request');
var sprintf = require('sprintf').sprintf;
var partials = require('express-partials');
var jade = require('jade');
var singly = require('singly');
var mongoose = require('mongoose');
var eyes = require('eyes');

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

var singly = new singly(clientId, clientSecret, hostBaseUrl + '/authed');

//var singlyUrl = singly.getAuthorizeURL('facebook', { redirect_uri: hostBaseUrl + '/callback' });

// MONGO

mongoose.connect('mongodb://website:test123@alex.mongohq.com:10057/PerilUs');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

// Setup Mongo stuff
var UserSchema = new Schema({
    id          : ObjectId
  , singlyid    : String
  , accessToken : String
  , name        : String
  , perilStatus : Number
  , lat         : Number
  , long        : Number
  , zip         : Number
  , friends     : Schema.Types.Mixed
  , blah        : Number
}, { collection : 'user' });

var User = mongoose.model('user', UserSchema);


// Pick a secret to secure your session storage
var sessionSecret = '42';

var redisOpts = {
  host:     'fish.redistogo.com',
  port:     9326,
  db:       'perilus',
  password: '0420f6b98d1069f40907df97a69776f3'
};

// Setup for the express web framework
app.configure(function() {
  // Use ejs instead of jade because HTML is easy
  app.set('view engine', 'jade');
  //app.use(partials());
  //app.use(express.logger());
  app.use(express['static'](__dirname + '/public'));
  app.use(express.bodyParser());
  
  app.use(express.cookieParser());
  app.use(express.session({
    secret: sessionSecret,
    store: new RedisStore({
      host: redisOpts.host,
      port: redisOpts.port,
      db: redisOpts.db,
      pass: redisOpts.password
    })
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

// Allow CORS
app.all('/*', function(req, res, next) {

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/', function(req, res) {
  // Render out views/index.ejs, passing in the session

  //console.log(req.session);

  res.render('index', {
    session: req.session
  });
});

app.get('/friends', function(req, res) {
  res.render('friends');
});

app.put('/user', function(req, res){});
app.get('/user/:id', function(req, res){});
app.get('/user/:id/friends', function(req, res){});
app.put('/user/:id/loc', function(req, res){});
app.get('/authed', function(req, res){
  var code = req.param('code');

  // Exchange the OAuth2 code for an access token
  singly.getAccessToken(code, function(err, accessTokenRes, token) {
    // Save the token for future API requests
    req.session.accessToken = token.access_token;

    //console.log(req.session);

    // Fetch the user's service profile data
    singly.get('/services/facebook/self', { access_token: token.access_token },
      function(err, fbself) {
        var profile = fbself.body[0];
        // req.session.profile = profile;

        //console.log(req.session.profile);

        if (typeof profile.id != null && profile.id != "") {
          var id = profile.id;
        }

        if (typeof(id) == undefined || id == null) {
          res.send("ERROR");
        }

        //console.log("ID: " + id);

        // See if the  user exists already
        User.findOne({ 'singlyid': id }, function (err, user) {
          if (err) {
            console.log(err);
          }

          if (user === null) {
            var user = new User({
              singlyid: id,
              name: profile.data.name,
              accessToken: req.session.accessToken,
              friends: []
            });

            user.save(function(err){
              if (err) { console.log("ERROR!"); }

              req.session.user = user;

              res.redirect(hostBaseUrl + '/');
              // res.render('index', {
              //   session: req.session
              // });
            });
          }
          else {
            user.accessToken = req.session.accessToken;

            user.save(function(err){
              req.session.user = user;

              res.redirect(hostBaseUrl + '/');
              // res.render('index', {
              //   session: req.session
              // });
            });
          }
      });
    });
  });
});

app.get('/api/friends', function(req, res){
  // Get the facebook friends for this user

  getCurrentUser(req, function(user){
    var opts = { qs: {} };
    opts.qs.access_token = req.session.accessToken;
    opts.qs.limit = 1000;

    singly.get('/services/facebook/friends', opts, function (err, sres) {
      var friends = sres.body;

      console.log("Count:" + friends.length);

      // Made id list of friends
      var friend_ids = _.map(friends, function(f){ return f.id });
      
      console.log(friend_ids);

      // Get the list of this user's friends he's following
      User.find({'singlyid': { '$in': friend_ids } }, function(err, founds){
        // 'founds' is the list of users the current user is following
        console.log(founds);

        var avail = [];

        _.each(friends, function(f) {
          var matched = _.where(founds, { "singlyid": f.id });

          if (matched.length > 0) {
            var match = matched[0];
            //console.log(match);
            //eyes.inspect(user.friends, false, null);
            f._id = match._id;

            if (typeof(user.friends[match._id]) != "undefined" && user.friends[match._id] != null) {
              f.following = true;
            }

            avail.push(f);
          }
        });

        res.send(avail);
      });
    });
  });
});

app.get('/main', function(req, res) { res.send('') });

app.get('/auth', function(req, res){
  res.render('auth', {
    singlyUrl: singly.getAuthorizeURL('facebook')
  });
});

// Follow a user
app.post('/api/follow', function(req, res) {
  var id = req.param('id');

  getCurrentUser(req, function(user) {
    user.friends[id] = true;
    user.markModified('friends');
    user.save(function(err){
      req.session.user = user;

      res.json({ status: 'followed '});
    });
  });
});

// Unfollow a user
app.post('/api/unfollow', function(req, res) {
  var id = req.param('id');

  // Get the current user
  getCurrentUser(req, function(user) {
    req.session.user = undefined;

    eyes.inspect(user.friends);

    delete user.friends[id];
    user.markModified('friends');

    user.save(function(err){
      req.session.user = user;

      res.json({ status: 'unfollowed '});
    });
  });
});

app.listen(port);

console.log(sprintf('Listening at %s using API endpoint %s.', hostBaseUrl,
  apiBaseUrl));


function getCurrentUser(req, callback) {
  var id = req.session.user._id;

  User.findById(id, function(err, user) {
    callback(user);
  });
}