/*
*	Este archivo maneja toda la logica 
*
*/
var mongoose = require('mongoose');
var models = require('./models.js');

function TeacherController(){
	this.Teacher = models.Teacher;
}

TeacherController.prototype.createNewTeacher = function createNewTeacher(response, teacherData){
	teacherData['students'] = []

	this.Teacher.create(teacherData, function(err){
		response.render('login', {
			successMessage: 'Ya puede iniciar sesión con el usuario ' + teacherData['username']
		})
	})
}

function nowDate(){
	var fullDate = new Date();
	var twoDigitMonth = fullDate.getMonth()+"";if(twoDigitMonth.length==1)	twoDigitMonth="0" +twoDigitMonth;
	var twoDigitDate = fullDate.getDate()+"";if(twoDigitDate.length==1)	twoDigitDate="0" +twoDigitDate;
	var currentDate = twoDigitDate + "/" + twoDigitMonth + "/" + fullDate.getFullYear();

	return currentDate;
}

TeacherController.prototype.createOrUpdateStudent = function createOrUpdateStudent(response, teacher, studentData){

	this.Teacher.findOne({_id : teacher._id}, function(err, teacher){
		var phase_id = studentData.phase;
		
		delete studentData.phase;
		delete studentData.programName;

		studentData['points'] = 0;
		studentData['registrationDate'] = nowDate();

		models.Student.create(studentData, function(err, student){

			models.Phase.findOne({ _id: phase_id }, function(err, phase){
				teacher.students.push(student);
				phase.studentsIn.push(student);

				teacher.save(function(teacher){
					phase.save(function(phase){
						response.redirect('students');
					});
				});
			});
		});

		//response.redirect();
	});
}

TeacherController.prototype.getStudents = function getStudents(response, teacher){
	var phasesList = [];

	models.Phase.find({}, function(err, phases){
		
		var userFullName = teacher.fullName;
		var students = teacher.students;

		phases.forEach(function(phase) {
			phase.phase_id = String(phase._id);
      		phasesList.push(phase);
    	});

		response.render('students', {
			page: 'students',
			teacher: userFullName,
			students: students,
			phases: phases
		});
	});
}


function PhaseController(){
	this.Phase = models.Phase;
}

PhaseController.prototype.getPhasesByProgram = function getPhasesByProgram(page, res, userFullName, programName){
	var phasesList = [];

	this.Phase.find({ programName: programName }, function(err, phases){
		phases.forEach(function(phase) {
			phase.phase_id = String(phase._id);
      		phasesList.push(phase);
    	});

    	res.render(page, {
			page: page,
			teacher: userFullName,
			phases: phases
		});
	});
}

PhaseController.prototype.getPhaseInfo = function getPhaseInfo(response, _id){
	var id = mongoose.Types.ObjectId(_id);

	this.Phase.findOne({_id: id}, function(err, phase){
		response.json(phase);
	});
}

PhaseController.prototype.createOrUpdatePhase = function createOrUpdatePhase(request, response){
	var id = request._id;
	delete request._id;

	if (id != 'undefined'){
		var _id = mongoose.Types.ObjectId(id);

		this.Phase.update({_id: _id}, request, function(err, phase){
			response.redirect('content');
		});
	} else {
		this.Phase.create(request, function(err, phase){
			response.redirect('content');
		});
	}
}

PhaseController.prototype.getQuestionsByPhase = function getQuestionsByPhase(response, phase_id){
	var _id = mongoose.Types.ObjectId(phase_id);

	this.Phase.findOne({_id: _id}, function(err, phase){
		response.json(phase.questions);
	});
}

teacherController = new TeacherController();
phaseController = new PhaseController();

module.exports = {
	'TeacherController': teacherController,
	'PhaseController': phaseController
}