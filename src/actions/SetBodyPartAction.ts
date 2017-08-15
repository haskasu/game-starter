import { ObjectBase } from './../framework/ObjectBase';
import { FullBody } from './../objects/FullBody';
import { ActionBase } from './../framework/incidents/IncidentElements';

export class SetBodyPartAction extends ActionBase {

    constructor(params: {
        part: string,
        deltaFrame: number
    }) {
        super(params)
    }

    public execute(): void {
        this.setPartFrame(this._params.part, this._params.deltaFrame);
        if(this._params.part == 'head') {
            this.setPartFrame('hair', this._params.deltaFrame);
            this.setPartFrame('brow', this._params.deltaFrame);
            this.setPartFrame('eye', this._params.deltaFrame);
            this.setPartFrame('ear', this._params.deltaFrame);
            this.setPartFrame('nose', this._params.deltaFrame);
            this.setPartFrame('mouth', this._params.deltaFrame);
        }
    }

    private setPartFrame(part:string, deltaFrame:number):void {
        var fullbody: FullBody = ObjectBase.getObject<FullBody>('FullBody');
        var frame: number = fullbody.getBodyPartFrame(part) + deltaFrame;
        if (frame > fullbody.getBodyPartTotalFrame(part)) {
            frame = 1;
        } else if (frame < 1) {
            frame = fullbody.getBodyPartTotalFrame(part);
        }
        fullbody.setBodyPart(part, frame);
    }
}