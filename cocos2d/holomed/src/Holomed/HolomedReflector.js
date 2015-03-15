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
// HolomedReflector
//
// Es el codigo base que va a procesar lo que reciba el monitor 
// y correrlo.
//
//------------------------------------------------------------------
var HolomedReflector = HolomedBaseLayer.extend({
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
// HolomedAnimationLayer:
// 
// Es aqui donde se hara la logica de mostrar lo que viene del servidor
// recibiendo las ordenes y las coordenadas para los eventos respectivos
//
//------------------------------------------------------------------
var HolomedAnimationLayer = HolomedReflector.extend({

    _title:"",
    onEnter:function () {
        //----start10----ctor
        this._super();
        var texture = cc.textureCache.addImage(s_dragon_animation);

        // manually add frames to the frame cache
        var frame0 = new cc.SpriteFrame(texture, cc.rect(132 * 0, 132 * 0, 132, 132));
        var frame1 = new cc.SpriteFrame(texture, cc.rect(132 * 1, 132 * 0, 132, 132));
        var frame2 = new cc.SpriteFrame(texture, cc.rect(132 * 2, 132 * 0, 132, 132));
        var frame3 = new cc.SpriteFrame(texture, cc.rect(132 * 3, 132 * 0, 132, 132));
        var frame4 = new cc.SpriteFrame(texture, cc.rect(132 * 0, 132 * 1, 132, 132));
        var frame5 = new cc.SpriteFrame(texture, cc.rect(132 * 1, 132 * 1, 132, 132));

        //
        // Animation using Sprite BatchNode
        //
        var sprite1 = new cc.Sprite(frame0);
        sprite1.x = winSize.width / 2;
        sprite1.y = winSize.height / 2;
        this.addChild(sprite1);


        // Llenar el arreglo afuera 
        var animFrames = [];
        animFrames.push(frame0);
        animFrames.push(frame1);
        animFrames.push(frame2);
        animFrames.push(frame3);
        animFrames.push(frame4);
        animFrames.push(frame5); 

        var animation = new cc.Animation(animFrames, 0.2);
        var animate = cc.animate(animation);
        var delay = cc.delayTime(0.5);
        var seq = cc.sequence(animate,
            cc.flipX(false),
            animate.clone(),
            delay);

        //sprite.runAction(seq.repeatForever());*/
        //----end10----
        var moving = false;

        this._listener1 = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "move_sprite_event",
            callback: function(event){
                if (!moving){
                	sprite1.runAction(seq.repeatForever());
                }
                else{
                	sprite1.stopAllActions();
                }
                moving = !moving;

                return true;
            }
        });
        cc.eventManager.addListener(this._listener1, 1);

        socket.on('update', function (data) {
		    console.log("Recibio Data: " + data);
		    var event = new cc.EventCustom("move_sprite_event");
		    cc.eventManager.dispatchEvent(event);
		    console.log("Disparo Evento");
		});

        // Listener tocando el sprite
        /*var listener1 = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
            	if (!moving){
                	sprite1.runAction(seq.repeatForever());
                }
                else{
                	sprite1.stopAllActions();
                }
                moving = !moving;

                return true;
            },
            onTouchEnded: function (touch, event) {
            }
        });
        this.setUserObject(listener1);

        cc.eventManager.addListener(listener1, sprite1);*/
    },
    onExit:function () {
        this._super();
    },
});


var HolomedScene = TestScene.extend({
    runThisTest:function (num) {
        holomedIdx = (num || num == 0) ? (num - 1) : -1;
        var layer = nextHolomedScene();
        this.addChild(layer);

        director.runScene(this);
    }
});

//
// Flow control
//
var arrayOfHolomed = [
    HolomedAnimationLayer
];


/* Conservar para configuraciones sobre el entorno
donde se vaya a trabajar */
var nextHolomedScene = function () {
    holomedIdx++;
    holomedIdx = holomedIdx % arrayOfHolomed.length;

    if(window.sideIndexBar){
        holomedIdx = window.sideIndexBar.changeTest(holomedIdx, 36);
    }

    return new arrayOfHolomed[holomedIdx ]();
};
var previousHolomedScene = function () {
    holomedIdx--;
    if (holomedIdx < 0)
        holomedIdx += arrayOfHolomed.length;

    if(window.sideIndexBar){
        holomedIdx = window.sideIndexBar.changeTest(holomedIdx, 36);
    }

    return new arrayOfHolomed[holomedIdx ]();
};
var restartHolomedScene = function () {
    return new arrayOfHolomed[holomedIdx ]();
};

