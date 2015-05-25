/****************************************************************************

    Configuracion del servidor nodejs para las pantallas reflectoras del holograma.

    Inicializa el servidor como los sockets para enviar la informacion a las vistas,
    donde estan los movimientos de las imagenes
    
*
*/

var express = require('express');
var app = express();
var io = require('socket.io');
var path = require('path');
var sys = require('sys');
var exec = require('child_process').exec;

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
app.use('/admin', express.static(__dirname + '/holomed/admin') );
app.use('/main.js', express.static(__dirname + '/holomed/main.js'));
app.use('/project.json', express.static(__dirname + '/holomed/project.json'));
app.use('/frameworks', express.static(__dirname + '/frameworks') );
app.use('/socketio', express.static(__dirname + '/frameworks/cocos2d-html5/external/socketio') );

var server = app.listen(3000, function() {
    console.log('Server Listening...');
});

var sockets = io.listen(server, { origins: '*:*' });

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'holomed', 'index.html'));
});

app.get('/right', function(req, res) {
    res.sendFile(path.join(__dirname, 'holomed', 'indexRight.html'));
});

app.get('/admin', function(req, res) {
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
    res.send('Action Received Successfully!');
});

sockets.on('connection', function (socket) {
    console.log('Element connected');

	socket.on('kinect-received', function(data){
		socket.broadcast.emit('update-image', 'update!!');
	});
});
