/****************************************************************************

    Configuracion del servidor nodejs para las pantallas reflectoras del holograma.

    Inicializa el servidor como los sockets para enviar la informacion a las vistas,
    donde estan los movimientos de las imagenes
    
*
*/

var express = require('express');
var swig = require('./filters').swig;
var bParser = require('body-parser');

var urlencodedParser = bParser.urlencoded({ extended: false });

var app = express();

var io = require('socket.io');
var path = require('path');
var sys = require('sys');
var exec = require('child_process').exec;

var authentication = require('./authentication.js');
var passport = authentication.passport;

var controllers = require('./controllers.js');

app.engine('html', swig.renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + '/holomed/admin/views');

// Solo desarrollo
app.set('view cache', false);
swig.setDefaults({ cache: false });

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
app.use('/font', express.static(__dirname + '/holomed/admin/font') );
app.use('/img', express.static(__dirname + '/holomed/admin/img') );
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
var senderSocket = null;

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'holomed', 'index.html'));
});

app.get('/login', function(req, res, next) {
	res.render('login');
});

app.post('/login', urlencodedParser, function(req, res, next) {
	passport.authenticate('holomed-auth', function(err, user, info) {
		if (err) { return next(err); }
		if (!user) {
    		res.redirect('/loginFailure');
    	}
    
    	req.logIn(user, function(err) {
    		if (err) { return next(err); }
		    return res.redirect('/students');
    	});
	})(req, res, next);
});

app.get('/register', function(req, res, next) {
	res.render('registration');
});

app.post('/register', urlencodedParser, function(req, res, next) {
	controllers.TeacherController.createNewTeacher(res, req.body);
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

app.get('/loginFailure', function(req, res, next) {
	res.render('login', { error: true });
});
 
app.get('/admin', isAuthenticated, function(req, res) {
	var userFullName = req.user.fullName;
	res.render('index', {
		page: 'dashboard',
		teacher: userFullName
	});
});

app.get('/ni', isAuthenticated, function(req, res){
	exec('python ../holomed-orders.py &', runNI);
	res.redirect('admin');
});

app.get('/students', isAuthenticated, function(req, res){
	controllers.TeacherController.getStudents(res, req.user);
});

app.post('/students', isAuthenticated, urlencodedParser, function(req, res){
	controllers.TeacherController.createOrUpdateStudent(res, req.user, req.body);
});

app.get('/getPhaseStudent', isAuthenticated, function(req, res){
	controllers.PhaseController.getStudentPhase(req.query, res);
})

app.post('/deleteStudent', isAuthenticated, urlencodedParser, function(req, res){
	controllers.TeacherController.deleteStudentById(req.body, res, req.user);
});

app.get('/content', isAuthenticated, function(req, res){
	var userFullName = req.user.fullName;
	controllers.PhaseController.getPhasesByProgram('content', res, userFullName, 'Parto Eutocico Simple');
});

app.post('/content', isAuthenticated, urlencodedParser, function(req, res){
	controllers.PhaseController.createOrUpdatePhase(req.body, res);
});

app.get('/getPhaseInfo', isAuthenticated, function(req, res){
	controllers.PhaseController.getPhaseInfo(res, req.query['_id']);
});

app.get('/getAllPhases', isAuthenticated, function(req, res){
	controllers.PhaseController.getPhasesByProgramJson(res, 'Parto Eutocico Simple');
});

app.post('/deletePhase', isAuthenticated, urlencodedParser, function(req, res){
	controllers.PhaseController.deletePhaseById(req.body, res);
});

app.get('/questions', isAuthenticated, function(req, res){
	var userFullName = req.user.fullName;
	controllers.PhaseController.getPhasesByProgram('questions', res, userFullName, 'Parto Eutocico Simple');
});

app.post('/questions', isAuthenticated, urlencodedParser, function(req, res){
	controllers.PhaseController.createOrUpdateQuestion(req.body, res);
});

app.get('/getPhaseQuestions', isAuthenticated, function(req, res){
	controllers.PhaseController.getQuestionsByPhase(res, req.query['_id']);
});

app.post('/deleteQuestionFromPhase', isAuthenticated, urlencodedParser, function(req, res){
	controllers.PhaseController.deleteQuestionFromPhase(req.body, res);
});

userId = "5621e52c79f8de573662f7cf";

app.get('/resetLesson', isAuthenticated, function(req, res) {
    controllers.StudentController.resetLesson(req.query['_id'], function(err, idUser){
    	var phaseList = [];

	    controllers.StudentController.sendDataStudent(idUser, function(err, data){
	    	var questionList = [];

	    	data.forEach(function(phase){
	    		questionList.push(phase.questions);

	    		delete phase.questions;
	    		phase.status = 0;

	    		phaseList.push(phase);
	    	});

			var fetchDataBase = {
				"userId": idUser,
				"phaseList": phaseList,
	    		"questionList": questionList,
	    		"reset": true
	    	}

	    	console.log(senderSocket);
	    	sockets.emit('reset', fetchDataBase);

	    	res.redirect('admin');
	    });
	});
});

listActions = ['instructions', 'getContent', 'goQuestions', 'options']
actualAction = 0;
instructions = false;

app.post('/action', urlencodedParser, function(req, res) {
	var message = null;
	var request = JSON.parse(req.body['message']);
	if (actualAction < 3){
		if (request.direction == 'right'){
			actualAction++; 
		} 
		message = {
			"name": listActions[actualAction]
		}
	} else {
		var answer = 'Verdadero';
		if (request.direction == 'left'){
			answer = 'Falso'
		}

		message = {
			"name": listActions[actualAction], "extra": answer
		}
	}

	console.log(message);

    sockets.emit('ni-message', message);
    console.log("Emitio");
    res.send('Action Received Successfully!');
});

sockets.on('connection', function (socket) {
	senderSocket = socket;

    console.log('Element connected.');
    var questionInstructions = 
    	'Alce la mano derecha si cree que es verdadero, de lo contrario, alce la mano izquierda';

	var phaseList = []


    controllers.StudentController.sendDataStudent(userId, function(err, data){
    	var questionList = [];

    	data.forEach(function(phase){
    		questionList.push(phase.questions);

    		delete phase.questions;
    		phase.status = 0;

    		phaseList.push(phase);
    	});

		var fetchDataBase = {
			"userId": userId,
			"phaseList": phaseList,
    		"questionList": questionList,
    		"reset": false
    	}

    	socket.emit('load-database-data', fetchDataBase);
    });


    socket.on('addPoints', function (sessionData){
    	controllers.StudentController.sumPoints(sessionData, function(beatedRecord){
    		if (beatedRecord){
    			console.log("Notificacion al administrador de que el record se supero");
    		}
    	});
	});

	socket.on('userPhase', function (data){
    	//	console.log(data);
    	console.log(phaseList[data.userPhase]);
    	controllers.StudentController.setActualPhase(userId, phaseList[data.userPhase], function(){
    		console.log("Actualizar vista de examen");
    	});
    });

    socket.on('actualAction', function(data){
    	actualAction = 0;
    });
});
