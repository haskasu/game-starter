import { Point } from "../geom/Point";
import { DisplayObjectUtil } from "../utils/DisplayObjectUtil";
import { Framework } from "../Framework";
import { PhysicsSprite, PhysicsBodyOptions } from "./PhysicsSprite";
import { ArrayUtil } from "../utils/ArrayUtil";

//import {SimpleEventDispatcher, ISimpleEvent} from "strongly-typed-events";

export interface IPhysicsContactable {
  name: string;
  onPhysicsContactBegin(obj: any, contact: b2Contact): void;
  onPhysicsContactPreSolve(
    obj: any,
    contact: b2Contact,
    oldManifold: b2Manifold
  ): void;
  onPhysicsContactPostSolve(
    obj: any,
    contact: b2Contact,
    impulse: b2ContactImpulse
  ): void;
  onPhysicsContactEnd(obj: any, contact: b2Contact): void;
}

export class Physics {
  public world: b2World;

  private fw: Framework;

  b2Scale: number = 30;

  private _sprites: Array<PhysicsSprite> = new Array<PhysicsSprite>();

  private _debugRoot: PIXI.Container;

  stepVelocityIterations: number = 8;

  stepPositionIterations: number = 3;

  private _stepTimeScale: number = 0.001;

  private _contactListener: b2ContactListener;

  constructor(fw: Framework) {
    this.world = new b2World(new b2Vec2(0, 30 / this.b2Scale));
    window["world"] = this.world;
    this.fw = fw;
    this.stepTimeScale = 4;
    this.fw.addUpdateFunction(this, this.update);
    this.setupCollisionResolver();
    if (fw.debugRoot) {
      this.createDebugRoot(fw.debugRoot);
    }
  }

  public convertB2VecToScreenPoint(vec: b2Vec2): Point {
    return new Point(vec.x * this.b2Scale, vec.y * this.b2Scale);
  }

  public set stepTimeScale(value: number) {
    this._stepTimeScale = value / 1000;
  }

  public get stepTimeScale(): number {
    return this._stepTimeScale * 1000;
  }

  public createDebugRoot(_parent) {
    if (_parent && this._debugRoot == null) {
      this._debugRoot = new PIXI.Container();
      _parent.addChild(this._debugRoot);
    }
  }

  public get debugRoot(): PIXI.Container {
    return this._debugRoot;
  }

  public dispose() {
    this.fw.removeUpdateFunction(this, this.update);
  }

  public createPhysicsSprite(
    name: string,
    bodyoption: PhysicsBodyOptions
  ): PhysicsSprite {
    return new PhysicsSprite(this, name, bodyoption);
  }

  public addPhysicSprite(sprite: PhysicsSprite) {
    this._sprites.push(sprite);
  }

  update(dt) {
    this.world.Step(
      dt * this._stepTimeScale,
      this.stepVelocityIterations,
      this.stepPositionIterations
    );

    DisplayObjectUtil.setOnTopOfParent(this._debugRoot);

    for (let sprite of this._sprites) {
      sprite.update();
    }
  }

  public addSprite(sprite: PhysicsSprite) {
    ArrayUtil.addUniqueElement(this._sprites, sprite);
  }

  public removeSprite(sprite: PhysicsSprite) {
    ArrayUtil.removeElement(this._sprites, sprite);
  }

  public containsSprite(sprite: PhysicsSprite): boolean {
    return this._sprites.indexOf(sprite) != -1;
  }

  public Vec2(x: number, y: number) {
    return new b2Vec2(x, y);
  }

  private setupCollisionResolver() {
    let getContactContext: Function = function (fixture: b2Fixture): any {
      let context: any = fixture.userData;
      if (context && context["contactContext"])
        return context.contactContext;
      return context;
    }

    this._contactListener = {
      BeginContactBody: function (contact: b2Contact): void {
        let contactObjA: any = getContactContext(contact.GetFixtureA())
        let contactObjB: any = getContactContext(contact.GetFixtureB())
        if (contactObjA && typeof contactObjA.onPhysicsContactBegin == "function")
          contactObjA.onPhysicsContactBegin(contactObjB, contact);

        if (contactObjB && typeof contactObjB.onPhysicsContactBegin == "function")
          contactObjB.onPhysicsContactBegin(contactObjA, contact);
      },
      PreSolve: function (contact: b2Contact, oldManifold: b2Manifold): void {
        let contactObjA: any = getContactContext(contact.GetFixtureA());
        let contactObjB: any = getContactContext(contact.GetFixtureB());
        if (contactObjA && typeof contactObjA.onPhysicsContactPreSolve == "function")
          contactObjA.onPhysicsContactPreSolve(contactObjB, contact, oldManifold);

        if (contactObjB && typeof contactObjB.onPhysicsContactPreSolve == "function")
          contactObjB.onPhysicsContactPreSolve(contactObjA, contact, oldManifold);
      },
      PostSolve: function (contact: b2Contact, impulse: b2ContactImpulse): void {
        let contactObjA: any = getContactContext(contact.GetFixtureA());
        let contactObjB: any = getContactContext(contact.GetFixtureB());
        if (contactObjA && typeof contactObjA.onPhysicsContactPostSolve == "function")
          contactObjA.onPhysicsContactPostSolve(contactObjB, contact, impulse);

        if (contactObjB && typeof contactObjB.onPhysicsContactPostSolve == "function")
          contactObjB.onPhysicsContactPostSolve(contactObjA, contact, impulse);
      },
      EndContactBody: function (contact: b2Contact): void {
        let contactObjA: any = getContactContext(contact.GetFixtureA());
        let contactObjB: any = getContactContext(contact.GetFixtureB());
        if (contactObjA && typeof contactObjA.onPhysicsContactEnd == "function")
          contactObjA.onPhysicsContactEnd(contactObjB, contact);

        if (contactObjB && typeof contactObjB.onPhysicsContactEnd == "function")
          contactObjB.onPhysicsContactEnd(contactObjA, contact);
      }
    }
    this.world.SetContactListener(this._contactListener);
  }
}
