
export class DragControl extends PIXI.utils.EventEmitter {

    static EVENT = {
        DRAG_START : "DragStart",
        DRAG_END : "DragEnd",
        DRAG_MOVE : "DragMove"
    };

    private _displayObject: PIXI.DisplayObject;

    private _dragging: boolean = false;

    private _dragShift:PIXI.Point;

    constructor(displayObject: PIXI.DisplayObject) {
        super();

        this._displayObject = displayObject;
        this._displayObject
            .on('mousedown', this.onDragStart, this)
            .on('touchstart', this.onDragStart, this)
            .on('mouseup', this.onDragEnd, this)
            .on('mouseupoutside', this.onDragEnd, this)
            .on('touchend', this.onDragEnd, this)
            .on('touchendoutside', this.onDragEnd, this)
            .on('mousemove', this.onDragMove, this)
            .on('touchmove', this.onDragMove, this);
    }

    public dispose():void {
        if(this._displayObject) {
            this._displayObject
            .removeListener('mousedown', this.onDragStart, this)
            .removeListener('touchstart', this.onDragStart, this)
            .removeListener('mouseup', this.onDragEnd, this)
            .removeListener('mouseupoutside', this.onDragEnd, this)
            .removeListener('touchend', this.onDragEnd, this)
            .removeListener('touchendoutside', this.onDragEnd, this)
            .removeListener('mousemove', this.onDragMove, this)
            .removeListener('touchmove', this.onDragMove, this);

            this._displayObject = null;
        }
    }

    public get dragging():boolean {
        return this._dragging;
    }

    private onDragStart(event: any): void {
        this._dragShift = event.data.getLocalPosition(this._displayObject.parent);
        this._dragShift.x -= this._displayObject.position.x;
        this._dragShift.y -= this._displayObject.position.y;
        this._dragging = true;
        this.emit(DragControl.EVENT.DRAG_START);
    }

    private onDragMove(event: any): void {
        if (this._dragging) {
            let newPosition = event.data.getLocalPosition(this._displayObject.parent);
            this._displayObject.position.x = newPosition.x - this._dragShift.x;
            this._displayObject.position.y = newPosition.y - this._dragShift.y;
            this.emit(DragControl.EVENT.DRAG_MOVE);
        }
    }

    private onDragEnd(): void {
        this._dragging = false;
        this.emit(DragControl.EVENT.DRAG_END);
    }
}