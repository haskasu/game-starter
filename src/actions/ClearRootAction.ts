import { FW } from './../framework/Framework';
import { ActionBase } from './../framework/incidents/IncidentElements';

export class ClearRootAction extends ActionBase {
    public execute():void {
        FW.root.removeChildren();
    }
}