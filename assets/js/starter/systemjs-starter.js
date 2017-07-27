(function ($) { 
    $.getScript("static/js/system.js", function() {
        $.loadPlugins(bootSystemJs);
    });
})($);