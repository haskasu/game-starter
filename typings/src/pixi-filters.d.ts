declare namespace PIXI.filters {
    export class GlowFilter extends PIXI.Filter {

        constructor(distance?: number, outerStrength?: number, innerStrength?: number, color?: number, quality?: number);

        public color: number;
        public distance: number;
        public outerStrength: number;
        public innerStrength: number;
    }

    export class DropShadowFilter extends PIXI.Filter {

        constructor(rotation?: number, distance?: number, blur?: number, color?: number, alpha?: number);

        public color: number;
        public distance: number;
        public blur: number;
        public rotation: number;
        public alpha: number;
    }

    export class OutlineFilter extends PIXI.Filter {

        constructor(thickness?: number, color?: number);

        public color: number;
        public thickness: number;
    }
}