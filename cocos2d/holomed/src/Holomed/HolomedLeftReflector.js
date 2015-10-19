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
// HolomedLeftReflector
//
// Es el codigo base que va a procesar lo que reciba el monitor 
// y correrlo.
//
//------------------------------------------------------------------
var HolomedLeftReflector = HolomedBaseLayer.extend({
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

var socket = io.connect('http://127.0.0.1:3000');

//------------------------------------------------------------------
//
// HolomedLeftAnimationLayer:
// 
// Es aqui donde se hara la logica de mostrar lo que viene del servidor
// recibiendo las ordenes y las coordenadas para los eventos respectivos
//
//------------------------------------------------------------------
var rotateSprite = false;

var HolomedLeftAnimationLayer = HolomedLeftReflector.extend({

    _title:"",
    _num: 0,
    ctor: function (){
    	this._super();
    	totalAnimFrames = totalLeftAnimFrames;
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


var HolomedLeftScene = HolomedScene.extend({
    runScene:function (num) {
   	    var layer = new HolomedLeftAnimationLayer();
        this.addChild(layer);

        director.runScene(this);
    }
});