/**
 * Copyright (c) 2013 Azeem Arshad
 * See the file license.txt for copying permission.
 */

function LineProgram() {
    LineProgram.super.constructor.call(this, {
        copyOnSwap: true,
        vertexShader: [
            "attribute vec2 a_position;",
            "attribute vec3 a_color;",
            "varying vec3 v_color;",

            "void main() {",
            "   v_color = a_color;",
            "   setPosition(a_position);",
            "}"
        ],
        fragmentShader: [
            "varying vec3 v_color;",
            "void main() {",
            "   setFragColor(vec4(v_color,1));",
            "}"
        ]
    });
}
LineProgram = Webvs.defineClass(LineProgram, Webvs.ShaderProgram, {
    draw: function() {
        this.setVertexAttribArray(
            "a_position", 
            new Float32Array([
                0,  0,
                0, -0.5,
                0,  0,
                0, 0.5,
                0,  0,
                0.5, 0,
                0,  0,
                -0.5, 0,
            ])
        );
        this.setVertexAttribArray(
            "a_color",
            new Float32Array([
                1,  0, 0,
                1,  0, 0,
                0,  1, 0,
                0,  1, 0,
                0,  0, 1,
                0,  0, 1,
                1,  1, 0,
                1,  1, 0,
            ]), 
            3
        );
        this.gl.drawArrays(this.gl.LINES, 0, 8);
    }
});

CanvasTestWithFM("DynamicMovement NG Compat", 3,
    function(canvas, gl, fm, copier) {
        var lineProgram = new LineProgram();
        lineProgram.init(gl);

        var testValues = [
            [true, true, "data:image/png;base64,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"],
            [false, true, "data:image/png;base64,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"],
            [false, false, "data:image/png;base64,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"]
        ];

        var main = new DummyMain(canvas);
        var parent = new DummyParent(fm);

        _.each(testValues, function(values, index) {
            var dm = new Webvs.DynamicMovement(gl, main, parent, {
                noGrid: values[0],
                compat: values[1],
                code: {
                    perPixel: "d=sin(d*(1+d*sin(r*150)*.15))*.5+d*.5;r=r+.01;"
                }
            });

            fm.setRenderTarget();
            // clear
            gl.clearColor(0,0,0,1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            // do dynamic movement for 500 frames
            _.times(500, function() {
                lineProgram.run(fm, null);
                dm.draw();
            });
            fm.restoreRenderTarget();
            copier.run(null, null, fm.getCurrentTexture());
            dm.destroy();

            imageFuzzyOk("Dynamic Movement "+index, gl, canvas, values[2]);
        });

        lineProgram.cleanup();
    }
);

/*
TODO: fix this bug

CanvasTestWithFM("DynamicMovement Blend Artifact", 1, function(canvas, gl, fm, copier) {
    var main = new DummyMain(canvas);
    var parent = new DummyParent(fm);

    var dm = new Webvs.DynamicMovement(gl, main, parent, {
        coord: "POLAR",
        noGrid: true,
        compat: true,
        bFilter: true,
        code: {
            "perPixel": "r=r;d=d;"
        }
    });
    var cc = new Webvs.ColorClip(gl, main, parent, {
        mode: "ABOVE",
        color: "rgb(254,254,254)",
        outColor: "#FF0000",
    });

    fm.setRenderTarget();
    // clear
    gl.clearColor(1,1,1,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    dm.draw();
    cc.draw();

    fm.restoreRenderTarget();
    copier.run(null, null, fm.getCurrentTexture());
    dm.destroy();
    cc.destroy();

    imageFuzzyOk("Dynamicmovement blend artifact", gl, canvas, "");
});

*/
