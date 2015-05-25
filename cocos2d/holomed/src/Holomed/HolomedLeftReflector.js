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

    onRestartCallback:function (sender) {
        var s = new HolomedScene();
        s.addChild(restartHolomedScene());
        director.runScene(s);
    },

    onNextCallback:function (sender) {
        var s = new HolomedScene();
        s.addChild(nextHolomedScene());
        director.runScene(s);
    },

    onBackCallback:function (sender) {
        var s = new HolomedScene();
        s.addChild(previousHolomedScene());
        director.runScene(s);
    },

    // automation
    numberOfPendingTests:function () {
        return ( (arrayOfHolomed.length - 1) - holomedIdx );
    },

    getTestNumber:function () {
        return holomedIdx;
    }
});

var socket = io.connect('http://localhost:3000');

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
    onEnter:function () {
        this._super();

        this.sprite = new cc.Sprite.create("res/Images/prototipo-1/fly0000");
        this.sprite.x = winSize.width / 2;
        this.sprite.y = winSize.height / 2;

        this.addChild(this.sprite);
        

        this._listener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "move_sprite_event",
            callback: function(event){
                rotateSprite = !rotateSprite;
                return true;
            }
        });
        cc.eventManager.addListener(this._listener, 1);

        socket.on('update', function (data) {
		    var event = new cc.EventCustom("move_sprite_event");
		    cc.eventManager.dispatchEvent(event);
		});

		this.scheduleUpdate();

        return true;
    },
    update:function (dt) {
    	if (rotateSprite == true){
    		this._num++;
    		var spriteName = "res/Images/prototipo-1/fly";

    		if (this._num < 10){
    			spriteName += "000" + this._num;
    		} else if (this._num < 100) {
    			spriteName += "00" + this._num;
    		} else if ((this._num >= 100) && (this._num <= 361)) {
    			spriteName += "0" + this._num;
    		} else if (this._num > 361) {
    			spriteName += "0000"
    			this._num = 0;
    		}

    		this.sprite.initWithFile(spriteName);
    	}
       
    },
    onExit:function () {
        this._super();
    },
});


var HolomedLeftScene = TestScene.extend({
    runThisTest:function (num) {
        holomedIdx = (num || num == 0) ? (num - 1) : -1;
        var layer = nextHolomedLeftScene();
        this.addChild(layer);

        director.runScene(this);
    }
});

//
// Flow control
//
var arrayOfHolomed = [
    HolomedLeftAnimationLayer
];


/* Conservar para configuraciones sobre el entorno
donde se vaya a trabajar */
var nextHolomedLeftScene = function () {
    holomedIdx++;
    holomedIdx = holomedIdx % arrayOfHolomed.length;

    if(window.sideIndexBar){
        holomedIdx = window.sideIndexBar.changeTest(holomedIdx, 36);
    }

    return new arrayOfHolomed[holomedIdx ]();
};
var previousHolomedLeftScene = function () {
    holomedIdx--;
    if (holomedIdx < 0)
        holomedIdx += arrayOfHolomed.length;

    if(window.sideIndexBar){
        holomedIdx = window.sideIndexBar.changeTest(holomedIdx, 36);
    }

    return new arrayOfHolomed[holomedIdx ]();
};
var restartHolomedLeftScene = function () {
    return new arrayOfHolomed[holomedIdx ]();
};

