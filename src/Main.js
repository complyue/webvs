/**
 * Copyright (c) 2013-2015 Azeem Arshad
 * See the file license.txt for copying permission.
 */

(function(Webvs) {

// Main Webvs object, that represents a running webvs instance.
function Main(options) {
    Webvs.checkRequiredOptions(options, ["canvas", "analyser"]);
    options = _.defaults(options, {
        showStat: false
    });
    this.canvas = options.canvas;
    this.msgElement = options.msgElement;
    this.analyser = options.analyser;
    this.isStarted = false;
    if(options.showStat) {
        var stats = new Stats();
        stats.setMode(0);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.right = '5px';
        stats.domElement.style.bottom = '5px';
        document.body.appendChild(stats.domElement);
        this.stats = stats;
    }

    this.meta = {};
    this._initResourceManager(options.resourcePrefix);
    this._registerContextEvents();
    this._initGl();
    this._setupRoot({id: "root"});
}
Webvs.Main = Webvs.defineClass(Main, Object, Webvs.ModelLike, {
    _initResourceManager: function(prefix) {
        var builtinPack = Webvs.ResourcePack;
        if(prefix) {
            builtinPack = _.clone(builtinPack);
            builtinPack.prefix = prefix;
        }
        this.rsrcMan = new Webvs.ResourceManager(builtinPack);
        this.listenTo(this.rsrcMan, "wait", this.handleRsrcWait);
        this.listenTo(this.rsrcMan, "ready", this.handleRsrcReady);

        var this_ = this;
    },

    _registerContextEvents: function() {
        var _this = this;

        this.canvas.addEventListener("webglcontextlost", function(event) {
            event.preventDefault();
           _this.stop();
        });

        this.canvas.addEventListener("webglcontextrestored", function(event) {
            _this.resetCanvas();
        });
    },

    _initGl: function() {
        try {
            this.gl = this.canvas.getContext("webgl", {alpha: false});
            this.copier = new Webvs.CopyProgram(this.gl, {dynamicBlend: true});
            this.buffers = new Webvs.FrameBufferManager(this.gl, this.copier, true, 0);
        } catch(e) {
            throw new Error("Couldnt get webgl context" + e);
        }
    },

    _setupRoot: function(preset) {
        this.registerBank = {};
        this.bootTime = (new Date()).getTime();
        this.rootComponent = new Webvs.EffectList(this.gl, this, null, preset);
    },

    _startAnimation: function() {
        var _this = this;
        var drawFrame = function() {
            _this.analyser.update();
            _this.rootComponent.draw();
            _this.animReqId = requestAnimationFrame(drawFrame);
        };

        // Wrap drawframe in stats collection if required
        if(this.stats) {
            var oldDrawFrame = drawFrame;
            drawFrame = function() {
                _this.stats.begin();
                oldDrawFrame.call(this, arguments);
                _this.stats.end();
            };
        }
        this.animReqId = requestAnimationFrame(drawFrame);
    },

    _stopAnimation: function() {
        cancelAnimationFrame(this.animReqId);
    },

    // Starts the animation if not already started
    start: function() {
        if(this.isStarted) {
            return;
        }
        this.isStarted = true;
        if(this.rsrcMan.ready) {
            this._startAnimation();
        }
    },

    // Stops the animation
    stop: function() {
        if(!this.isStarted) {
            return;
        }
        this.isStarted = false;
        if(this.rsrcMan.ready) {
            this._stopAnimation();
        }
    },

    // Loads a preset JSON. If a preset is already loaded and running, then
    // the animation is stopped, and the new preset is loaded.
    loadPreset: function(preset) {
        preset = _.clone(preset); // use our own copy
        preset.id = "root";
        this.rootComponent.destroy();

        // setup resources
        this.rsrcMan.clear();
        if("resources" in preset && "uris" in preset.resources) {
            this.rsrcMan.registerUri(preset.resources.uris);
        }

        // load meta
        this.meta = _.clone(preset.meta);

        this._setupRoot(preset);
    },

    // Reset all the components.
    resetCanvas: function() {
        var preset = this.rootComponent.generateOptionsObj();
        this.rootComponent.destroy();
        this.copier.cleanup();
        this.buffers.destroy();
        this._initGl();
        this._setupRoot(preset);
    },

    notifyResize: function() {
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        this.buffers.resize();
        this.trigger("resize", this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    },

    setAttribute: function(key, value, options) {
        if(key == "meta") {
            this.meta = value;
            return true;
        }
        return false;
    },

    get: function(key, value) {
        if(key == "meta") {
            return this.meta;
        }
    },

    // Generates and returns the instantaneous preset JSON 
    // representation
    toJSON: function() {
        var preset = this.rootComponent.toJSON();
        preset = _.pick(preset, "clearFrame", "components");
        preset.resources = this.rsrcMan.toJSON();
        preset.meta = _.clone(this.meta);
        return preset;
    },

    destroy: function() {
        this.stop();
        this.rootComponent.destroy();
        this.rootComponent = null;
        if(this.stats) {
            var statsDomElement = this.stats.domElement;
            statsDomElement.parentNode.removeChild(statsDomElement);
            this.stats = null;
        }
        this.rsrcMan.destroy();
        this.rsrcMan = null;
        this.stopListening();
    },

    // event handlers
    handleRsrcWait: function() {
        if(this.isStarted) {
            this._stopAnimation();
        }
    },
    
    handleRsrcReady: function() {
        if(this.isStarted) {
            this._startAnimation();
        }
    }
});

})(Webvs);




