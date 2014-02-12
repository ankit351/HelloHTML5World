var TAG_SPRITE_MANAGER = 1;
var PTM_RATIO = 32;


var Game = cc.Layer.extend({
    isMouseDown:false,
    world:null,
    screenSize:null,
    lazyLayer:null,
    groundsprite:null,
    birdbody:null,
    tubeArray:null,
    birdSize:null,

    init:function () {
        this._super();

        screenSize = cc.Director.getInstance().getWinSize();
        this.setTouchEnabled(true);

        lazyLayer = cc.Layer.create();
        this.addChild(lazyLayer);

        tubeArray =  Array();

        birdSize = cc.Sprite.create(s_Bird).getContentSize();

        groundsprite = cc.Sprite.create(s_Ground);
        var groundSize = groundsprite.getContentSize();
        groundsprite.setPosition(screenSize.width / 2, groundSize.height/2);
        lazyLayer.addChild(groundsprite, 0);
        groundsprite.setScaleX(10);



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
        bodyDef.position.Set(10, groundsprite.getContentSize().height / PTM_RATIO-2.2);
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
        var mgr = cc.SpriteBatchNode.create(s_Bird, 150);
        this.addChild(mgr, 0, TAG_SPRITE_MANAGER);

        birdbody = this.addNewSpriteWithCoords(cc.p(screenSize.width / 5, screenSize.height / 1.2));
        this.scheduleUpdate();



        this.createTube(0.0);
        this.schedule(this.createTube,s_createTubeTime);

        return true;
    },
    onTouchesBegan:function (touches, event) {
        this.isMouseDown = true;
/*
        this.stopAllActions();
        var moveToA = cc.MoveTo.create(0.1,cc.p(birdSprite.getPositionX(),birdSprite.getPositionY()+60));
        birdSprite.runAction(moveToA);


        var action = cc.Sequence.create(
            moveToA,
            cc.CallFunc.create(this.onCallback1, this)
        );

        birdSprite.runAction(action);
        */

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
    },/*
    onCallback1:function()
    {
        var t = Math.sqrt(2*birdSprite.getPositionY()/9.8);
        var moveToA = cc.MoveTo.create(t,cc.p(birdSprite.getPositionX(),0));
        birdSprite.runAction(moveToA);
    }
*/
    addNewSpriteWithCoords:function (p) {
        //UXLog(L"Add sprite %0.2f x %02.f",p.x,p.y);
        var batch = this.getChildByTag(TAG_SPRITE_MANAGER);


        var aSprite = cc.Sprite.create(s_Bird);
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
        //It is recommended that a fixed time step is used with Box2D for stability
        //of the simulation, however, we are using a variable time step here.
        //You need to make an informed choice, the following URL is useful
        //http://gafferongames.com/game-physics/fix-your-timestep/
        //alert("asdjkahsdjka");
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

        for(var element in tubeArray)
        {
            var mY = 0
            if(tubeArray[element].getBoundingBox().y>100)
            {
                mY = 20;
            }
            else
            {
                mY = 0;
            }

            var bodyRect = cc.rect(birdbody.GetPosition().x * PTM_RATIO-30,birdbody.GetPosition().y * PTM_RATIO-mY,birdSize.width,birdSize.height);
            cc.log("11="+bodyRect.y);
            cc.log("22="+tubeArray[element].getBoundingBox().y);
            if(cc.rectIntersectsRect(bodyRect,tubeArray[element].getBoundingBox()))
            {
                alert("Game Over!")
            }

        }
        //cc.log(birdbody.GetPosition().y * PTM_RATIO);
    },
    createTube:function (dt)
    {
        var topSprite = cc.Sprite.create(s_PipeTop);
        topSprite.setAnchorPoint(1.0,1.0);
        topSprite.setPosition(screenSize.width, screenSize.height);
        lazyLayer.addChild(topSprite, 0);

        var topRandomNum = 1.2+Math.random(); //该方法产生一个0到1之间的浮点数。
        topSprite.setScaleY(topRandomNum);

        var topMoveToA = cc.MoveTo.create(s_tubeSpeed,cc.p(0,topSprite.getPositionY()));
        topSprite.runAction(topMoveToA);
        var topAction = cc.Sequence.create(
            topMoveToA,
            cc.CallFunc.create(this.topCallback, topSprite)
        );

        topSprite.runAction(topAction);
        tubeArray.push(topSprite);

        var bottomSprite = cc.Sprite.create(s_PipeBottom);
        bottomSprite.setAnchorPoint(1.0,0.0);
        var groundSize = groundsprite.getContentSize();
        bottomSprite.setPosition(screenSize.width, groundSize.height);
        lazyLayer.addChild(bottomSprite, 0);

        var bottomRandomNum = 1.2+Math.random();
        bottomSprite.setScaleY(bottomRandomNum);

        var bottomMoveToA = cc.MoveTo.create(s_tubeSpeed,cc.p(0,bottomSprite.getPositionY()));
        bottomSprite.runAction(bottomMoveToA);
        var bottomAction = cc.Sequence.create(
            bottomMoveToA,
            cc.CallFunc.create(this.bottomCallback, bottomSprite)
        );

        bottomSprite.runAction(bottomAction);
        tubeArray.push(bottomSprite);
    },
    topCallback:function(topSprite)
    {
        topSprite.removeFromParent(true);
        tubeArray.shift();
    },
    bottomCallback:function(bottomSprite)
    {
        bottomSprite.removeFromParent(true);
        tubeArray.shift();
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

