import { FW } from './../Framework';
import { PostClient, PostPackage } from './../postOffice/PostOffice';
import { Incident } from "./IncidentManager";

export class IncidentElementBase {
  // this is set when element is added into an incident
  incident: Incident;

  _params;

  constructor(params) {
    this._params = params || {};
  }

  public dispose():void {

  }
}

export class CheckBase extends IncidentElementBase {
  private _enabled: boolean = true;

  constructor(params = null) {
    super(params);
  }

  public checkPass(): boolean {
    return true;
  }

  public set enabled(value: boolean) {
    this._enabled = value;
  }

  public get enabled(): boolean {
    return this._enabled;
  }

  onIncidentRestart() {
    this.enabled = true;
  }
}

export class TriggerBase extends CheckBase {

  _postClient:PostClient;

  constructor(params = null) {
    super(params);
    this._postClient = FW.postOffice.createClient();
    this._postClient.setReceivePostFunction(this, this._onReceivePost)
  }

  _onReceivePost(_post:PostPackage):void {

  }

  public dispose():void {
    this._postClient.dispose();
  }

  public checkPass(): boolean {
    return false;
  }

  checkAndTriggerIncident(): boolean {
    if (this.incident.runChecks(this)) {
      this.incident.trigger();
      return true;
    }
    return false;
  }
}

export class ActionBase extends IncidentElementBase {
  constructor(params = null) {
    super(params);
  }

  execute():void {};
}
