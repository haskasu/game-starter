import { Point } from './geom/Point';
import { IncidentManager } from './incidents/IncidentManager';
import { GafManager } from './display/GafManager';
import { Physics } from './liquidfun/Physics';
import { ArrayUtil } from './utils/ArrayUtil';
import { PostOffice } from './postOffice/PostOffice';

export class Framework extends PIXI.utils.EventEmitter {

  static EVENT = {
    PRELOAD_COMPLETE: "preload-complete"
  };

  private _renderFps: number = 30;
  private _renderSpf: number = 0;
  private _nextRenderTime: number = 0;

  renderer: PIXI.SystemRenderer;
  stage: PIXI.Container;
  debugRoot: PIXI.Container;
  root: PIXI.Container;
  speed: number = 0.01;
  frame: number = 0;
  lastFrameTime: number = 0;
  private _physics: Physics;
  fpsField: PIXI.Text;
  fpsCalcStartTime: number = 0;
  fpsCaclFrames: number = 0;
  private _debug: boolean = false;
  private _stageSize: Point = new Point(800, 600);

  gafManager: GafManager = new GafManager();
  postOffice: PostOffice;
  incidentsManager: IncidentManager;

  private _loader: PIXI.loaders.Loader = null;

  private _delayFunctionObjects = [];
  private _updateFunctions = [];
  private _updateFunctionTargets = [];

  private _animeteBinded;

  constructor() {
    super();

  }

  public initialize(stageWidth: number, stageHeight: number, debug: boolean): void {
    this._stageSize.set(stageWidth, stageHeight);
    this.renderer = PIXI.autoDetectRenderer(this._stageSize.x, this._stageSize.y, { antialias: true });
    this.renderer.autoResize = true;

    this.stage = new PIXI.Container();
    this.root = new PIXI.Container();
    this.stage.addChild(this.root);

    this.postOffice = new PostOffice(this);
    this.incidentsManager = new IncidentManager(this);
    this._animeteBinded = this.animate.bind(this);
    this.renderFps = 30;
    // run the render loop
    requestAnimationFrame(this._first_animate.bind(this));

    document.body.appendChild(this.renderer.view);

    window.onresize = this._onWindowResize.bind(this);
    this._onWindowResize();

    if (debug) {
      this._setDebug();
    }

    this._init();
  }

  public get stageWidth(): number {
    return this._stageSize.x;
  }
  public get stageHeight(): number {
    return this._stageSize.y;
  }

  public addPreloadResource(name: string, url: string): void {
    if (this._loader == null) {
      this._loader = new PIXI.loaders.Loader();
    }
    this._loader.add(name, url);
  }

  public getPreloadedResource(name: string): PIXI.loaders.Resource {
    return this._loader ? this._loader.resources[name] : null;
  }

  private _onWindowResize() {
    this.renderer.resize(window.innerWidth, window.innerHeight);
    var scaleX: number = window.innerWidth / this._stageSize.x;
    var scaleY: number = window.innerHeight / this._stageSize.y;
    var scale: number = Math.min(scaleX, scaleY);
    this.stage.scale.set(scale);

    var scaledWidth: number = this._stageSize.x * scale;
    var scaledHeight: number = this._stageSize.y * scale;
    this.stage.position.set((window.innerWidth - scaledWidth) / 2, (window.innerHeight - scaledHeight) / 2);
  }

  public get physics(): Physics {
    if (this._physics == null) {
      this._physics = new Physics(this);
    }
    return this._physics;
  }

  private _init() {
    this.gafManager._loadGafs();

    if (this.gafManager.isLoading()) {
      this.gafManager.once(GafManager.EVENT.LOAD_COMPLETE, this._init_gaf_loaded, this);
    } else {
      this._init_gaf_loaded();
    }
  }

  private _init_gaf_loaded(): void {
    if (this._loader) {
      this._loader.once("complete", this._init_pixi_loaded, this);
      this._loader.load();
    }
    else {
      this.addDelayFunction(this, this._init_pixi_loaded, null, 1);
    }
  }

  private _init_pixi_loaded(): void {
    if (window["liquidfunReady"]) {
      this.emit(Framework.EVENT.PRELOAD_COMPLETE);
    } else {
      setTimeout(() => this._init_pixi_loaded(), 50);
    }
  }

  public get renderFps(): number {
    return this._renderFps;
  }

  public set renderFps(value: number) {
    this._renderFps = value;
    this._renderSpf = 1000 / this._renderFps;
  }

  private _setDebug() {
    this._debug = true;
    this.debugRoot = new PIXI.Container();
    this.stage.addChild(this.debugRoot);
    if (this._physics) {
      this.physics.createDebugRoot(this.debugRoot);
    }
    this.createFpsField();
  }

  public addUpdateFunction(owner, func: Function) {
    var index = this._updateFunctions.indexOf(func);
    while (index != -1) {
      if (this._updateFunctionTargets[index] == owner)
        return;
      index = this._updateFunctions.indexOf(func, index + 1);
    }
    this._updateFunctions.push(func);
    this._updateFunctionTargets.push(owner);
  }

  public removeUpdateFunction(owner, func: Function) {
    var index = this._updateFunctions.indexOf(func);
    while (index != -1) {
      if (this._updateFunctionTargets[index] == owner) {
        this._updateFunctions[index] = null;
        this._updateFunctionTargets[index] = null;
        return;
      }
      index = this._updateFunctions.indexOf(func, index + 1);
    }
  };

  public addDelayFunction(owner, func: Function, param, delayMs: number = 0) {
    var obj = {
      owner: owner,
      func: func,
      param: param,
      time: this.lastFrameTime + delayMs
    };
    this._delayFunctionObjects.push(obj);
    this._delayFunctionObjects = ArrayUtil.sortNumericOn(this._delayFunctionObjects, "time", true);
  };

  private createFpsField() {
    this.fpsField = new PIXI.Text('PIXI.js', {
      fontFamily: 'Arial',
      fontSize: '10px',
      fontStyle: 'italic',
      fontWeight: 'bold',
      fill: '#F7EDCA',
      stroke: '#4a1850',
      strokeThickness: 5
    });

    this.fpsField.x = 0;
    this.fpsField.y = this._stageSize.y;
    this.fpsField.anchor.set(0, 1);

    this.stage.addChild(this.fpsField);
  }

  private _first_animate(currentTime: number) {
    this.lastFrameTime = currentTime;
    requestAnimationFrame(this._animeteBinded);
    this.renderer.render(this.stage);
    this._nextRenderTime = currentTime + this._renderSpf;
  }

  animate(currentTime: number) {

    requestAnimationFrame(this._animeteBinded);

    if (this.fpsField) {
      if (this.fpsCalcStartTime == 0) {
        this.fpsCalcStartTime = currentTime;
        this.fpsCaclFrames = 0;
      } else if (currentTime - this.fpsCalcStartTime > 1000) {
        let fps: number = Math.round(this.fpsCaclFrames / (currentTime - this.fpsCalcStartTime) * 1000);
        this.fpsField.text = "FPS: " + fps;
        this.fpsCalcStartTime = currentTime;
        this.fpsCaclFrames = 0;
      } else {
        this.fpsCaclFrames++;
      }
    }

    let deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    PIXI.keyboardManager.update();
    TWEEN.update();
    this.callUpdateFunctions(deltaTime);

    if (currentTime > this._nextRenderTime) {
      this._nextRenderTime += this._renderSpf;
      this.renderer.render(this.stage);
    }
  }

  private callUpdateFunctions(deltaTime) {
    while (this._delayFunctionObjects.length) {
      let delayObj = this._delayFunctionObjects[0];
      if (delayObj.time > this.lastFrameTime)
        break;
      this._delayFunctionObjects.shift();
      if (delayObj.owner)
        delayObj.func.apply(delayObj.owner, delayObj.param);
      else
        delayObj.func(delayObj.param);
    }

    let len = this._updateFunctions.length;
    for (var index = 0; index < len; ++index) {
      if (this._updateFunctions[index] == null) {
        this._updateFunctions.splice(index, 1);
        this._updateFunctionTargets.splice(index, 1);
        --index;
        --len;
      }
      else {
        var owner = this._updateFunctionTargets[index];
        var func = this._updateFunctions[index];
        func.call(owner, deltaTime);
      }
    }
  }

  public get time(): number {
    return this.lastFrameTime;
  }

  public getSound(alias: string): PIXI.sound.Sound {
    return FW.getPreloadedResource(alias)["sound"];
  }
}

export const FW: Framework = new Framework();