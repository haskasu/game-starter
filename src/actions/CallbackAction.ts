import { FW } from './../framework/Framework';
import { ActionBase } from './../framework/incidents/IncidentElements';

export class CallbackAction extends ActionBase {

    constructor(params: {
        callback: Function,
        callbackOwner?: Object,
        args?: Array<any>,
        delay?: boolean
    }) {
        super(params);
    }

    public execute(): void {
        if(this._params.delay) {
            FW.addDelayFunction(this, this.executeWithoutDelay, null, 1);
        } else {
            this.executeWithoutDelay();
        }
    }

    private executeWithoutDelay():void {
        this._params.callback.apply(this._params.callbackOwner, this._params.args);
    }
}