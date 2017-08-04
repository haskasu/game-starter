import { Color } from './../framework/geom/Color';
import { DragControl } from './../framework/interactive/DragControll';
import { bodyPartsInfo } from './BodyPartsInfo';
import { Point } from './../framework/geom/Point';
import { FW } from './../framework/Framework';
import { ObjectBase } from './../framework/ObjectBase';

FW.gafManager.addGafToLoad('fullbody', 'assets/gaf');

export class FullBody extends ObjectBase {

    private movieclip: GAF.GAFMovieClip;

    private dragControl: DragControl;

    private skinColor: Color = new Color(0xF4C496, 1);

    constructor() {
        super();
        this.movieclip = FW.gafManager.createMovieClip('fullbody', 'lib_fullbody');
        this.movieclip.scale.set(0.5, 0.5);
        this.movieclip.x += 100;
        FW.gafManager.removeLocalTransform(this.movieclip);
        FW.root.addChild(this.movieclip);

        var allparts: Array<string> = bodyPartsInfo.getAllParts();
        for (let part of allparts) {
            this.initPartClips(part);
        }

        this.setBodyPart('upperbody', 1);
        this.setSkinColor(0xFF0000);

        this.movieclip.parent.interactive = true;
        this.dragControl = new DragControl(this.movieclip.parent);
    }

    private initPartClips(part: string): void {
        this.initPartClip(part, '');
        this.initPartClip(part, 'F');
        this.initPartClip(part, 'B');
    }
    private initPartClip(part: string, postfix: string): void {
        var clip: GAF.GAFMovieClip = this.getBodyPart(part, postfix);
        if (clip) {
            clip['part'] = part;
            FW.gafManager.removeLocalTransform(clip);
        }
    }

    public setBodyPart(part: string, frame: number): void {
        var refclip: GAF.GAFMovieClip = this._setBodyPart(part, '', frame);
        var refclipF: GAF.GAFMovieClip = this._setBodyPart(part, 'F', frame);
        var refclipB: GAF.GAFMovieClip = this._setBodyPart(part, 'B', frame);
        refclip = refclip || refclipF || refclipB;
        if (refclip) {
            this.updatePartNodes(refclip, part, frame);
        }

        this.updatePartSkinColor(part);
    }

    public getBodyPartFrame(part: string): number {
        var partclip: GAF.GAFMovieClip = this.getBodyPart(part, '') || this.getBodyPart(part, 'F');
        return partclip.currentFrame;
    }

    public getBodyPartTotalFrame(part: string): number {
        var partclip: GAF.GAFMovieClip = this.getBodyPart(part, '') || this.getBodyPart(part, 'F');
        return partclip.totalFrames;
    }

    private getBodyPart(part: string, postfix: string): GAF.GAFMovieClip {
        return this.movieclip[part + postfix];
    }

    private _setBodyPart(part: string, postfix: string, frame: number): GAF.GAFMovieClip {
        var partclip: GAF.GAFMovieClip = this.getBodyPart(part, postfix);
        if (partclip) {
            partclip.gotoAndStop(frame);
        }
        return partclip;
    }

    private updatePartNodes(parent: GAF.GAFMovieClip, part: string, frame: number): void {
        var frameXML: Element = bodyPartsInfo.getPartFrameXML(part, frame);
        if (frameXML) {
            var allnodes: NodeListOf<Element> = frameXML.getElementsByTagName('node');
            var subParts: Map<string, number> = new Map<string, number>();
            for (var i: number = 0; i < allnodes.length; ++i) {
                let node: Element = allnodes[i];
                let nodeclip: GAF.GAFMovieClip = this.movieclip[node.getAttribute('part')];
                if (nodeclip) {

                    let pos: Point = Point.fromString(node.getAttribute('position'));
                    nodeclip.x = parent.x + pos.x;
                    nodeclip.y = parent.y + pos.y;

                    if (!subParts.has(nodeclip['part'])) {
                        subParts[nodeclip['part']] = nodeclip.currentFrame;
                        this.updatePartNodes(nodeclip, nodeclip['part'], nodeclip.currentFrame);
                    }
                }
            }
        }

    }

    public setSkinColor(color: number): void {
        this.skinColor.color = color;

        var allparts: Array<string> = bodyPartsInfo.getAllParts();
        for (let part of allparts) {
            this.updatePartSkinColor(part);
        }
    }

    private updatePartSkinColor(part: string): void {
        this.updatePartSkinClipColor(part, '');
        this.updatePartSkinClipColor(part, 'F');
        this.updatePartSkinClipColor(part, 'B');
    }

    private updatePartSkinClipColor(part: string, postfix: string): void {
        var partclip: GAF.GAFMovieClip = this.getBodyPart(part, postfix);
        if (partclip) {
            for (let child of partclip.children) {
                if (child instanceof GAF.GAFMovieClip) {
                    if(child instanceof GAF.GAFImage) {
                        (child as GAF.GAFImage).tint = this.skinColor.color;
                    } else {
                        for (let skin of child.children) {
                            if (skin.name && skin.name.startsWith('skin')) {
                                (skin as GAF.GAFImage).tint = this.skinColor.color;
                            }
                        }
                    }
                }
            }
        }
    }
}