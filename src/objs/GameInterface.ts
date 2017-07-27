import { GafButton } from './../framework/display/GafManager';
import { FW } from './../framework/Framework';
import { ObjectBase } from './../framework/ObjectBase';

FW.gafManager.addGafToLoad('interface', 'assets/gaf');
FW.addPreloadResource('snd_mousedown', 'assets/sounds/g_button_click.mp3');

export class GameInterface extends ObjectBase {

    static TOPIC = {
        BUTTON_BACK: "GameInterface.ButtonBack"
    };

    private _sprite:GAF.GAFMovieClip;

    constructor() {
        super();
        this._sprite = FW.gafManager.createMovieClip('interface', 'lib_interface');
        this.setScore(0);
        FW.root.addChild(this._sprite);

        var buttonBack:GafButton = new GafButton(this._sprite['buttonBack']);
        buttonBack.addListener(GafButton.EVENT.CLICK, () => {
            FW.postOffice.sendMessage("", GameInterface.TOPIC.BUTTON_BACK);
        });
        buttonBack.addListener(GafButton.EVENT.DOWN, () => {
            FW.getSound('snd_mousedown').play();
        });
    }

    public setScore(value:number):void {
        var str:string = value.toLocaleString();
        while(str.length < 4) {
            str = "0" + str;
        }
        this._sprite['scoreField'].set_text(str);
    }
}