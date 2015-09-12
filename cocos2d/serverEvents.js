/****************************************************************************

    Configuracion del servidor nodejs para las pantallas reflectoras del holograma.

    Inicializa el servidor como los sockets para enviar la informacion a las vistas,
    donde estan los movimientos de las imagenes
    
*
*/

var express = require('express');
var bParser = require('body-parser');

var urlencodedParser = bParser.urlencoded({ extended: false });

var app = express();

var io = require('socket.io');
var path = require('path');
var sys = require('sys');
var exec = require('child_process').exec;

var authentication = require('./authentication.js');
var passport = authentication.passport;


function runNI(error, stdout, stderr){
	console.log("Opening Holomed Monitor");
}

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});

app.use('/streamed', express.static(__dirname + '/holomed/streamed') );	
app.use('/lib', express.static(__dirname + '/holomed/lib'));
app.use('/project', express.static(__dirname + '/holomed/project') );
app.use('/res', express.static(__dirname + '/holomed/res'));
app.use('/src', express.static(__dirname + '/holomed/src'));
app.use('/admin/js', express.static(__dirname + '/holomed/admin/js') );
app.use('/admin/css', express.static(__dirname + '/holomed/admin/css') );
app.use('/js', express.static(__dirname + '/holomed/admin/js') );
app.use('/css', express.static(__dirname + '/holomed/admin/css') );
app.use('/main.js', express.static(__dirname + '/holomed/main.js'));
app.use('/project.json', express.static(__dirname + '/holomed/project.json'));
app.use('/frameworks', express.static(__dirname + '/frameworks') );
app.use('/socketio', express.static(__dirname + '/frameworks/cocos2d-html5/external/socketio') );

app.use(authentication.expressSession({
	secret: 'holomed',
	resave: true,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

var server = app.listen(3000, function() {
    console.log('Server Listening...');
});

var sockets = io.listen(server, { origins: '*:*' });

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'holomed', 'index.html'));
});

app.get('/login', function(req, res, next) {
    res.sendFile(path.join(__dirname, 'holomed', 'admin/login.html'));
	//res.render('login', {user: req.user});
});

app.post('/login', urlencodedParser, function(req, res, next) {
	passport.authenticate('holomed-auth', function(err, user, info) {
		if (err) { return next(err); }
		if (!user) {
    		res.redirect('/loginFailure');
    	}
    
    	req.logIn(user, function(err) {
    		if (err) { return next(err); }
		    return res.redirect('/admin');
    	});
	})(req, res, next);
});

app.get('/loginFailure', function(req, res, next) {
  res.send('Failed to authenticate');
});
 
app.get('/loginSuccess', function(req, res, next) {
  res.send('Successfully authenticated');
});


app.get('/admin', isAuthenticated, function(req, res) {
    res.sendFile(path.join(__dirname, 'holomed', 'admin/index.html'));
});

app.get('/ni', function(req, res){
	exec('python ../monitor-holomed-orders.py &', runNI);
	res.sendFile(path.join(__dirname, 'holomed', 'admin.html'));
});

app.get('/test', function(req, res) {
    res.sendFile(path.join(__dirname, 'holomed', 'testyusugomori.html'));
});

app.get('/action', function(req, res) {
    sockets.emit('update', "update!");
    console.log("Emitio");
    res.send('Action Received Successfully!');
});

sockets.on('connection', function (socket) {
    console.log('Element connected');

	socket.on('kinect-received', function(data){
		console.log("Listo Nojoda");
		//socket.broadcast.emit('update-image', 'update!!');
	});
});
