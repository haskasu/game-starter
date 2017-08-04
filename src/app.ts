import { FullBody } from './objs/FullBody';
import { CallbackAction } from './actions/CallbackAction';
import { PostTrigger } from './checks/PostTrigger';
import { ClearRootAction } from './actions/ClearRootAction';
import { CoverScreen } from './objects/CoverScreen';
import { GameInterface } from './objects/GameInterface';
import { CreateObjectAction } from './actions/CreateObjectAction';
import { FW, Framework } from './framework/Framework';

class App {

    constructor() {
        FW.initialize(480, 640, true);
        FW.renderer.backgroundColor = 0x999999;
        FW.once(Framework.EVENT.PRELOAD_COMPLETE, this.onAssetsLoaded, this);
    }

    onAssetsLoaded() {
        console.log("app started");
        this.openGameScreen();
    }

    openCoverScreen():void {
        FW.incidentsManager.reset();

        FW.incidentsManager.createIncident('createCoverScreen')
        .addAction(new ClearRootAction())
        .addAction(new CreateObjectAction({objectClass: CoverScreen}))
        ;

        FW.incidentsManager.createIncident('gameStart')
        .addCheck(new PostTrigger({topic: CoverScreen.TOPIC.BUTTON_START}))
        .addAction(new CallbackAction({callbackOwner: this, callback: this.openGameScreen, delay: true}))
        ;


        FW.incidentsManager.start();
    }

    openGameScreen():void {
        FW.incidentsManager.reset();

        FW.incidentsManager.createIncident('createGameScreen')
        .addAction(new ClearRootAction())
        .addAction(new CreateObjectAction({objectClass: FullBody}))
        .addAction(new CreateObjectAction({objectClass: GameInterface}))
        ;

        FW.incidentsManager.createIncident('backFromGame')
        .addCheck(new PostTrigger({topic: GameInterface.TOPIC.BUTTON_BACK}))
        .addAction(new CallbackAction({callbackOwner: this, callback: this.openCoverScreen, delay: true}))
        ;

        FW.incidentsManager.start();
    }

}
export const app:App = new App();