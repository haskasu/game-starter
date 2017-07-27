// Type definitions for PixiGAFPlayer
// Project: https://github.com/mathieuanthoine/PixiGAFPlayer
// Definitions by: Haska Su <https://github.com/haskasu/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare namespace GAF {
    export class ZipToGAFAssetConverter {
        public once(event:string, fn: (event:GAFEvent) => void, context?: any): this;
        public convert(loader:GAFLoader):void;
    }

    export class GAFLoader extends PIXI.loaders.Loader {
        public addGAFFile(url:string):void;
    }

    export class GAFEvent {
        static COMPLETE:string;
    }

    export class GAFTimeline {
        
    }

    export class GAFBundle {
        
        public getGAFTimeline(gafName:string, linkage:string):GAFTimeline;
    }

    export class GAFContainer extends PIXI.Container {

    }

    export class GAFMovieClip extends GAFContainer {

        constructor(gafTimeline:GAFTimeline);

        public setSequence(sequence:string, loop:boolean):void;

        public play(applyToAllChildren:boolean):void;

        public stop(applyToAllChildren:boolean):void;

        public gotoAndStop(frame:any):void;

        public gotoAndPlay(frame:any):void;
    }

    export class GAFImage extends PIXI.Sprite {
        
    }

    export class GAFTextField extends GAFContainer {
        public copy():GAFTextField;
        public cloneTextFormat():PIXI.TextStyle;

        public setFilterConfig(value:any, scale:number):void;

        public set_text(value:string):string;
        public get_text():string;

        public get_textWidth():number;
        public get_textHeight():number;

        public get_style():PIXI.TextStyle;
    }
}