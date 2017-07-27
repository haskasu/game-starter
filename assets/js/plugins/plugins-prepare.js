window.PIXI = PIXI;
window.PIXI["default"] = PIXI;
var liquidfunReady = false;
var Module = { 
    onRuntimeInitialized: function() { 
        liquidfunReady = true;
    } 
}
