var TAG_SPRITE_MANAGER = 1;
var PTM_RATIO = 32;

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

        for (var i = 0; i < 2; i++) {
            var groundsprite = cc.Sprite.create(s_Ground);
            groundSize = groundsprite.getContentSize();
            groundsprite.setPosition(screenSize.width / 2 + screenSize.width * i, groundSize.height / 2);
            lazyLayer.addChild(groundsprite, 0);

            var ｍoveToA = cc.MoveTo.create(s_groundSpeed * (i + 1), cc.p(-screenSize.width / 2, groundsprite.getPositionY()));

            var Action = cc.Sequence.create(
                ｍoveToA,
                cc.CallFunc.create(this.groundCallback, groundsprite,this)
            );
            groundsprite.runAction(Action);
        }


        var b2Vec2 = Box2D.Common.Math.b2Vec2
            , b2BodyDef = Box2D.Dynamics.b2BodyDef
            , b2Body = Box2D.Dynamics.b2Body
            , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
            , b2World = Box2D.Dynamics.b2World
            , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;


        //UXLog(L"Screen width %0.2f screen height %0.2f",screenSize.width,screenSize.height);

        // Construct a world object, which will hold and simulate the rigid bodies.
        this.world = new b2World(new b2Vec2(0, -10), true);
        this.world.SetContinuousPhysics(true);

        // Define the ground body.
        //var groundBodyDef = new b2BodyDef(); // TODO
        //groundBodyDef.position.Set(screenSize.width / 2 / PTM_RATIO, screenSize.height / 2 / PTM_RATIO); // bottom-left corner

        // Call the body factory which allocates memory for the ground body
        // from a pool and creates the ground box shape (also from a pool).
        // The body is also added to the world.
        //var groundBody = this.world.CreateBody(groundBodyDef);

        var fixDef = new b2FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;

        var bodyDef = new b2BodyDef;

        //create ground
        bodyDef.type = b2Body.b2_staticBody;
        fixDef.shape = new b2PolygonShape;
        fixDef.shape.SetAsBox(20, 2);
        // upper
        bodyDef.position.Set(10, screenSize.height / PTM_RATIO + 1.8);
        this.world.CreateBody(bodyDef).CreateFixture(fixDef);
        // bottom
        bodyDef.position.Set(10, groundSize.height / PTM_RATIO - 2.2);
        this.world.CreateBody(bodyDef).CreateFixture(fixDef);

        fixDef.shape.SetAsBox(2, 14);
        // left
        bodyDef.position.Set(-1.8, 13);
        this.world.CreateBody(bodyDef).CreateFixture(fixDef);
        // right
        bodyDef.position.Set(26.8, 13);
        this.world.CreateBody(bodyDef).CreateFixture(fixDef);

        //Set up sprite
        //birdSprite = mgr;
        birdSprite = cc.SpriteBatchNode.create(s_Bird1, 150);
        this.addChild(birdSprite, 0, TAG_SPRITE_MANAGER);
        birdPicName = s_Bird1;



        birdbody = this.addNewSpriteWithCoords(cc.p(screenSize.width / 5, screenSize.height / 1.2));
        this.scheduleUpdate();
        this.schedule(this.changeSpriteFrame, s_sparkSpeed);

        birdDraw = cc.DrawNode.create();
        /******   tempDraw  code ******/
        this.addChild(birdDraw, 1);
        /******   tempDraw  code ******/


        this.createTube(0.0);
        this.schedule(this.createTube, s_createTubeTime);

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
    onTouchesBegan:function (touches, event) {
        this.isMouseDown = true;

        var b2Vec2 = Box2D.Common.Math.b2Vec2;
        var force = new b2Vec2(0, s_flySpeed);
        birdbody.ApplyImpulse(force,birdbody.GetPosition());

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
    },
    addNewSpriteWithCoords:function (p) {
        //UXLog(L"Add sprite %0.2f x %02.f",p.x,p.y);
        var batch = this.getChildByTag(TAG_SPRITE_MANAGER);


        var aSprite = cc.Sprite.create(s_Bird1);
        var spriteSize = aSprite.getContentSize();
        var sprite = cc.Sprite.createWithTexture(batch.getTexture(), cc.rect(0, 0, spriteSize.width, spriteSize.height));
        batch.addChild(sprite);

        sprite.setPosition(p.x, p.y);

        // Define the dynamic body.
        //Set up a 1m squared box in the physics world
        var b2BodyDef = Box2D.Dynamics.b2BodyDef
            , b2Body = Box2D.Dynamics.b2Body
            , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
            , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;

        var bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.position.Set(p.x / PTM_RATIO, p.y / PTM_RATIO);
        bodyDef.userData = sprite;
        var body = this.world.CreateBody(bodyDef);

        // Define another box shape for our dynamic body.
        var dynamicBox = new b2PolygonShape();
        dynamicBox.SetAsBox(0.5, 0.5);//These are mid points for our 1m box
        //dynamicBox.SetAsBox(1.0, 1.0);
        // Define the dynamic body fixture.
        var fixtureDef = new b2FixtureDef();
        fixtureDef.shape = dynamicBox;
        fixtureDef.density = 1.0;
        fixtureDef.friction = 0.3;
        body.CreateFixture(fixtureDef);

        return body;
    },
    update:function (dt) {

        var velocityIterations = 8;
        var positionIterations = 1;

        // Instruct the world to perform a single step of simulation. It is
        // generally best to keep the time step and iterations fixed.
        this.world.Step(dt, velocityIterations, positionIterations);

        //Iterate over the bodies in the physics world
        for (var b = this.world.GetBodyList(); b; b = b.GetNext()) {
            if (b.GetUserData() != null) {
                //Synchronize the AtlasSprites position and rotation with the corresponding body
                var myActor = b.GetUserData();
                myActor.setPosition(b.GetPosition().x * PTM_RATIO, b.GetPosition().y * PTM_RATIO);
                myActor.setRotation(-1 * cc.RADIANS_TO_DEGREES(b.GetAngle()));
                //console.log(b.GetAngle());
            }
        }
        birdBox = cc.rect(birdbody.GetPosition().x * PTM_RATIO-birdSize.width/2,birdbody.GetPosition().y * PTM_RATIO-birdSize.height/2,birdSize.width,birdSize.height);
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
                alert("Game Over!");
                var nextScene = cc.Scene.create();
                var nextLayer = new GameScene;
                nextScene.addChild(nextLayer);
                cc.Director.getInstance().replaceScene(cc.TransitionSlideInT.create(0.0, nextScene));
            }
        }

        /******   tempDraw  code ******/
        birdDraw.clear();

        var birdPoints = [ cc.p(birdBox.x,birdBox.y), cc.p(birdBox.x+birdBox.width,birdBox.y), cc.p(birdBox.x+birdBox.width,birdBox.y+birdBox.height), cc.p(birdBox.x,birdBox.y+birdBox.height) ];
        birdDraw.drawPoly(birdPoints, cc.c4f(1,0,0,0.0), 1, cc.c4f(0,0,1,1) );
        /******   tempDraw  code ******/

        //cc.log(birdbody.GetPosition().y * PTM_RATIO);
    },
    createTube:function (dt)
    {
        var topRandomNum = 1.2+Math.random(); //该方法产生一个0到1之间的浮点数。
        var bottomRandomNum = 1.2+Math.random();




        var topSprite = cc.Sprite.create(s_PipeTop);
        topSprite.setAnchorPoint(1.0,1.0);
        topSprite.setPosition(screenSize.width, screenSize.height);
        lazyLayer.addChild(topSprite, 0);


        topSprite.setScaleY(topRandomNum);

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


        bottomSprite.setScaleY(bottomRandomNum);

        var bottomMoveToA = cc.MoveTo.create(s_tubeSpeed,cc.p(0,bottomSprite.getPositionY()));
        var bottomDraw = cc.DrawNode.create();
        var bottomAction = cc.Sequence.create(
            bottomMoveToA,
            cc.CallFunc.create(this.bottomCallback, bottomSprite,bottomDraw)
        );

        bottomSprite.runAction(bottomAction);
        tubeArray.push(bottomSprite);


        this.addChild( bottomDraw, 1 );
        var bottomBox = topSprite.getBoundingBox();
        var bottompoints = [ cc.p(bottomBox.x,bottomBox.y), cc.p(bottomBox.x+bottomBox.width,bottomBox.y), cc.p(bottomBox.x+bottomBox.width,bottomBox.y+bottomBox.height), cc.p(bottomBox.x,bottomBox.y+bottomBox.height) ];
        bottomDraw.drawPoly(bottompoints, cc.c4f(1,0,0,0.0), 1, cc.c4f(0,0,1,1) );
        drawArray.push(bottomDraw);

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

