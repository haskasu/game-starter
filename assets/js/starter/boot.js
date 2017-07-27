function bootSystemJs() {
    SystemJS.config({
        packages: {
            "ts": {
                "main": "plugin.js",
                "format": "register"
            },
            "typescript": {
                "main": "typescript.js",
                "meta": {
                    "typescript.js": {
                        "exports": "ts"
                    }
                }
            },
            "src": {
                defaultExtension: 'ts',
                main: 'app.ts'
            }
        },
        typescriptOptions: {
            "module": "system",
            "noImplicitAny": true,
            "tsconfig": true
        },
        map: {
            "ts": "static/js/ts",
            "typescript": "static/js/typescript",
            'plugin-babel': 'static/js/babel/plugin-babel.js',
            'systemjs-babel-build': 'static/js/babel/systemjs-babel-browser.js'

        },
        transpiler: 'ts'
    });

    function postTranspile(m) {
    }
    System
        .import(window.entryTs || 'src/app.ts')
        .then(postTranspile, console.error.bind(console));
}