import { ActionBase } from './../framework/incidents/IncidentElements';

export class CreateObjectAction extends ActionBase {

    constructor(params:{
        objectClass:{new()}
    }) {
        super(params)
    }

    public execute():void {
        new this._params.objectClass();
    }
}