const express = require('express');
const passport = require('passport');
const Strategy = require('passport-github').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const uri = process.env.MONGO_URI;

let saltRounds = 10;
let db;
let collection;
let dbClient;

MongoClient.connect(uri, { useNewUrlParser: true })
.then(client => {
  console.log("Connected successfully to server");
  db = client.db('login');
  collection = db.collection('users');
  dbClient = client;
}).catch(error => console.error(error));

// github
passport.use('github', new Strategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'https://exuberant-tourmaline.glitch.me/auth/github/callback'
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  })
);

// local
passport.use('local', new LocalStrategy(
  function(username, password, done) {
    collection.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      bcrypt.compare(password, user.password, function(err, res) { 
        if (res === true) { return done(null, user); }
        else { return done(null, false); }
      }) 
    });
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(process.cwd() + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: process.env.SECRET, resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.get('/',(req, res) => {
  res.render('home', { user: req.user });
});

app.get('/users',(req, res) => { // used for form inputs on /login/sign-up page
  collection.find({}, { projection : { password: 0, _id: 0 } }).toArray((err, data) => {
    if (err) throw err;
    res.json(data);
  })
});

/* login & sign-up */
// github
app.get('/login/github',passport.authenticate('github'));

app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/', successRedirect: '/' }))

// local
app.get('/login/local', passport.authenticate('local', { failureRedirect: '/', successRedirect: '/' }))

// manual - new user
app.post('/sign-up',(req, res) => {
  var user = req.body.username;
  var pass = req.body.password;
  bcrypt.hash(pass, saltRounds, function(err, hash) {
    collection.insertOne({ username: user, password: hash })
      .then(data => {
        res.redirect('/');
      })
      .catch(err => console.log(err));
  });
});

/* authenticated user */
app.get('/profile',require('connect-ensure-login').ensureLoggedIn(),(req, res) => {
  res.render('profile', { user: req.user });
});

app.get('/log', function(req, res){
  req.logOut();
  req.session.destroy(function (err) {
    res.redirect('/logout');
  });
});

app.get('/logout',(req, res) => {
  res.render('logout');
});

process.on('SIGINT', () => {
  dbClient.close();
  process.exit();
});

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
