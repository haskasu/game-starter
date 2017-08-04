import { MathUtil } from './../utils/MathUtil';

export class GafLoaderInfo {
  path: string;

  gafName: string;

  loader: GAF.GAFLoader;

  constructor(gafName: string, path: string) {
    this.gafName = gafName;
    this.path = path || "";
  }

  getUrl(): string {
    if (this.path.charAt(this.path.length - 1) != "/") {
      this.path += "/";
    }

    return this.path + this.gafName + "/" + this.gafName + ".gaf";
  }
}

export class GafManager extends PIXI.utils.EventEmitter {
  static EVENT = {
    LOAD_PROGRESS: "load-progress",
    LOAD_COMPLETE: "load-complete"
  };

  private _gafAssetBundleMap = {};

  /*
     _gafsToLoad: gafName: GafLoaderInfo
     */
  private _gafsToLoad = {};

  constructor() {
    super();
  }

  createMovieClip(gafName: string, linkage: string = ""): GAF.GAFMovieClip {
    var gafBundle: GAF.GAFBundle = this._gafAssetBundleMap[gafName];
    if (gafBundle == null) {
      return null;
    }
    var gafTimeline: GAF.GAFTimeline = gafBundle.getGAFTimeline(
      gafName,
      linkage
    );
    if (gafTimeline == null) {
      return null;
    }
    return new GAF.GAFMovieClip(gafTimeline);
  }

  addGafToLoad(gafName, path: string = null): boolean {
    if (
      this._gafAssetBundleMap.hasOwnProperty(gafName) ||
      this._gafsToLoad.hasOwnProperty(gafName)
    )
      return false;
    this._gafsToLoad[gafName] = new GafLoaderInfo(gafName, path);
    return true;
  }

  _loadGafs() {
    for (let gafName in this._gafsToLoad) {
      let info: GafLoaderInfo = this._gafsToLoad[gafName];
      this._loadGaf(info);
    }
  }

  _loadGaf(info: GafLoaderInfo) {
    if (info.loader == null) {
      info.loader = new GAF.GAFLoader();
      info.loader.addGAFFile(info.getUrl());

      info.loader.on("complete", this.onLoadUrls, this);
      info.loader.on("progress", this.onGafLoaderProgress, this);
      info.loader.load();
    }
  }

  loadGaf(gafName: any, path: string = null): boolean {
    if (this.addGafToLoad(gafName, path)) {
      this._loadGafs();
      return true;
    }
    return false;
  }

  private onGafLoaderProgress() {
    this.emit(
      GafManager.EVENT.LOAD_PROGRESS,
      this.currentLoadedLoaders,
      this.currentLoadersTotal
    );
  }

  private onLoadUrls(loader: GAF.GAFLoader) {
    var converter = new GAF.ZipToGAFAssetConverter();
    converter.once(GAF.GAFEvent.COMPLETE, this.onGafLoaded, this);
    converter.convert(loader);
  }

  private onGafLoaded(event) {
    var converter = event.target;
    var gafBundle = converter.gafBundle;
    for (let asset of gafBundle.get_gafAssets()) {
      this._gafAssetBundleMap[asset.get_id()] = gafBundle;
      console.log("gaf asset ready: " + asset.get_id());
    }

    /*
        if g1 and g2 start to load at the same time,
        if g1 and g2 are loaded at the same time, each onGafLoaded would have currentLoadersTotal==currentLoadedLoaders
        and caused _loadCompleteNotifier.dispatch twice.
        so we use _gafsToLoad to determine if we need to dispatch the event.
         */
    if (
      this.isLoading() &&
      this.currentLoadersTotal == this.currentLoadedLoaders
    ) {
      this._gafsToLoad = {};
      this.emit(GafManager.EVENT.LOAD_COMPLETE);
    }
  }

  isLoading(): boolean {
    for (var gafName in this._gafsToLoad) {
      let info: GafLoaderInfo = this._gafsToLoad[gafName];
      if (info.loader) {
        return true;
      }
    }
    return false;
  }

  get currentLoadersTotal(): number {
    var count: number = 0;
    for (var gafName in this._gafsToLoad) {
      let info: GafLoaderInfo = this._gafsToLoad[gafName];
      if (info.loader) {
        ++count;
      }
    }
    return count;
  }

  get currentLoadedLoaders(): number {
    var count: number = 0;
    for (var gafName in this._gafsToLoad) {
      let info: GafLoaderInfo = this._gafsToLoad[gafName];
      if (info.loader && !info.loader.loading) {
        ++count;
      }
    }
    return count;
  }

  removeLocalTransform(gafObject) {
    var ltf:PIXI.Matrix = gafObject.transform.localTransform;
    var angle: number = Math.atan2(ltf.b, ltf.a);
    var denom: number = ltf.a * ltf.a + ltf.b * ltf.b;
    var sx: number = Math.sqrt(denom);
    var sy: number = (ltf.a * ltf.d - ltf.b * ltf.c) / sx;

    var tx: number = ltf.tx;
    var ty: number = ltf.ty;
    ltf.tx = 0;
    ltf.ty = 0;
    gafObject.transform.position.x += tx;
    gafObject.transform.position.y += ty;

    ltf.a = 1;
    ltf.b = 0;
    ltf.c = 0;
    ltf.d = 1;

    gafObject.transform.scale.x *= sx;
    gafObject.transform.scale.y *= sy;
    gafObject.rotation = MathUtil.radians2degrees(angle);
  }
}

export class GafButton extends PIXI.utils.EventEmitter {
  static EVENT = {
    CLICK: "click",
    DOWN: "down",
    UP: "up",
    OVER: "over",
    OUT: "out"
  }

  private gafClip: GAF.GAFMovieClip;

  private _isDown: boolean = false;

  private _isOver: boolean = false;

  constructor(gafClip: GAF.GAFMovieClip) {
    super();
    this.gafClip = gafClip;
    this.gafClip.interactive = true;
    this.gafClip.buttonMode = true;

    this.gafClip
      .on("pointerdown", this.onButtonDown, this)
      .on("pointerup", this.onButtonUp, this)
      .on("pointerupoutside", this.onButtonUp, this)
      .on("pointerover", this.onButtonOver, this)
      .on("pointerout", this.onButtonOut, this);
  }

  public get sprite() {
    return this.gafClip;
  }

  public get isDown():boolean {
    return this._isDown;
  }

  public get isOver():boolean {
    return this._isOver;
  }

  private onButtonDown() {
    this._isDown = true;
    this.gafClip.gotoAndStop(3);
    this.emit(GafButton.EVENT.DOWN);
  }

  private onButtonUp() {
    var click: boolean = this._isDown;
    this._isDown = false;
    this.gafClip.gotoAndStop(this._isOver ? 2 : 1);
    this.emit(GafButton.EVENT.UP);
    if (click) {
      this.emit(GafButton.EVENT.CLICK);
    }
  }

  private onButtonOver() {
    var wasOver:boolean = this._isOver;
    this._isOver = true;
    if (this._isDown) {
      return;
    }
    this.gafClip.gotoAndStop(2);
    if(!wasOver) {
      this.emit(GafButton.EVENT.OVER);
    }
  }

  private onButtonOut() {
    this._isOver = false;
    if (this._isDown) {
      return;
    }
    this.gafClip.gotoAndStop(1);
    this.emit(GafButton.EVENT.OUT);
  }
}
