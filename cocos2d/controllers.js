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
	var studentId = studentData.idStudent;
	var phase_id = studentData.phase;

	delete studentData.programName;
	delete studentData.idStudent;
	delete studentData.phase;

	if (studentId == 'undefined'){
		studentData['_teacher'] = mongoose.Types.ObjectId(teacher._id);
		studentData['_phase'] = mongoose.Types.ObjectId(phase_id);
		studentData['points'] = 0;
		studentData['registrationDate'] = nowDate();

		var student = new models.Student(studentData);
		student.save(function(err){
			teacher.students.push(student._id);
			teacher.save(function(err){
				models.Phase.findOne({_id: phase_id}, function(err, phase){
					phase.studentsIn.push(student._id);
					phase.save(function(err){
						response.redirect('students');
					});
				});
			});
		});
	} else {
		models.Student.findOne({_id: studentId}, studentData, function(err, student){
			response.redirect('students');
		});
	}	
}

TeacherController.prototype.getStudents = function getStudents(response, teacher){
	this.Teacher.findOne({_id: teacher._id})
	.populate('students')
	.exec(function(err, teacher){

		var userFullName = teacher.fullName;
		var students = teacher.students;

		students.forEach(function(student){
    		student.student_id = String(student._id);
    	});

		models.Phase.find({}, function(err, phases){

			phases.forEach(function(phase) {
				phase.phase_id = String(phase._id);
    		});
		
			response.render('students', {
				page: 'students',
				teacher: userFullName,
				students: students,
				phases: phases
			});
		});
	});
}

function getElementIndex(array, idElement){
	var FoundException = {};
	var indexGlobal = -1;

	try{
		array.forEach(function(id, index){
			if (item._id == idElement){
				indexGlobal = index;
				throw FoundException;
			}
		});
	} catch(e){
	}

	return indexGlobal;
}

TeacherController.prototype.deleteStudentById = function deleteStudentById(request, response, teacher){
	var _id = mongoose.Types.ObjectId(request._id);
	var phase_id = mongoose.Types.ObjectId(request.phaseId);
	var teacher_id = mongoose.Types.ObjectId(teacher._id);
	var index = -1;

	models.Teacher.find({_id: teacher_id})
	.populate('students')
	.exec(function(err, teachers){
		var teacher = teachers[0];
		index = getElementIndex(teacher.students, _id);
		teacher.students.splice(index, 1);
		teacher.save(function(err, teacher){
			models.Phase.find({ _id: phase_id })
			.populate('studentsIn')
			.exec(function(err, phases){
				var phase = phases[0];
				index = getElementIndex(phase.studentsIn, _id);
				phase.studentsIn.splice(index, 1);
				phase.save(function(err, phase){
					models.Student.findOneAndRemove({_id: _id}, function(err){
						response.redirect('students');
					});
				});
			})
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

	models.Student.find({_id: request.studentId})
	.populate('_phase')
	.exec(function(err, students){
		var student = students[0];
		response.json({phaseId: student._phase._id, phaseName: student._phase.phaseName});
	});
}

PhaseController.prototype.createOrUpdateQuestion = function createOrUpdateQuestion(request, response){
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