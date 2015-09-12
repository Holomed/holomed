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

var socket = io.connect('http://127.0.0.1:3000');

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

        var texture = cc.textureCache.addImage(s_baby_rotation);

        var frame0 = new cc.SpriteFrame(texture, cc.rect(159, 0, 353, 279));
        var frame1 = new cc.SpriteFrame(texture, cc.rect(656, 0, 353, 279));
        var frame2 = new cc.SpriteFrame(texture, cc.rect(1141, 0, 353, 279));
        var frame3 = new cc.SpriteFrame(texture, cc.rect(1606, 0, 353, 279));
        var frame4 = new cc.SpriteFrame(texture, cc.rect(2094, 0, 353, 279));
        var frame5 = new cc.SpriteFrame(texture, cc.rect(2585, 0, 353, 279));
        var frame6 = new cc.SpriteFrame(texture, cc.rect(3068, 0, 353, 279));
        var frame7 = new cc.SpriteFrame(texture, cc.rect(3568, 0, 353, 279));
        var frame8 = new cc.SpriteFrame(texture, cc.rect(4099, 0, 353, 279));
        var frame9 = new cc.SpriteFrame(texture, cc.rect(4680, 0, 353, 279));
        var frame10 = new cc.SpriteFrame(texture, cc.rect(5254, 0, 353, 279));
        var frame11 = new cc.SpriteFrame(texture, cc.rect(5799, 0, 353, 279));

        console.log(winSize.width);
        console.log(winSize.height);

        var spriteFrontal = new cc.Sprite(frame0);
        //this.sprite = new cc.Sprite.create(cc.loader.getRes("res/Images/prototipo-2/fly0000.png"));
        spriteFrontal.x = winSize.width / 2;
        spriteFrontal.y = (winSize.height / 2) + (winSize.height / 4) - 20;
        spriteFrontal.setScale(0.7);
        spriteFrontal.setRotation(180);


        var spriteLeft = new cc.Sprite(frame9);
        spriteLeft.x = (winSize.width / 2) - (winSize.width / 4) - 45;
        spriteLeft.y = winSize.height / 2 - 65;
        spriteLeft.setScale(0.7);
        spriteLeft.setRotation(90);
        
        var spriteRight = new cc.Sprite(frame3);
        spriteRight.x = (winSize.width / 2) + (winSize.width / 4) + 45; 
        spriteRight.y = winSize.height / 2 - 65;
        spriteRight.setScale(0.7);
        spriteRight.setRotation(270);

        this.addChild(spriteFrontal);
        this.addChild(spriteRight);
        this.addChild(spriteLeft);

        var delay = cc.delayTime(0);

        // Llenar el arreglo afuera 
        var animFramesFrontal = [];
        animFramesFrontal.push(frame0);
        animFramesFrontal.push(frame1);
        animFramesFrontal.push(frame2);
        animFramesFrontal.push(frame3);
        animFramesFrontal.push(frame4);
        animFramesFrontal.push(frame5); 
        animFramesFrontal.push(frame6); 
        animFramesFrontal.push(frame7); 
        animFramesFrontal.push(frame8);
        animFramesFrontal.push(frame9);
        animFramesFrontal.push(frame10);
        animFramesFrontal.push(frame11);

        var animationFrontal = new cc.Animation(animFramesFrontal, 0.2);
        var animateFrontal = cc.animate(animationFrontal);
        var seqFrontal = cc.sequence(animateFrontal,
            cc.flipX(false),
            animateFrontal.clone(),
            delay);


        var animFramesLeft = [];
        animFramesLeft.push(frame9);
        animFramesLeft.push(frame10);
        animFramesLeft.push(frame11);
        animFramesLeft.push(frame0);
        animFramesLeft.push(frame1);
        animFramesLeft.push(frame2); 
        animFramesLeft.push(frame3); 
        animFramesLeft.push(frame4); 
        animFramesLeft.push(frame5);
        animFramesLeft.push(frame6);
        animFramesLeft.push(frame7);
        animFramesLeft.push(frame8);

        var animationRight = new cc.Animation(animFramesLeft, 0.2);
        var animateRight = cc.animate(animationRight);
        var seqRight = cc.sequence(animateRight,
            cc.flipX(false),
            animateRight.clone(),
            delay);


        var animFramesRight = [];
        animFramesRight.push(frame3);
        animFramesRight.push(frame4);
        animFramesRight.push(frame5);
        animFramesRight.push(frame6);
        animFramesRight.push(frame7);
        animFramesRight.push(frame8); 
        animFramesRight.push(frame9); 
        animFramesRight.push(frame10); 
        animFramesRight.push(frame11);
        animFramesRight.push(frame0);
        animFramesRight.push(frame1);
        animFramesRight.push(frame2);

        var animationLeft = new cc.Animation(animFramesLeft, 0.2);
        var animateLeft = cc.animate(animationLeft);
        var seqLeft = cc.sequence(animateLeft,
            cc.flipX(false),
            animateLeft.clone(),
            delay);

        //this.sprite.runAction(seq.repeatForever());
        
        var moving = false;

        this._listener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "move_sprite_event",
            callback: function(event){
            	if (!moving){
                	spriteFrontal.runAction(seqFrontal.repeatForever());
                	spriteRight.runAction(seqRight.repeatForever());
                	spriteLeft.runAction(seqLeft.repeatForever());
                }
                else{
                	spriteFrontal.stopAllActions();
                	spriteRight.stopAllActions();
                	spriteLeft.stopAllActions();
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


var HolomedAllScene = HolomedScene.extend({
    runScene:function (num) {
   	    var layer = new HolomedAllAnimationLayer();
        this.addChild(layer);

        director.runScene(this);
    }
});
