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
		var studentId = studentData.idStudent;
		var phase_id = studentData.phase;
		
		delete studentData.idStudent;
		delete studentData.phase;
		delete studentData.programName;

		if (studentId == "undefined"){
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
		} else {
			var teacherStudent = teacher.students.id(studentId);
			teacherStudent.update(studentData);
			console.log(teacherStudent);
			response.redirect('students');
		}
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

    	students.forEach(function(student){
    		student.student_id = String(student._id);
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

PhaseController.prototype.getPhaseInfo = function getPhaseInfo(response, _id){
	var id = mongoose.Types.ObjectId(_id);

	this.Phase.findOne({_id: id}, function(err, phase){
		response.json(phase);
	});
}

PhaseController.prototype.deletePhaseById = function deletePhaseById(request, response){
	var _id = mongoose.Types.ObjectId(request._id);

	this.Phase.remove({ _id : _id}, function(err){
		response.redirect('content');
	});
}

PhaseController.prototype.getStudentPhase = function getStudentPhase(request, response){
	var FoundException = {};
	var phaseName = 'N/A';
	var phaseId = 'N/A';

	this.Phase.find({}, function(err, phases){
		try{
			phases.forEach(function(phase){
				try{
					phase.studentsIn.forEach(function(student){
						if (student._id == request.studentId){
							throw FoundException;
						}
					});
				} catch(e) {
					phaseId = phase._id;
					phaseName = phase.phaseName;
					throw e;
				}
			});
		} catch (e){
		}

		response.json({phaseId: phaseId, phaseName: phaseName});
	})
}

PhaseController.prototype.createOrUpdateQuestion = function createOrUpdateQuestion(request, response){
	console.log(request);
	var phase_id = request.phase;

	delete request.phase;
	delete programName;

	this.Phase.findOne({_id: phase_id}, function(err, phase){
		if (request._id != "undefined"){
			var question_id = mongoose.Types.ObjectId(request._id);
			var oldQuestion = phase.questions.id(question_id);
			oldQuestion.remove();
		}

		delete request._id;

		phase.questions.push(request);

		phase.save(function(err, phase){
			response.redirect('questions');
		});
	});
}

PhaseController.prototype.getQuestionsByPhase = function getQuestionsByPhase(response, phase_id){
	var _id = mongoose.Types.ObjectId(phase_id);

	this.Phase.findOne({_id: _id}, function(err, phase){
		response.json(phase.questions);
	});
}

PhaseController.prototype.deleteQuestionFromPhase = function deleteQuestionFromPhase(request, response){
	var phaseId = mongoose.Types.ObjectId(request.phaseId);

	this.Phase.findOne({_id: phaseId}, function(err, phase){
		var questionId = mongoose.Types.ObjectId(request.questionId);
		var question = phase.questions.id(questionId);

		question.remove();

		phase.save(function(err){
			response.redirect('questions');
		});
	});
}

teacherController = new TeacherController();
phaseController = new PhaseController();

module.exports = {
	'TeacherController': teacherController,
	'PhaseController': phaseController
}