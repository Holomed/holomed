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
// HolomedRightReflector
//
// Es el codigo base que va a procesar lo que reciba el monitor 
// y correrlo.
//
//------------------------------------------------------------------
var HolomedRightReflector = HolomedBaseLayer.extend({
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
// HolomedRightAnimationLayer:
// 
// Es aqui donde se hara la logica de mostrar lo que viene del servidor
// recibiendo las ordenes y las coordenadas para los eventos respectivos
//
//------------------------------------------------------------------

var HolomedRightAnimationLayer = HolomedRightReflector.extend({

    _title:"",
    _num: 0,
    onEnter:function () {
        this._super();

        var texture = cc.textureCache.addImage(s_baby_rotation);

		var frame0 = new cc.SpriteFrame(texture, cc.rect(4680, 0, 353, 279));
        var frame1 = new cc.SpriteFrame(texture, cc.rect(5254, 0, 353, 279));
        var frame2 = new cc.SpriteFrame(texture, cc.rect(5799, 0, 353, 279));
        var frame3 = new cc.SpriteFrame(texture, cc.rect(159, 0, 353, 279));
        var frame4 = new cc.SpriteFrame(texture, cc.rect(656, 0, 353, 279));
        var frame5 = new cc.SpriteFrame(texture, cc.rect(1141, 0, 353, 279));
        var frame6 = new cc.SpriteFrame(texture, cc.rect(1606, 0, 353, 279));
        var frame7 = new cc.SpriteFrame(texture, cc.rect(2094, 0, 353, 279));
        var frame8 = new cc.SpriteFrame(texture, cc.rect(2585, 0, 353, 279));
        var frame9 = new cc.SpriteFrame(texture, cc.rect(3068, 0, 353, 279));
        var frame10 = new cc.SpriteFrame(texture, cc.rect(3568, 0, 353, 279));
        var frame11 = new cc.SpriteFrame(texture, cc.rect(4099, 0, 353, 279));

        var sprite = new cc.Sprite(frame0);
        //this.sprite = new cc.Sprite.create(cc.loader.getRes("res/Images/prototipo-2/fly0000.png"));
        sprite.x = winSize.width / 2;
        sprite.y = winSize.height / 2;

        this.addChild(sprite);

        // Llenar el arreglo afuera 
        var animFrames = [];
        animFrames.push(frame0);
        animFrames.push(frame1);
        animFrames.push(frame2);
        animFrames.push(frame3);
        animFrames.push(frame4);
        animFrames.push(frame5); 
        animFrames.push(frame6); 
        animFrames.push(frame7); 
        animFrames.push(frame8);
        animFrames.push(frame9);
        animFrames.push(frame10);
        animFrames.push(frame11);

        var animation = new cc.Animation(animFrames, 0.2);
        var animate = cc.animate(animation);
        var delay = cc.delayTime(0);
        var seq = cc.sequence(animate,
            cc.flipX(false),
            animate.clone(),
            delay);

        
        var moving = false;

        this._listener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "move_sprite_event",
            callback: function(event){
            	if (!moving){
                	sprite.runAction(seq.repeatForever());
                }
                else{
                	sprite.stopAllActions();
                }
                moving = !moving;

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
    onExit:function () {
        this._super();
    },
});


var HolomedRightScene = HolomedScene.extend({
    runScene:function (num) {
        var layer = new HolomedRightAnimationLayer();
        this.addChild(layer);

        director.runScene(this);
    }
});