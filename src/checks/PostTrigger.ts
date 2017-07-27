import { PostPackage } from './../framework/postOffice/PostOffice';
import { TriggerBase } from './../framework/incidents/IncidentElements';

export class PostTrigger extends TriggerBase {

    constructor(params: {
        topic: string
    }) {
        super(params);
        this._postClient.subscribe(params.topic);
    }

    _onReceivePost(_post: PostPackage): void {
        this.checkAndTriggerIncident();
    }
}