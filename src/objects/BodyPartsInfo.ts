import { IntUtil } from './../framework/utils/IntUtil';
import { FW } from './../framework/Framework';
import { ObjectBase } from './../framework/ObjectBase';

FW.addPreloadResource('bodyparts', 'assets/xml/bodyparts.xml?v='+IntUtil.random(Number.MAX_SAFE_INTEGER));

class BodyPartsInfo extends ObjectBase {
    private _xml: XMLDocument;

    constructor() {
        super();
        this._xml = FW.getPreloadedResource('bodyparts').data;
    }

    public getPartFrameXML(part: string, frame: number): Element {
        var partXML: Element = this.getPartXML(part);
        if (partXML) {
            var allframes: NodeListOf<Element> = partXML.getElementsByTagName('option');
            for (var i: number = 0; i < allframes.length; ++i) {
                if (allframes[i].getAttribute('frame') == frame.toString()) {
                    return allframes[i];
                }
            }
        }
        return null;
    }

    public getPartXML(part: string): Element {
        var xml: XMLDocument = FW.getPreloadedResource('bodyparts').data
        var allparts: NodeListOf<Element> = xml.getElementsByTagName('part');
        for (var i: number = 0; i < allparts.length; ++i) {
            if (allparts[i].getAttribute('type') == part) {
                return allparts[i];
            }
        }
        return null;
    }

    public getAllParts():Array<string> {
        var list: Array<string> = [];
        var xml: XMLDocument = FW.getPreloadedResource('bodyparts').data;
        var allparts: NodeListOf<Element> = xml.getElementsByTagName('part');
        for (var i: number = 0; i < allparts.length; ++i) {
            list.push(allparts[i].getAttribute('type'));
        }
        return list;
    }
}

export const bodyPartsInfo:BodyPartsInfo = new BodyPartsInfo();