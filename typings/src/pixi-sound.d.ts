// Type definitions for PixiGAFPlayer
// Project: https://github.com/mathieuanthoine/PixiGAFPlayer
// Definitions by: Haska Su <https://github.com/haskasu/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare namespace PIXI.sound {

    // Sound sprite data setup
    export interface SoundSpriteData {
        start: number;
        end: number;
        speed?: number;
    }

    /**
 * Represents the audio context for playing back sounds. This can 
 * represent either an HTML or WebAudio context.
 * @class IMediaContext
 * @memberof PIXI.sound
 */
    export interface IMediaContext {
        /**
         * `true` if all sounds are muted
         * @member {boolean} PIXI.sound.IMediaContext#muted
         */
        muted: boolean;

        /**
         * Volume to apply to all sounds
         * @member {number} PIXI.sound.IMediaContext#volume
         */
        volume: number;

        /**
         * The speed of all sounds
         * @member {number} PIXI.sound.IMediaContext#speed
         */
        speed: number;

        /**
         * Set the paused state for all sounds
         * @member {boolean} PIXI.sound.IMediaContext#paused
         */
        paused: boolean;

        /**
         * Collection of global filters
         * @member {Array<PIXI.sound.filters.Filter>} PIXI.sound.IMediaContext#filters
         */
        filters: Filter[];

        /**
         * Toggle mute for all sounds
         * @method PIXI.sound.IMediaContext#toggleMute
         */
        toggleMute(): boolean;

        /**
         * Toggle pause for all sounds
         * @method PIXI.sound.IMediaContext#togglePause
         */
        togglePause(): boolean;

        /**
         * Dispatch event to refresh all instances volume, mute, etc.
         * @method PIXI.sound.IMediaContext#refresh
         * @private
         */
        refresh(): void;

        /**
         * Destroy the context and don't use after this.
         * @method PIXI.sound.IMediaContext#destroy
         */
        destroy(): void;

        /**
         * Reference to the Web Audio API AudioContext element, if Web Audio is available
         * @member {AudioContext} PIXI.sound.IMediaContext#audioContext
         */
        audioContext: AudioContext;
    }

    /**
 * Interface represents either a WebAudio source or an HTML5 AudioElement source
 * @class IMedia
 * @memberof PIXI.sound
 * @private
 */
    export interface IMedia {

        /**
         * Collection of global filters
         * @member {Array<PIXI.sound.filters.Filter>} PIXI.sound.IMedia#filters
         */
        filters: Filter[];

        /**
         * Reference to the context.
         * @member {PIXI.sound.IMediaContext} PIXI.sound.IMedia#context
         * @readonly
         */
        readonly context: IMediaContext;

        /**
         * Length of sound in seconds.
         * @member {number} PIXI.sound.IMedia#duration
         * @readonly
         */
        readonly duration: number;

        /**
         * Flag to check if sound is currently playable (e.g., has been loaded/decoded).
         * @member {boolean} PIXI.sound.IMedia#isPlayable
         * @readonly
         */
        readonly isPlayable: boolean;

        // Internal methods
        create(): IMediaInstance;
        init(sound: Sound): void;
        load(callback?: LoadedCallback): void;
        destroy(): void;
    }

    export interface IMediaInstance {
        /**
         * Auto-incrementing ID for the instance.
         * @member {number} PIXI.sound.IMediaInstance#id
         */
        id: number;

        /**
         * Current progress of the sound from 0 to 1
         * @member {number} PIXI.sound.IMediaInstance#progress
         */
        progress: number;

        /**
         * If the instance is paused, if the sound or global context
         * is paused, this could still be false.
         * @member {boolean} PIXI.sound.IMediaInstance#paused
         */
        paused: boolean;

        /**
         * Current volume of the instance. This is not the actual volume
         * since it takes into account the global context and the sound volume.
         * @member {number} PIXI.sound.IMediaInstance#volume
         */
        volume: number;

        /**
         * Current speed of the instance. This is not the actual speed
         * since it takes into account the global context and the sound volume.
         * @member {number} PIXI.sound.IMediaInstance#speed
         */
        speed: number;

        /**
         * If the current instance is set to loop
         * @member {boolean} PIXI.sound.IMediaInstance#loop
         */
        loop: boolean;

        /**
         * Set the muted state of the instance
         * @member {boolean} PIXI.sound.IMediaInstance#muted
         */
        muted: boolean;

        /**
         * Stop the current instance from playing.
         * @method PIXI.sound.IMediaInstance#stop
         */
        stop(): void;

        /**
         * Fired when the sound finishes playing.
         * @event PIXI.sound.IMediaInstance#end
         */

        /**
         * Fired when the sound starts playing.
         * @event PIXI.sound.IMediaInstance#start
         */

        /**
         * Fired when the sound when progress updates.
         * @event PIXI.sound.IMediaInstance#progress
         * @param {number} progress - Playback progress from 0 to 1
         * @param {number} duration - The total number of seconds of audio
         */

        /**
         * Fired when paused state changes.
         * @event PIXI.sound.IMediaInstance#pause
         * @param {boolean} paused - If the current state is paused
         */

        /**
         * Fired when instance is paused.
         * @event PIXI.sound.IMediaInstance#paused
         */

        /**
         * Fired when instance is resumed.
         * @event PIXI.sound.IMediaInstance#resumed
         */

        // These are used for typescript only and
        // are not accessible or part of the public API
        refresh(): void;
        refreshPaused(): void;
        init(parent: IMedia): void;
        play(options: PlayOptions): void;
        destroy(): void;
        toString(): string;
        once(event: string, fn: Function, context?: any): PIXI.utils.EventEmitter;
    }

    export class SoundSprite {
        constructor(parent: Sound, options: Object);

        public destroy(): void;
        public play(complete: CompleteCallback): SoundInstance | Promise<SoundInstance>;

        public duration: number;
        public end: number;
        public parent: Sound;
        public speed: number;
        public start: number;
    }

    export class SoundInstance {

        public destroy(): void;
        public play(start?: number, end?: number, speed?: number, loop?: boolean, fadeIn?: number, fadeOut?: number): void;
        public stop(): void;

        public id: string;
        public paused: boolean;
        public progress: number;

    }


    // Constructor options
    export interface Options {
        autoPlay?: boolean;
        preaload?: boolean;
        singleInstance?: boolean;
        volume?: number;
        speed?: number;
        complete?: CompleteCallback;
        loaded?: LoadedCallback;
        preload?: boolean;
        loop?: boolean;
        url?: string;
        source?: ArrayBuffer | HTMLAudioElement;
        sprites?: { [id: string]: SoundSpriteData };
    }

    // Interface for play options
    export interface PlayOptions {
        start?: number;
        end?: number;
        speed?: number;
        loop?: boolean;
        volume?: number;
        sprite?: string;
        muted?: boolean;
        complete?: CompleteCallback;
        loaded?: LoadedCallback;
    }

    /**
     * Callback when sound is loaded.
     * @callback PIXI.sound.Sound~loadedCallback
     * @param {Error} err The callback error.
     * @param {PIXI.sound.Sound} sound The instance of new sound.
     * @param {PIXI.sound.IMediaInstance} instance The instance of auto-played sound.
     */
    export type LoadedCallback = (err: Error, sound?: Sound, instance?: IMediaInstance) => void;

    /**
     * Callback when sound is completed.
     * @callback PIXI.sound.Sound~completeCallback
     * @param {PIXI.sound.Sound} sound The instance of sound.
     */
    export type CompleteCallback = (sound: Sound) => void;

    export class Sound {

        public static from(url: string): Sound;

        public addSprites(alias: string, data: Object): SoundSprite;
        public addSprites(data: Object): Object;
        public removeSprites(): Sound;
        public removeSprites(alias: string): Sound;

        public pause(): Sound;
        public play(options?: PlayOptions): SoundInstance | Promise<SoundInstance>;
        public play(alias: string, data: Object, callback?: CompleteCallback): SoundInstance | Promise<SoundInstance>;
        public resume(): Sound;
        public stop(): Sound;

        public duration: number;
        public isLoaded: boolean;
        public isPlayable: boolean;
        public isPlaying: boolean;
        public loop: boolean;
        public preload: boolean;
        public singleInstance: boolean;
        public speed: number;
        public sprites: Object;
        public src: string;
        public srcBuffer: ArrayBuffer;
        public useXHR: boolean;
        public volume: number;

    }


}