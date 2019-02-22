var express = require('express');
var passport = require('passport');
var Strategy = require('passport-github').Strategy;
const pug = require('pug');
//const compiledFunction = pug.compileFile('./views/home.pug');


passport.use(new Strategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'https://beautiful-sky.glitch.me/login/github/return'
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

var app = express();

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

app.get('/login/github',passport.authenticate('github'));

app.get('/login/github/return', passport.authenticate('github', { failureRedirect: '/home' }),(req, res) => {
  res.redirect('/');
});

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

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
