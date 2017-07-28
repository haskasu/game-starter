import { Framework } from "../Framework";
import { CheckBase, ActionBase, TriggerBase } from "./IncidentElements";
import { Message } from "../postOffice/PostOffice";
import { ArrayUtil } from "../utils/ArrayUtil";

export interface IIncidentCreateParameters {
  checkInterval?: number;
  repeats?: number;
  repeatInterval?: number;
}

export class Incident {
  private _id: string = "";

  private _manager: IncidentManager;

  private _checks: Array<CheckBase> = new Array<CheckBase>();

  private _actions: Array<ActionBase> = new Array<ActionBase>();

  private _timeToCheck: number = 0;

  private _enabled: boolean = true;

  private _repeats: number = 0;

  private _repeatInterval: number = 1;

  private _checkInterval: number = 100;

  private _params;

  static get TOPIC_TRIGGERED() {
    return "incidentTriggered";
  }

  constructor(manager: IncidentManager, id: string, params: IIncidentCreateParameters) {
    if (typeof id !== "string" || !id) {
      throw new Error("incident must have a valid id");
    }
    this._manager = manager;
    this._id = id;
    this._params = params || {};

    if (this._params.hasOwnProperty("checkInterval")) {
      this._checkInterval = this._params.checkInterval;
    }
    if (this._params.hasOwnProperty("repeats")) {
      this._repeats = this._params.repeats;
    }
    if (this._params.hasOwnProperty("repeatInterval")) {
      this._repeatInterval = this._params.repeatInterval;
    }
  }

  public get checkInterval(): number {
    return this._checkInterval;
  }

  public get manager(): IncidentManager {
    return this._manager;
  }

  public get id(): string {
    return this._id;
  }

  public get enabled(): boolean {
    return this._enabled;
  }

  public addCheck(check: CheckBase): Incident {
    check.incident = this;
    this._checks.push(check);
    return this;
  }

  public addAction(action: ActionBase): Incident {
    action.incident = this;
    this._actions.push(action);
    return this;
  }

  public hasTriggers(): boolean {
    for (let check of this._checks) {
      if (check instanceof TriggerBase) {
        return true;
      }
    }
    return false;
  }

  runChecks(ignoreCheck: CheckBase = null): boolean {
    for (let check of this._checks) {
      if (check.enabled && ignoreCheck != check && !check.checkPass())
        return false;
    }
    return true;
  }

  trigger() {
    console.log("trigger: " + this.id);
    for (let action of this._actions) {
      action.execute();
    }
    this.disable();
    this._manager.fw.postOffice.sendMessage(
      this.id,
      Incident.TOPIC_TRIGGERED,
      new Message(Incident.TOPIC_TRIGGERED, {
        incident: this
      })
    );
    this.removeOrRepeat();
  }

  private removeOrRepeat() {
    if (this._repeats > 0) {
      console.log("repeat: " + this.id);
      --this._repeats;

      for (let check of this._checks) {
        check.onIncidentRestart();
      }

      this.enable(this._manager.fw.time + this._repeatInterval);
    } else {
      this.dispose();
    }
  }

  public dispose() {
    this.disable();
    this._manager.removeIncident(this);

    for (let action of this._actions) {
      action.dispose();
    }
    for (let check of this._checks) {
      check.dispose();
    }
  }

  public get timeToCheck(): number {
    return this._timeToCheck;
  }

  public disable() {
    this._enabled = false;
  }

  public enable(timeToStartCheck: number) {
    this._timeToCheck = timeToStartCheck;
    this._enabled = true;
    this._manager._addIncident(this);
  }
}

export class IncidentManager {
  private _incidentMap: { [id: string]: Incident; } = {};
  private _incidents_needCheck: Array<Incident>;

  fw: Framework;

  constructor(fw: Framework) {
    this.fw = fw;
  }

  public reset(): void {
    for (let incidentId in this._incidentMap) {
      this._incidentMap[incidentId].dispose();
    }

    this._incidentMap = {};
    this._incidents_needCheck = null;
    this.fw.removeUpdateFunction(this, this.update);
  }

  public createIncident(id: string, params: IIncidentCreateParameters = null): Incident {
    var incident: Incident = new Incident(this, id, params);
    this._addIncident(incident);
    return incident;
  }

  public isStarted(): boolean {
    return this._incidents_needCheck != null;
  }

  public getincident(id: string): Incident {
    return this._incidentMap[id];
  }

  _addIncident(incident: Incident) {
    if (
      this._incidentMap.hasOwnProperty(incident.id) &&
      this._incidentMap[incident.id] != incident
    ) {
      throw new Error("Error: incident id already exist:" + incident.id);
    }

    this._incidentMap[incident.id] = incident;

    if (this.isStarted()) {
      if (incident.hasTriggers()) {
        ArrayUtil.removeElement(this._incidents_needCheck, incident);
      } else {
        ArrayUtil.addUniqueElement(this._incidents_needCheck, incident);
        ArrayUtil.sortNumericOn(this._incidents_needCheck, "timeToCheck", true);
      }
    }
  }

  public removeIncident(incident: Incident) {
    ArrayUtil.removeElement(this._incidents_needCheck, incident);
  }

  public start() {
    this._incidents_needCheck = new Array<Incident>();

    for (var id in this._incidentMap) {
      let incident: Incident = this.getincident(id);
      if (!incident.hasTriggers()) {
        this._incidents_needCheck.push(incident);
      }
    }
    ArrayUtil.sortNumericOn(this._incidents_needCheck, "timeToCheck", true);

    this.fw.addUpdateFunction(this, this.update);
  }

  private update() {
    if (this._incidents_needCheck.length) {
      let now: number = this.fw.time;
      let forceEndTime: number = new Date().getTime() + 10; // 10 ms max for one frame
      let incident: Incident = this._incidents_needCheck[0];
      if (
        this.checkAndTriggerIncident(now, incident) &&
        this._incidents_needCheck.length
      ) {
        let checkedincidents = [incident];
        incident = this._incidents_needCheck[0];
        while (checkedincidents.indexOf(incident) == -1) {
          if (
            !this.checkAndTriggerIncident(now, incident) ||
            this._incidents_needCheck.length == 0 ||
            new Date().getTime() > forceEndTime
          ) {
            break;
          }
          incident = this._incidents_needCheck[0];
        }
      }
    }
  }

  private checkAndTriggerIncident(now: number, incident: Incident): boolean {
    if (now > incident.timeToCheck) {
      if (incident.enabled && incident.runChecks()) {
        incident.trigger();
        // return false, so every frame triggers one incident only
        return false;
      }
      if (incident.enabled) {
        incident.enable(now + incident.checkInterval);
      }
      return true;
    }
    return false;
  }
}
