var FLUID_DENSITY = 0.00014;
var FLUID_DRAG = 2.0;

var Game = cc.Layer.extend({
    isMouseDown: false,
    world: null,
    screenSize: null,
    lazyLayer: null,
    groundSize: null,
    birdbody: null,
    tubeArray: null,
    birdSize: null,
    birdSprite:null,
    birdPicName:null,
    drawArray: null, /******   tempDraw  code ******/
    birdDraw: null, /******   tempDraw  code ******/
    space:null,
    init: function () {
        this._super();

        screenSize = cc.Director.getInstance().getWinSize();
        this.setTouchEnabled(true);

        lazyLayer = cc.Layer.create();
        this.addChild(lazyLayer);

        tubeArray = Array();
        drawArray = Array();
        /******   tempDraw  code ******/

        birdSize = cc.Sprite.create(s_Bird1).getContentSize();

        var bgsprite = cc.Sprite.create(s_bg);
        bgsprite.setPosition(screenSize.width / 2, screenSize.height / 2);
        lazyLayer.addChild(bgsprite, 0);

        for (var i = 0; i < 2; i++)
        {
            var groundsprite = cc.Sprite.create(s_Ground);
            groundSize = groundsprite.getContentSize();
            groundsprite.setPosition(screenSize.width / 2 + screenSize.width * i, groundSize.height / 2);
            lazyLayer.addChild(groundsprite, 0);

            var ｍoveToA = cc.MoveTo.create(s_groundSpeed * (i + 1), cc.p(-screenSize.width / 2, groundsprite.getPositionY()));

            var Action = cc.Sequence.create
            (
                ｍoveToA,
                cc.CallFunc.create(this.groundCallback, groundsprite,this)
            );
            groundsprite.runAction(Action);
        }

        birdDraw = cc.DrawNode.create();
        this.addChild( birdDraw, 1 );

        space = new cp.Space();
        this.initPhysics();
        this.scheduleUpdate();

        birdPicName = s_Bird1;
        birdSprite =  this.createPhysicsSprite( cc.p(screenSize.width / 5, screenSize.height / 1.2) ,this);
        this.addChild( birdSprite );


        this.schedule(this.createTube, s_createTubeTime);

        this.schedule(this.changeSpriteFrame, s_sparkSpeed);

        return true;
    },
    groundCallback: function (groundsprite,self)
    {
        groundsprite.setPosition(screenSize.width/2+screenSize.width-10, groundSize.height/2);

        var ｍoveToA = cc.MoveTo.create(s_groundSpeed*2,cc.p(-screenSize.width/2,groundsprite.getPositionY()));

        var Action = cc.Sequence.create(
            ｍoveToA,
            cc.CallFunc.create(self.groundCallback, groundsprite,self)
        );
        groundsprite.runAction(Action);
    },
    changeSpriteFrame:function()
    {
        if(birdPicName == s_Bird1)
        {
            birdPicName = s_Bird2;
        }
        else
        {
            birdPicName = s_Bird1;
        }

        var aSprite = cc.Sprite.create(birdPicName);
        birdSprite.setTexture(aSprite.getTexture());
    },
    createTube:function (dt)
    {
        var topSprite = cc.Sprite.create(s_PipeTop);
        topSprite.setAnchorPoint(1.0,1.0);
        topSprite.setPosition(screenSize.width, screenSize.height);
        lazyLayer.addChild(topSprite, 0);

        var topMoveToA = cc.MoveTo.create(s_tubeSpeed,cc.p(0,topSprite.getPositionY()));
        var topDraw = cc.DrawNode.create();
        var topAction = cc.Sequence.create(
            topMoveToA,
            cc.CallFunc.create(this.topCallback, topSprite,topDraw)
        );
        topSprite.runAction(topAction);
        tubeArray.push(topSprite);


        this.addChild( topDraw, 1 );
        var topBox = topSprite.getBoundingBox();
        var topPoints = [ cc.p(topBox.x,topBox.y), cc.p(topBox.x+topBox.width,topBox.y), cc.p(topBox.x+topBox.width,topBox.y+topBox.height), cc.p(topBox.x,topBox.y+topBox.height) ];
        topDraw.drawPoly(topPoints, cc.c4f(1,0,0,0.0), 1, cc.c4f(0,0,1,1) );
        drawArray.push(topDraw);




        var bottomSprite = cc.Sprite.create(s_PipeBottom);
        bottomSprite.setAnchorPoint(1.0,0.0);
        bottomSprite.setPosition(screenSize.width, groundSize.height);
        lazyLayer.addChild(bottomSprite, 0);

        var bottomMoveToA = cc.MoveTo.create(s_tubeSpeed,cc.p(0,bottomSprite.getPositionY()));
        var bottomDraw = cc.DrawNode.create();
        var bottomAction = cc.Sequence.create(
            bottomMoveToA,
            cc.CallFunc.create(this.bottomCallback, bottomSprite,bottomDraw)
        );

        bottomSprite.runAction(bottomAction);
        tubeArray.push(bottomSprite);
/*
        var topRandomNum = 1.2+Math.random();
        var topScaleByA = cc.ScaleBy.create(s_tubeSpeed,cc.p(0,topSprite.getPositionY()));
        var topScaleAction = cc.Sequence.create(
            topScaleToA,
            cc.CallFunc.create(this.topCallback, topSprite)
        );
        topSprite.runAction(topScaleAction);
*/


        this.addChild( bottomDraw, 1 );
        var bottomBox = topSprite.getBoundingBox();
        var bottompoints = [ cc.p(bottomBox.x,bottomBox.y), cc.p(bottomBox.x+bottomBox.width,bottomBox.y), cc.p(bottomBox.x+bottomBox.width,bottomBox.y+bottomBox.height), cc.p(bottomBox.x,bottomBox.y+bottomBox.height) ];
        bottomDraw.drawPoly(bottompoints, cc.c4f(1,0,0,0.0), 1, cc.c4f(0,0,1,1) );
        drawArray.push(bottomDraw);




        var boolNum = Math.floor(Math.random()*2);
        cc.log("boolNum="+boolNum);

        if(0==boolNum)
        {
            var topRandomNum = Math.floor(Math.random()*2)+2;

            if(3 == topRandomNum)
            {
                topSprite.setScaleY(2.5);
            }
            else
            {
                topSprite.setScaleY(topRandomNum);
            }
            cc.log("topRandomNum="+topRandomNum);

        }
        else
        {
            var bottomRandomNum = Math.floor(Math.random()*2)+2;
            if(3 == bottomRandomNum)
            {
                bottomSprite.setScaleY(2.5);
            }
            else
            {
                bottomSprite.setScaleY(bottomRandomNum);
            }
            cc.log("bottomRandomNum="+bottomRandomNum);

        }

/*
        var topHeight= topSprite.getBoundingBox().height;
        var bottomHeight= bottomSprite.getBoundingBox().height;

        var topRandomNum = Math.floor(Math.random()*1.2)+Math.random(); //该方法产生一个0到1之间的浮点数。
        var bottomRandomNum = Math.floor(Math.random()*1.2)+Math.random();

        while(true)
        {
            var spaceHeight = screenSize.height-topHeight*topRandomNum+bottomHeight*bottomRandomNum;
            //if(spaceHeight>screenSize.height/8 && spaceHeight<screenSize.height/6)
            if(spaceHeight>birdSize.height*2 && spaceHeight<birdSize.height*4)
            {
                topSprite.setScaleY(topRandomNum);
                bottomSprite.setScaleY(bottomRandomNum);
                break;
            }
        }
        alert("finish");

        */
    },

    initPhysics:function()
    {
        var staticBody = space.staticBody;

        // Walls
        var walls = [ new cp.SegmentShape( staticBody, cp.v(0,0), cp.v(screenSize.width,0), 0 ),				// bottom
            new cp.SegmentShape( staticBody, cp.v(0,screenSize.height+80), cp.v(screenSize.width,screenSize.height+50), 0),	// top
            new cp.SegmentShape( staticBody, cp.v(0,0), cp.v(0,screenSize.height), 0),				// left
            new cp.SegmentShape( staticBody, cp.v(screenSize.width,0), cp.v(screenSize.width,screenSize.height), 0)	// right
        ];
        for( var i=0; i < walls.length; i++ ) {
            var shape = walls[i];
            if(0 == i)
            {
                shape.setElasticity(2.0);
            }
            else
            {
                shape.setElasticity(1.0);
            }

            shape.setFriction(1);

            space.addStaticShape( shape );
        }

        // Gravity
        space.gravity = cp.v(0, -700);
    },
    createPhysicsSprite:function( pos ,self)
    {
        var body = new cp.Body(1, cp.momentForBox(1, 48, 108) );
        body.setPos( pos );
        birdbody = body;
        space.addBody( body );
        var shape = new cp.BoxShape( body, 48, 108);
        shape.setElasticity( 0.5 );
        shape.setFriction( 0.5 );
        space.addShape( shape );

        var sprite = cc.PhysicsSprite.create(s_Bird1);
        sprite.setBody( body );

        return sprite;
    },
   update:function( delta )
    {
        space.step( delta );

         birdBox = cc.rect(birdSprite.getPosition().x-birdSize.width/2,birdSprite.getPosition().y-birdSize.height/2,birdSize.width,birdSize.height);
        for(var i =0;i<tubeArray.length;i++)
        {
            var element = tubeArray[i];

            /******   tempDraw  code ******/
            var draw = drawArray[i];
            draw.clear();
            var Box = element.getBoundingBox();
            var Points = [ cc.p(Box.x,Box.y), cc.p(Box.x+Box.width,Box.y), cc.p(Box.x+Box.width,Box.y+Box.height), cc.p(Box.x,Box.y+Box.height) ];
            draw.drawPoly(Points, cc.c4f(1,0,0,0.0), 1, cc.c4f(0,0,1,1) );

            /******   tempDraw  code ******/

            if(cc.rectIntersectsRect(birdBox,element.getBoundingBox()))
            {
                //alert("Game Over!");
                this.stopAllActions();
                /*
                var nextScene = cc.Scene.create();
                var nextLayer = new GameScene;
                nextScene.addChild(nextLayer);
                cc.Director.getInstance().replaceScene(cc.TransitionSlideInT.create(0.0, nextScene));
                */
            }
        }

             /******   tempDraw  code ******/
             birdDraw.clear();

             var birdPoints = [ cc.p(birdBox.x,birdBox.y), cc.p(birdBox.x+birdBox.width,birdBox.y), cc.p(birdBox.x+birdBox.width,birdBox.y+birdBox.height), cc.p(birdBox.x,birdBox.y+birdBox.height) ];
             birdDraw.drawPoly(birdPoints, cc.c4f(1,0,0,0.0), 1, cc.c4f(0,0,1,1) );
             /******   tempDraw  code ******/
    },
    topCallback:function(topSprite,topDraw)
    {
        topSprite.removeFromParent(true);
        topDraw.clear();
        tubeArray.shift();
        drawArray.shift();
    },
    bottomCallback:function(bottomSprite,bottomDraw)
    {
        bottomSprite.removeFromParent(true);
        bottomDraw.clear();
        tubeArray.shift();
        drawArray.shift();
    },
    onTouchesBegan:function (touches, event) {
        this.isMouseDown = true;

        //var r = cp.v.sub(centroid, body.getPos());
        birdbody.applyImpulse(cp.v(0,400), cp.v(0,0));

    },
    onTouchesMoved:function (touches, event) {
        if (this.isMouseDown) {
            if (touches) {
                //this.circle.setPosition(touches[0].getLocation().x, touches[0].getLocation().y);
            }
        }
    },
    onTouchesEnded:function (touches, event) {
        this.isMouseDown = false;
    },
    onTouchesCancelled:function (touches, event) {
        console.log("onTouchesCancelled");
    }

});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new Game();
        layer.init();
        this.addChild(layer);
    }
});



