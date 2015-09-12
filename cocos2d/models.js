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
	fullName: String
});

var TeacherSchema = new Schema({
	username: String,
	password: String,
	fullName: String,
	students: [StudentSchema]
});
TeacherSchema.plugin(passportLocalMongoose);

var OptionSchema = new Schema({
	text: String,
	isCorrect: Boolean,
	isUserAnswer: Boolean,
});

var QuestionSchema = new Schema({
	text: String,
	options: [OptionSchema]
});


var PhaseSchema = new Schema({
	phaseID: Number,
	prevPhase: Number,
	nextPhase: Number,
	initSprite: String,
	endSprite: String,
	studentsIn: [StudentSchema]
});

var Model = mongoose.model.bind(mongoose);

var Student = Model('Student', StudentSchema);
var Teacher = Model('Teacher', TeacherSchema);
var Question = Model('Question', QuestionSchema);
var Option = Model('Option', OptionSchema);
var Phase = Model('Phase', PhaseSchema);	

module.exports = {
	'Student': Student,
	'Teacher': Teacher,
	'Question': Question,
	'Option': Option,
	'Phase': Phase
}

//var students = db.students.find();

/*Teacher.create({ username: 'ohernandez', password: '12341234', fullName: 'Omar Hernandez', students: [{ fullName: 'Juan Perozo'}] }, function (err) {

//	teacher.students = Student.find();

	if (err){ return err; }
  // saved!
});*/

//mongoose.connection.close();



