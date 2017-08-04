import { FW } from './../framework/Framework';
import { ActionBase } from './../framework/incidents/IncidentElements';

export class ClearRootAction extends ActionBase {
    public execute():void {
        FW.root.removeChildren();
        FW.root.x = FW.root.y = 0;
        FW.root.scale.set(1, 1);
    }
}