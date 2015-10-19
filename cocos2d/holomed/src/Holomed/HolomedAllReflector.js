/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
var holomedIdx = -1;

var spriteFrameCache = cc.spriteFrameCache;


//------------------------------------------------------------------
//
// HolomedAllReflector
//
// Es el codigo base que va a procesar lo que reciba el monitor con
// todas las caras y correrlo.
//
//------------------------------------------------------------------
var HolomedAllReflector = HolomedBaseLayer.extend({
    _title:"",
    _subtitle:"",

    ctor:function () {
        if (arguments.length === 0) {
            this._super(cc.color(0, 0, 0, 0), cc.color(0, 0, 0, 0));
        } else {
            this._super.apply(this, arguments);
        }

    },

});

userId = '';
userPoints = 0;
phaseList = [];
questionList = [];
totalFrontalAnimFrames = [];
totalLeftAnimFrames = [];
totalRightAnimFrames = [];

totalRotationAnimFrames = [];


var socket = io.connect('http://127.0.0.1:3000');
socket.on('load-database-data', function (data){
	console.log("recibio");
	userId = data.userId;
	phaseList = data.phaseList;
	questionList = data.questionList;
	loadUserPhaseAll(phaseList);
});

//------------------------------------------------------------------
//
// HolomedFrontalAnimationLayer:
// 
// Es aqui donde se hara la logica de mostrar lo que viene del servidor
// recibiendo las ordenes y las coordenadas para los eventos respectivos
//
//------------------------------------------------------------------

function initTextureCache(resourceDir){
	var resourceDirSplited = resourceDir.split("/");
	var resourceName = resourceDirSplited[resourceDirSplited.length-1];
	var phaseNumber = resourceName.split("_")[1];

	var texture = cc.textureCache.addImage(resourceDir);
	var width = 512;
	var height = 300;
	var frameList = [];
	var xPos = 0;
	var yPos = 0;

	if (phaseNumber < 8){
		for (var i = 0; i < 4; i++){
			if (i < 3){
				for (var j = 0; j < 13; j++){
					frameList.push(new cc.SpriteFrame(texture, cc.rect(xPos, yPos, width, height)));
					xPos += width;
				}
			} else {
				frameList.push(new cc.SpriteFrame(texture, cc.rect(xPos, yPos, width, height)));
			}
			xPos = 0;
			yPos += height;
		}
	} else {
		frameList.push(new cc.SpriteFrame(texture, cc.rect(xPos, yPos, width, height)));
	}

	return frameList;
}

function getPhaseData(phaseList){
	for (var i = 0; i < phaseList.length; i++){
		if (phaseList[i].status < 2){
			return {phaseNumber: i, frontalAnimFrames: totalFrontalAnimFrames[i], 
				leftAnimFrames: totalLeftAnimFrames[i],
				rightAnimFrames: totalRightAnimFrames[i],
				animFramesRotation: totalRotationAnimFrames[i]};
		}
	}

	return null;
}

function getQuestion(actualPhase){
	var phaseQuestions = questionList[actualPhase];
	for (var i=0; i < phaseQuestions.length; i++){
		if (phaseQuestions[i].made == false){
			return {questionNumber: i, question: phaseQuestions[i]};
		}
	}
	return null;
}


function loadUserPhaseAll(phaseList){
	var init = (getPhaseData(phaseList)).phaseNumber;
	console.log("init: "+init);
	var listSpritesheetFrontalNames = s_phases_frontal.split(",");
	var listSpritesheetLeftNames = s_phases_left.split(",");
	var listSpritesheetRightNames = s_phases_right.split(",");
	var listSpritesheetRotationNames = s_phases_frontal_rotations.split(",");
	for (var i = init; i < phaseList.length; i++){
		var frameList = this.initTextureCache(listSpritesheetFrontalNames[i]);
		totalFrontalAnimFrames.push(frameList);
		frameList = this.initTextureCache(listSpritesheetLeftNames[i]);
		totalLeftAnimFrames.push(frameList);
		frameList = this.initTextureCache(listSpritesheetRightNames[i]);
		totalRightAnimFrames.push(frameList);
		// Cambiar cuando se tengan todas las rotaciones
		if (i == 0){
			console.log("Entro");
			var frameListRotation = this.initTextureCache(listSpritesheetRotationNames[i]);
			totalRotationAnimFrames.push(frameListRotation);
		}
	}
}

function checkEndedPhase(phaseList){
	for (var i = 0; i < phaseList.length; i++){
		if (phaseList[i].status == 0){
			phaseList[i].status = 1;
			break;
		}
	}
	return phaseList;
}

function checkQuestionsOver(phaseList){
	for (var i = 0; i < phaseList.length; i++){
		if (phaseList[i].status == 1){
			phaseList[i].status = 2;
			break;
		}
	}

	return phaseList;	
}

function checkLessonOver(phaseList){
	for (var i = 0; i < phaseList.length; i++){
		if (phaseList[i].status < 2){
			return false;
		}
	}
	return true;		
}

function runAllAnimation(spriteFront, spriteLeft, spriteRight, phaseList){
	
	var actualPhase = getPhaseData(phaseList);
	
	var frontalAnimFrames = actualPhase.frontalAnimFrames;
	var leftAnimFrames = actualPhase.leftAnimFrames;
	var rightAnimFrames = actualPhase.rightAnimFrames;

	var animFramesRotation = actualPhase.animFramesRotation;
        
    var frontalAnimation = new cc.Animation(frontalAnimFrames, 0.05);
    var animateFrontal = cc.animate(frontalAnimation);

    var leftAnimation = new cc.Animation(leftAnimFrames, 0.05);
    var animateLeft = cc.animate(leftAnimation);

    var rightAnimation = new cc.Animation(rightAnimFrames, 0.05);
    var animateRight = cc.animate(rightAnimation);

    /*var animationRotate = new cc.Animation(animFramesRotation, 0.1);
    var animateRotate = cc.animate(animationRotate);
*/
    var delay = cc.delayTime(0);
    var seqFrontal = cc.sequence(animateFrontal,
        cc.flipX(false),
        //animateRotate,
        delay);

    var seqLeft = cc.sequence(animateLeft,
        cc.flipX(false),
        //animateRotate,
        delay);

	var seqRight = cc.sequence(animateRight,
        cc.flipX(false),
        //animateRotate,
        delay);    
	console.log(seqFrontal);
	spriteFront.runAction(seqFrontal.repeatForever());
	spriteLeft.runAction(seqLeft.repeatForever());
	spriteRight.runAction(seqRight.repeatForever());
}

function stopAllAnimation(spriteFront, spriteLeft, spriteRight){
	spriteFront.stopAllActions();
	spriteLeft.stopAllActions();
	spriteRight.stopAllActions();
}

//------------------------------------------------------------------
//
// HolomedAllAnimationLayer:
// 
// Es aqui donde se hara la logica de mostrar lo que viene del servidor
// recibiendo las ordenes y las coordenadas para los eventos respectivos
//
//------------------------------------------------------------------

var HolomedAllAnimationLayer = HolomedAllReflector.extend({

    _title:"",
    _num: 0,
    onEnter:function () {
        this._super();

        var phase = getPhaseData(phaseList);
        console.log(phase);
        var frontalAnimFrames = phase.frontalAnimFrames;
        var leftAnimFrames = phase.leftAnimFrames;
        var rightAnimFrames = phase.rightAnimFrames;
        console.log(frontalAnimFrames);


        console.log(winSize.width);
        console.log(winSize.height);

        var spriteFrontal = new cc.Sprite(frontalAnimFrames[0]);
        
        spriteFrontal.x = winSize.width / 2;
        spriteFrontal.y = (winSize.height / 2) + (winSize.height / 4) - 20;
        spriteFrontal.setScale(0.7);
        spriteFrontal.setRotation(180);


        var spriteRight = new cc.Sprite(rightAnimFrames[0]);
        spriteRight.x = (winSize.width / 2) - (winSize.width / 4) - 45;
        spriteRight.y = winSize.height / 2 - 65;
        spriteRight.setScale(0.7);
        spriteRight.setRotation(90);
        
        var spriteLeft = new cc.Sprite(leftAnimFrames[0]);
        spriteLeft.x = (winSize.width / 2) + (winSize.width / 4) + 45; 
        spriteLeft.y = winSize.height / 2 - 65;
        spriteLeft.setScale(0.7);
        spriteLeft.setRotation(270);

        this.addChild(spriteFrontal);
        this.addChild(spriteRight);
        this.addChild(spriteLeft);
      
        responsiveVoice.speak(s_instruction_message, 
            		"Spanish Female");

	    
        this._listenerExplanation = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "move_sprite_event",
            callback: function(event){
            	if (!checkLessonOver(phaseList)){
            		runAllAnimation(spriteFrontal, spriteLeft, spriteRight, phaseList);
	            	responsiveVoice.speak(phaseList[getPhase(phaseList).phaseNumber].description,
	            		"Spanish Female", {onend: function(){
	            			stopAllAnimation(spriteFrontal, spriteLeft, spriteRight);
	            			phaseList = checkEndedPhase(phaseList); //Esta es la linea del cambio de fase
	            			responsiveVoice.speak("Levante la mano izquierda si desea repetir el movimiento, sino, levante la mano derecha", "Spanish Female");
	            		}});
            	} else {
            		socket.emit('addPoints', {userId: userId, points: userPoints});
            		responsiveVoice.speak("Fin de la lección. Gracias por usar Holomed", 
            			"Spanish Female");
            	}
    
                return true;
            }
        });
        cc.eventManager.addListener(this._listenerExplanation, 1);

        this._listenerQuestions = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "moving_to_question",
            callback: function(event){
            	var actualPhase = (getPhase(phaseList)).phaseNumber;
            	var questionObject = getQuestion(actualPhase);
            	if (questionObject){ 
            		responsiveVoice.speak("Fase de Preguntas", 
            			"Spanish Female", {onend: function(){
            				responsiveVoice.speak("Pregunta "+ parseInt(questionObject.questionNumber + 1) +": " + questionObject.question.text, 
            					"Spanish Female");
							
            				//TODO: Notificar que los eventos siguientes son puras opciones
            			}});
            	} else {
            		socket.emit('userPhase', {userPhase: actualPhase});
            		responsiveVoice.speak("No tiene ninguna pregunta para esta fase", 
            			"Spanish Female", {onend: function(){
            				phaseList = checkQuestionsOver(phaseList); //Esta es la linea del fin de preguntas
            			}});
            	}
            	
    
                return true;
            }
        });
        cc.eventManager.addListener(this._listenerQuestions, 1);

        this._listenerOptions = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "answer_question",
            callback: function(event){
            	var userOption = event.getUserData();

				var actualPhase = (getPhase(phaseList)).phaseNumber;
            	var questionObject = getQuestion(actualPhase);
            	var answer = 'Incorrecto';

            	if (questionObject.question.answer == userOption){
            		answer = 'Correcto';
            		userPoints += questionObject.question.points;
            	}


            	responsiveVoice.speak(answer, 
            			"Spanish Female", {onend: function(){
            				questionObject.question.made = true;
            				var newQuestionObject = getQuestion(actualPhase);
            				if (newQuestionObject){
            					responsiveVoice.speak("Pregunta "+ parseInt(newQuestionObject.questionNumber + 1) +": " + newQuestionObject.question.text, 
            						"Spanish Female");
            				} else {
            					socket.emit('userPhase', {userPhase: actualPhase});
            					responsiveVoice.speak("Fin de las preguntas.\
            						Por favor levante la mano derecha para continuar con la siguiente fase",
            						"Spanish Female", {onend: function(){
            						phaseList = checkQuestionsOver(phaseList); //Esta es la linea del fin de preguntas
            					}});
            				}}});


            	//TODO: Enviar suma
    
                return true;
            }
        });
        cc.eventManager.addListener(this._listenerOptions, 1);

        //var testing = false;

        socket.on('ni-message', function (data) {
        	var userEvent = null;
        	var userData = JSON.parse(data);
        	console.log(userData);

        	if (userData.name == 'getContent'){
        		userEvent = new cc.EventCustom("move_sprite_event");
        	} else if (userData.name == 'goQuestions'){
        		userEvent = new cc.EventCustom("moving_to_question");
        	} else if (userData.name == 'options'){
        		userEvent = new cc.EventCustom("answer_question");
        		userEvent.setUserData(userData.extra);
        	}

        	cc.eventManager.dispatchEvent(userEvent);
		});

		this.scheduleUpdate();

        return true;
    },
    onExit:function () {
        this._super();
    },
});


var HolomedAllScene = HolomedScene.extend({
    runScene:function (num) {
   	    var layer = new HolomedAllAnimationLayer();
        this.addChild(layer);

        director.runScene(this);
    }
});
