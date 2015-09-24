/*
*	Este archivo construye la Base de Datos
*
*/

var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/holomeddb');

var db = mongoose.connection;

var Schema = mongoose.Schema;

var StudentSchema = new Schema({
	fullName: String,
	points: Number,
	registrationDate: String
});

var TeacherSchema = new Schema({
	username: String,
	password: String,
	fullName: String,
	students: [StudentSchema]
});
TeacherSchema.plugin(passportLocalMongoose);

var QuestionSchema = new Schema({
	text: String,
	answer: String
});


var PhaseSchema = new Schema({
	programName: String,
	phaseName: String,
	phaseID: Number,
	prevPhase: Number,
	nextPhase: Number,
	initSprite: String,
	endSprite: String,
	description: String,
	studentsIn: [StudentSchema],
	questions: [QuestionSchema]
});

var Model = mongoose.model.bind(mongoose);

var Student = Model('Student', StudentSchema);
var Teacher = Model('Teacher', TeacherSchema);
var Question = Model('Question', QuestionSchema);
var Phase = Model('Phase', PhaseSchema);	

module.exports = {
	'Student': Student,
	'Teacher': Teacher,
	'Question': Question,
	'Phase': Phase
}

/*
//var students = db.students.find();

Teacher.create({ username: 'ohernandez', password: '12341234', fullName: 'Omar Hernandez', students: [{ fullName: 'Juan Perozo', points: 0}] }, function (err) {

//	teacher.students = Student.find();

	if (err){ return err; }
  // saved!
});

Phase.create({ programName: 'Parto Eutocico Simple', phaseName: 'Descenso' ,phaseID: 1, prevPhase: -1, nextPhase: -1, initSprite: '0', endSprite: '10', description: 'Esta es una fase de prueba', studentsIn: [], questions: [{text: 'Por que se le dice la fase de descenso?', answer: 'Porque si'}]}, function(err, phase){
	if (err){ return err; }
	// saved!
});



mongoose.connection.close();
*/


