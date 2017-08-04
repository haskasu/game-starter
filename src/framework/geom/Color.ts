export class Color {
    constructor(public color:number = 0, public alpha:number = 1) {

    }

    public get red():number {
        return this.color >> 16;
    }

    public get green():number {
        return (this.color & 0xFF00) >> 8;
    }

    public get blue():number {
        return this.color & 0xFF;
    }

    public tintMatrix(percent:number):Array<number> {
        var rpercent:number = 1 - percent;
        return [
            rpercent, 0, 0, 0, this.red * percent,
            0, rpercent, 0, 0, this.green * percent,
            0, 0, rpercent, 0, this.blue * percent,
            0, 0, 0, this.alpha, 0,
        ];

    }
}