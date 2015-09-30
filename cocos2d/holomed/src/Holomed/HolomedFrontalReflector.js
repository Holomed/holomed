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

var socket = io.connect('http://127.0.0.1:3000');

//------------------------------------------------------------------
//
// HolomedFrontalAnimationLayer:
// 
// Es aqui donde se hara la logica de mostrar lo que viene del servidor
// recibiendo las ordenes y las coordenadas para los eventos respectivos
//
//------------------------------------------------------------------

phaseList = [];
totalAnimFrames = [];

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

function getPhaseNumber(phaseList){
	for (var i = 0; i < phaseList.length; i++){
		if (phaseList[i] == 0){
			return i;
		}
	}
	return phaseList.length + 1;
}

function getPhase(phaseList, type){
	for (var i = 0; i < phaseList.length; i++){
		if (phaseList[i] == 0){
			return totalAnimFrames[i];
		}
	}
	return null;
}

function loadUserPhase(phaseList){
	var init = getPhaseNumber(phaseList);
	var listSpritesheetNames = s_phases_frontal.split(",");
	for (var i = init; i < phaseList.length; i++){
		var frameList = this.initTextureCache(listSpritesheetNames[i]);
		totalAnimFrames.push(frameList);
	}

}

function checkEndedPhase(phaseList){
	for (var i = 0; i < phaseList.length; i++){
		if (phaseList[i] == 0){
			phaseList[i] = 1;
			break;
		}
	}
	return phaseList;
}

function runAnimation(sprite, phaseList){
	var animFrames = getPhase(phaseList);
        
	//var animation = new cc.Animation(this._animFrames, 0.2); Para las rotaciones
    var animation = new cc.Animation(animFrames, 0.05);
    var animate = cc.animate(animation);
    var delay = cc.delayTime(0);
    var seq = cc.sequence(animate,
        cc.flipX(false),
        //animate.clone(),
        delay);

	console.log(phaseList);
	sprite.runAction(seq);
}

var rotateSprite = false;

var HolomedFrontalAnimationLayer = HolomedFrontalReflector.extend({

    _title:"",
    _num: 0,
    ctor: function (){
    	this._super();
    	phaseList = [0,0,0,0,0,0,0,0];
    	loadUserPhase(phaseList);
    },
    onEnter:function () {
        this._super();
        var animFrames = getPhase(phaseList);
        
		var sprite = new cc.Sprite(animFrames[0]);

	    sprite.x = winSize.width / 2;
	    sprite.y = winSize.height / 2;

	    this.addChild(sprite);

	    responsiveVoice.speak("Instrucciones Generales", 
            		"Spanish Female");

	    
        this._listener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "move_sprite_event",
            callback: function(event){

            	responsiveVoice.speak("Contenido de la lección "+ parseInt(getPhaseNumber(phaseList) + 1) +" de la Base de Datos.", 
            		"Spanish Female", {onend: function(){

            			runAnimation(sprite, phaseList);
            			phaseList = checkEndedPhase(phaseList); //Esta es la linea del cambio de fase
		            	
            		}});
    
                return true;
            }
        });
        cc.eventManager.addListener(this._listener, 1);

        this._listener2 = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "testeando",
            callback: function(event){

            	console.log("rotacion");
            	testing = false;
    
                return true;
            }
        });
        cc.eventManager.addListener(this._listener2, 1);

        //var testing = false;

        socket.on('ni-message', function (data) {
        	var userEvent = null;

        	if (data == 'getContent'){
        		userEvent = new cc.EventCustom("move_sprite_event");
        	}

        	cc.eventManager.dispatchEvent(userEvent);
        /*	if (!testing){
        		testing = true;
		    	var event = new cc.EventCustom("move_sprite_event");
		    	cc.eventManager.dispatchEvent(event);
		    } else {
		    	var event = new cc.EventCustom("testeando");
		    	cc.eventManager.dispatchEvent(event);
		    }*/
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
