import { GafButton } from './../framework/display/GafManager';
import { FW } from './../framework/Framework';
import { ObjectBase } from './../framework/ObjectBase';

FW.gafManager.addGafToLoad('interface', 'assets/gaf');

export class CoverScreen extends ObjectBase {

    static TOPIC = {
        BUTTON_START: "CoverScreen.ButtonStart"
    };

    private _sprite:GAF.GAFMovieClip;
    
    constructor() {
        super();
        this._sprite = FW.gafManager.createMovieClip('interface', 'lib_coverscreen');
        FW.root.addChild(this._sprite);

        var buttonStart:GafButton = new GafButton(this._sprite['buttonStart']);
        buttonStart.addListener(GafButton.EVENT.CLICK, () => {
            FW.postOffice.sendMessage("", CoverScreen.TOPIC.BUTTON_START);
        });
        buttonStart.addListener(GafButton.EVENT.DOWN, () => {
            FW.getSound('snd_mousedown').play();
        });
    }

}