import { Physics, IPhysicsContactable } from "./Physics";
import { DisplayObjectUtil } from "../utils/DisplayObjectUtil";

export interface PhysicsBodyOptions {
  type: string;
  linearDamping?: number;
  angularDamping?: number;
  fixedRotation?: boolean;
  linearVelocity?: b2Vec2;
  angularVelocity?: number;
}

export interface PhysicsFixtureOptions {
  density?: number;
  friction?: number;
  restitution?: number;
  isSensor?: boolean;
}

export class PhysicsSprite implements IPhysicsContactable {
  private _name: string = "";

  private _body: b2Body;

  public sprite: PIXI.DisplayObject;

  private _physics: Physics;

  private _debugSprite: PIXI.Graphics;

  private _contactContext: IPhysicsContactable;

  private _spritePositionShift: PIXI.Point = new PIXI.Point(0, 0);
  private _spriteRotationShift: number = 0;

  constructor(physics: Physics, name: string, bodyOptions: PhysicsBodyOptions) {
    this._physics = physics;
    this._physics.addSprite(this);
    var def: b2BodyDef = new b2BodyDef();
    def.allowSleep = false;
    def.userData = this;
    this._name = name;
    if (bodyOptions.type == "dynamic") {
      def.type = b2_dynamicBody;
    } else {
      def.type = b2_staticBody;
    }
    if (bodyOptions.hasOwnProperty("linearDamping")) {
      def.linearDamping = bodyOptions["linearDamping"];
    }
    if (bodyOptions.hasOwnProperty("angularDamping")) {
      def.angularDamping = bodyOptions["angularDamping"];
    }
    if (bodyOptions.hasOwnProperty("fixedRotation")) {
      def.fixedRotation = bodyOptions["fixedRotation"];
    }
    if (bodyOptions.hasOwnProperty("linearVelocity")) {
      def.linearVelocity = bodyOptions["linearVelocity"].Clone();
      def.linearVelocity.Set(
        def.linearVelocity.x / this._physics.b2Scale,
        def.linearVelocity.y / this._physics.b2Scale
      );
    }
    if (bodyOptions.hasOwnProperty("angularVelocity")) {
      def.angularVelocity = bodyOptions["angularVelocity"];
    }

    this._body = this._physics.world.CreateBody(def);
  }

  public get contactContext(): IPhysicsContactable {
    return this._contactContext ? this._contactContext : this;
  }

  public get name(): string {
    return this._name;
  }

  public get body(): b2Body {
    return this._body;
  }

  public setPhysicsContactContext(context: IPhysicsContactable): void {
    this._contactContext = context;
    for (let fixture of this._body.fixtures) {
      fixture.userData = context;
    }
  }

  dispose() {
    DisplayObjectUtil.removeFromParent(this.sprite);
    this.disposePhysics();
  }

  disposePhysics() {
    if (this._physics.containsSprite(this)) {
      this._physics.world.DestroyBody(this._body);
      DisplayObjectUtil.removeFromParent(this._debugSprite);
      this._physics.removeSprite(this);
    }
  }

  setPosition(x, y) {
    this._body.SetTransform(
      new b2Vec2(x / this._physics.b2Scale, y / this._physics.b2Scale),
      this._body.GetAngle()
    );
    this.updateSprite();
  }

  public get x(): number {
    return this._body.GetPosition().x * this._physics.b2Scale;
  }
  public get y(): number {
    return this._body.GetPosition().y * this._physics.b2Scale;
  }

  public set x(value: number) {
    this.setPosition(value / this._physics.b2Scale, this._body.GetPosition().y);
  }

  public set y(value: number) {
    this.setPosition(this._body.GetPosition().x, value / this._physics.b2Scale);
  }

  setAngle(radians) {
    this._body.SetTransform(this._body.GetPosition(), radians);
    this.updateSprite();
  }

  private createDebugSprite() {
    if (this._physics.debugRoot && this._debugSprite == null) {
      this._debugSprite = new PIXI.Graphics();
      this._physics.debugRoot.addChild(this._debugSprite);
    }
    return this._debugSprite;
  }

  private _createFixtureDef(shape: b2Shape, options: PhysicsFixtureOptions): b2FixtureDef {
    options = options || {};
    var def: b2FixtureDef = new b2FixtureDef();
    def.shape = shape;
    if (options.hasOwnProperty("density"))
      def.density = options["density"];
    if (options.hasOwnProperty("friction"))
      def.friction = options["friction"];
    if (options.hasOwnProperty("restitution"))
      def.restitution = options["restitution"];
    if (options.hasOwnProperty("isSensor"))
      def.isSensor = options["isSensor"];

    return def;
  }

  addEdge(p1: b2Vec2, p2: b2Vec2, fixtureOptions: PhysicsFixtureOptions = null): PhysicsSprite {
    if (this.createDebugSprite()) {
      this._debugSprite.lineStyle(1, 0xffff00);
      this._debugSprite.moveTo(p1.x, p1.y);
      this._debugSprite.lineTo(p2.x, p2.y);
    }

    var shape: b2EdgeShape = new b2EdgeShape();
    p1.Set(p1.x / this._physics.b2Scale, p1.y / this._physics.b2Scale);
    p2.Set(p2.x / this._physics.b2Scale, p2.y / this._physics.b2Scale);
    shape.Set(p1, p2);
    this._body.CreateFixtureFromDef(this._createFixtureDef(shape, fixtureOptions));
    return this;
  }

  addCircle(localX: number, localY: number, radius: number, fixtureOptions: PhysicsFixtureOptions = null): PhysicsSprite {
    var shape: b2CircleShape = new b2CircleShape();
    shape.radius = radius / this._physics.b2Scale;
    shape.position.Set(localX / this._physics.b2Scale, localY / this._physics.b2Scale);

    this._body.CreateFixtureFromDef(this._createFixtureDef(shape, fixtureOptions));

    if (this.createDebugSprite()) {
      this._debugSprite.lineStyle(1, 0xffff00);
      this._debugSprite.drawCircle(localX, localY, radius);
      this._debugSprite.moveTo(0, 0);
      this._debugSprite.lineTo(radius, 0);
    }

    return this;
  }

  addBox(localX: number, localY: number, halfWidth: number, halfHeight: number, fixtureOptions: PhysicsFixtureOptions = null): PhysicsSprite {
    var box: b2PolygonShape = new b2PolygonShape();
    box.SetAsBoxXYCenterAngle(
      halfWidth / this._physics.b2Scale,
      halfHeight / this._physics.b2Scale,
      new b2Vec2(localX / this._physics.b2Scale, localY / this._physics.b2Scale),
      0
    );
    this._body.CreateFixtureFromDef(this._createFixtureDef(box, fixtureOptions));

    if (this.createDebugSprite()) {
      this._debugSprite.beginFill(0xff00ff, 0.5);
      this._debugSprite.drawRect(
        localX - halfWidth,
        localY - halfHeight,
        halfWidth * 2,
        halfHeight * 2
      );
      this._debugSprite.endFill();
    }

    return this;
  }

  addPolygon(points: Array<b2Vec2>, fixtureOptions: PhysicsFixtureOptions = null): PhysicsSprite {
    var polygon: b2PolygonShape = new b2PolygonShape();
    var vecs: Array<b2Vec2> = [];
    for (let i in points) {
      let vec: b2Vec2 = points[i].Clone();
      vec.Set(vec.x / this._physics.b2Scale, vec.y / this._physics.b2Scale);
      vecs[i] = vec;
    }
    polygon.vertices = vecs;
    this._body.CreateFixtureFromDef(this._createFixtureDef(polygon, fixtureOptions));

    if (this.createDebugSprite()) {
      this._debugSprite.lineStyle(1, 0xff00ff);
      this._debugSprite.moveTo(points[0].x, points[0].y);
      for (var i = 1; i < points.length; ++i) {
        this._debugSprite.lineTo(points[i].x, points[i].y);
      }
      this._debugSprite.lineTo(points[0].x, points[0].y);
    }

    return this;
  }

  update() {
    this.updateSprite();
  }

  private updateSprite() {
    if (this.sprite) {
      this.sprite.x = this.x + this._spritePositionShift.x;
      this.sprite.y = this.y + this._spritePositionShift.y;
      this.sprite.rotation = this._body.GetAngle() + this._spriteRotationShift;
    }

    if (this._debugSprite) {
      this._debugSprite.x = this.x;
      this._debugSprite.y = this.y;
      this._debugSprite.rotation = this._body.GetAngle();
    }
  }

  /**
     * contact callbacks
     */
  onPhysicsContactBegin(_obj: any, _contact: b2Contact): void { };
  onPhysicsContactPreSolve(_obj: any, _contact: b2Contact, _oldManifold: b2Manifold): void { };
  onPhysicsContactPostSolve(_obj: any, _contact: b2Contact, _impulse: b2ContactImpulse): void { };
  onPhysicsContactEnd(_obj: any, _contact: b2Contact): void { };
}
