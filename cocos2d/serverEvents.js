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

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});

app.use('/lib', express.static(__dirname + '/holomed/lib'));
app.use('/project', express.static(__dirname + '/holomed/project') );
app.use('/res', express.static(__dirname + '/holomed/res'));
app.use('/src', express.static(__dirname + '/holomed/src'));
app.use('/main.js', express.static(__dirname + '/holomed/main.js'));
app.use('/project.json', express.static(__dirname + '/holomed/project.json'));
app.use('/frameworks', express.static(__dirname + '/frameworks') );

var server = app.listen(3000, function() {
    console.log('Server Listening...');
});

var sockets = io.listen(server, { origins: '*:*' });

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'holomed', 'index.html'));
});

app.get('/action', function(req, res) {
    sockets.emit('update', "update!");
    res.send('Action Received Successfully!');
});

sockets.on('connection', function (socket) {
    socket.broadcast.emit('Element Connected!');
    console.log('Element connected');
});