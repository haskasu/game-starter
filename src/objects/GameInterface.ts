import { SetBodyPartAction } from './../actions/SetBodyPartAction';
import { bodyPartsInfo } from './BodyPartsInfo';
import { GafButton } from './../framework/display/GafManager';
import { FW } from './../framework/Framework';
import { ObjectBase } from './../framework/ObjectBase';

FW.gafManager.addGafToLoad('interface', 'assets/gaf');
FW.addPreloadResource('snd_mousedown', 'assets/sounds/g_button_click.mp3');

export class GameInterface extends ObjectBase {

    static TOPIC = {
        BUTTON_BACK: "GameInterface.ButtonBack",
        BUTTON_PART_PREV: "GameInterface.ButtonPrev",
        BUTTON_PART_NEXT: "GameInterface.ButtonNext"
    };

    private _sprite: GAF.GAFMovieClip;

    constructor() {
        super();
        this._sprite = FW.gafManager.createMovieClip('interface', 'lib_interface');
        FW.root.addChild(this._sprite);

        var buttonBack: GafButton = new GafButton(this._sprite['buttonBack']);
        buttonBack.addListener(GafButton.EVENT.CLICK, () => {
            FW.postOffice.sendMessage("", GameInterface.TOPIC.BUTTON_BACK);
        });
        buttonBack.addListener(GafButton.EVENT.DOWN, () => {
            FW.getSound('snd_mousedown').play();
        });

        var allparts:Array<string> = bodyPartsInfo.getAllParts();
        for (let part of allparts) {
            this.setupPartButtons(part);
        }

    }

    private setupPartButtons(part: string): void {
        let clipPrev: GAF.GAFMovieClip = this._sprite['button_' + part + '_prev'];
        if (clipPrev) {
            let buttonPrev:GafButton = new GafButton(clipPrev);
            buttonPrev.addListener(GafButton.EVENT.CLICK, () => {
                new SetBodyPartAction({part: part, deltaFrame: -1}).execute();
            });
        }
        let clipNext: GAF.GAFMovieClip = this._sprite['button_' + part + '_next'];
        if (clipNext) {
            let buttonNext:GafButton = new GafButton(clipNext);
            buttonNext.addListener(GafButton.EVENT.CLICK, () => {
                new SetBodyPartAction({part: part, deltaFrame: 1}).execute();
            });
        }
    }

}