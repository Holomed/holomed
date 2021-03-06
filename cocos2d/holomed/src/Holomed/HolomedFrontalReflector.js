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
// HolomedFrontalReflector
//
// Es el codigo base que va a procesar lo que reciba el monitor 
// y correrlo.
//
//------------------------------------------------------------------
var HolomedFrontalReflector = HolomedBaseLayer.extend({
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
phaseList = [];
questionList = [];
totalAnimFrames = [];
totalRotationAnimFrames = [];


var socket = io.connect('http://127.0.0.1:3000');

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

function getPhase(phaseList){
	console.log(phaseList);
	for (var i = 0; i < phaseList.length; i++){
		if (phaseList[i].status < 2){
			return {phaseNumber: i, animFrames: totalAnimFrames[i], 
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


function loadUserPhase(phaseList){
	var init = phaseList[0].phaseNumber;
	var listSpritesheetNames = s_phases_frontal.split(",");
	var listSpritesheetRotationNames = s_phases_frontal_rotations.split(",");
	for (var i = init; i < (init + phaseList.length); i++){
		var frameList = this.initTextureCache(listSpritesheetNames[i]);
		totalAnimFrames.push(frameList);
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

function runAnimation(sprite, phaseList){
	var actualPhase = getPhase(phaseList);
	var animFrames = actualPhase.animFrames;
	var animFramesRotation = actualPhase.animFramesRotation;
        
    var animation = new cc.Animation(animFrames, 0.05);
    var animate = cc.animate(animation);

    var animationRotate = new cc.Animation(animFramesRotation, 0.1);
    var animateRotate = cc.animate(animationRotate);

    var delay = cc.delayTime(0);
    var seq = cc.sequence(animate,
        cc.flipX(false),
 //       animateRotate,
        delay);

    console.log(seq);

	sprite.runAction(seq);
}

var HolomedFrontalAnimationLayer = HolomedFrontalReflector.extend({

    _title:"",
    _num: 0,
    ctor: function (){
    	this._super();
    	totalAnimFrames = totalFrontalAnimFrames;
    },
    onEnter:function () {
        this._super();
        var animFrames = (getPhase(phaseList)).animFrames;
        
		var sprite = new cc.Sprite(animFrames[0]);

	    sprite.x = winSize.width / 2;
	    sprite.y = winSize.height / 2;

	    this.addChild(sprite);
    
        this._listenerExplanation = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "move_sprite_event",
            callback: function(event){
            	if (!checkLessonOver(phaseList)){
					runAnimation(sprite, phaseList);
	            	phaseList = checkEndedPhase(phaseList); //Esta es la linea del cambio de fase
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
            	if (!questionObject){ 
            		phaseList = checkQuestionsOver(phaseList); //Esta es la linea del fin de preguntas
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
            	}

            	questionObject.question.made = true;
            	var newQuestionObject = getQuestion(actualPhase);
            	if (!newQuestionObject){
            		phaseList = checkQuestionsOver(phaseList); //Esta es la linea del fin de preguntas
            	}
    
                return true;
            }
        });
        cc.eventManager.addListener(this._listenerOptions, 1);

        //var testing = false;

        socket.on('ni-message', function (data) {
        	var userEvent = null;
        	var userData = JSON.parse(data);

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


var HolomedFrontalScene = HolomedScene.extend({
    runScene:function (num) {
   	    var layer = new HolomedFrontalAnimationLayer();
        this.addChild(layer);

        director.runScene(this);
    }
});
