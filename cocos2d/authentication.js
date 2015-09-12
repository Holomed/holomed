/*
*	Este archivo maneja toda la logica correspondiente a login y registro
*
*/

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var expressSession = require('express-session');

var models = require('./models.js');
var Teacher = models.Teacher;

passport.use('holomed-auth', new LocalStrategy(function(username, password, done) {
  process.nextTick(function() {
	Teacher.find({username: username, password: password}, function (err, teachers) {
		if (err) return done(err);
		return done(null, teachers[0]);
	})
  });
}));

passport.serializeUser(Teacher.serializeUser());
passport.deserializeUser(Teacher.deserializeUser());

module.exports = {
	'passport': passport,
	'expressSession': expressSession
}
