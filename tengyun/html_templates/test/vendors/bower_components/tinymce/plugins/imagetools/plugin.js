(function () {

var defs = {}; // id -> {dependencies, definition, instance (possibly undefined)}

// Used when there is no 'main' module.
// The name is probably (hopefully) unique so minification removes for releases.
var register_3795 = function (id) {
  var module = dem(id);
  var fragments = id.split('.');
  var target = Function('return this;')();
  for (var i = 0; i < fragments.length - 1; ++i) {
    if (target[fragments[i]] === undefined)
      target[fragments[i]] = {};
    target = target[fragments[i]];
  }
  target[fragments[fragments.length - 1]] = module;
};

var instantiate = function (id) {
  var actual = defs[id];
  var dependencies = actual.deps;
  var definition = actual.defn;
  var len = dependencies.length;
  var instances = new Array(len);
  for (var i = 0; i < len; ++i)
    instances[i] = dem(dependencies[i]);
  var defResult = definition.apply(null, instances);
  if (defResult === undefined)
     throw 'module [' + id + '] returned undefined';
  actual.instance = defResult;
};

var def = function (id, dependencies, definition) {
  if (typeof id !== 'string')
    throw 'module id must be a string';
  else if (dependencies === undefined)
    throw 'no dependencies for ' + id;
  else if (definition === undefined)
    throw 'no definition function for ' + id;
  defs[id] = {
    deps: dependencies,
    defn: definition,
    instance: undefined
  };
};

var dem = function (id) {
  var actual = defs[id];
  if (actual === undefined)
    throw 'module [' + id + '] was undefined';
  else if (actual.instance === undefined)
    instantiate(id);
  return actual.instance;
};

var req = function (ids, callback) {
  var len = ids.length;
  var instances = new Array(len);
  for (var i = 0; i < len; ++i)
    instances.push(dem(ids[i]));
  callback.apply(null, callback);
};

var ephox = {};

ephox.bolt = {
  module: {
    api: {
      define: def,
      require: req,
      demand: dem
    }
  }
};

var define = def;
var require = req;
var demand = dem;
// this helps with minificiation when using a lot of global references
var defineGlobal = function (id, ref) {
  define(id, [], function () { return ref; });
};
/*jsc
["tinymce/imagetoolsplugin/Plugin","global!tinymce.PluginManager","global!tinymce.Env","global!tinymce.util.Promise","global!tinymce.util.URI","global!tinymce.util.Tools","global!tinymce.util.Delay","ephox/imagetools/api/ImageTransformations","ephox/imagetools/api/BlobConversions","tinymce/imagetoolsplugin/Dialog","tinymce/imagetoolsplugin/ImageSize","tinymce/imagetoolsplugin/Proxy","ephox/imagetools/transformations/Filters","ephox/imagetools/transformations/ImageTools","ephox/imagetools/util/Conversions","global!tinymce.dom.DOMUtils","global!tinymce.ui.Factory","global!tinymce.ui.Form","global!tinymce.ui.Container","tinymce/imagetoolsplugin/ImagePanel","tinymce/imagetoolsplugin/UndoStack","tinymce/imagetoolsplugin/Utils","ephox/imagetools/util/Canvas","ephox/imagetools/util/ImageSize","ephox/imagetools/util/Promise","ephox/imagetools/util/Mime","ephox/imagetools/transformations/ColorMatrix","ephox/imagetools/transformations/ImageResizerCanvas","global!tinymce.ui.Control","global!tinymce.ui.DragHelper","global!tinymce.geom.Rect","tinymce/imagetoolsplugin/CropRect","global!tinymce.dom.DomQuery","global!tinymce.util.Observable","global!tinymce.util.VK"]
jsc*/
defineGlobal("global!tinymce.PluginManager", tinymce.PluginManager);
defineGlobal("global!tinymce.Env", tinymce.Env);
defineGlobal("global!tinymce.util.Promise", tinymce.util.Promise);
defineGlobal("global!tinymce.util.URI", tinymce.util.URI);
defineGlobal("global!tinymce.util.Tools", tinymce.util.Tools);
defineGlobal("global!tinymce.util.Delay", tinymce.util.Delay);
/**
 * Canvas.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Contains various canvas functions.
 */
define("ephox/imagetools/util/Canvas", [], function() {
  function create(width, height) {
    return resize(document.createElement('canvas'), width, height);
  }

  function get2dContext(canvas) {
    return canvas.getContext("2d");
  }

  function get3dContext(canvas) {
      var gl = null;
      try {
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      }
      catch(e) {}

      if (!gl) { // it seems that sometimes it doesn't throw exception, but still fails to get context
        gl = null;
      }
      return gl;
  }

  function resize(canvas, width, height) {
    canvas.width = width;
    canvas.height = height;

    return canvas;
  }

  return {
    create: create,
    resize: resize,
    get2dContext: get2dContext,
    get3dContext: get3dContext
  };
});
/**
 * ImageSize.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Returns the size of images.
 */
define("ephox/imagetools/util/ImageSize", [], function() {
  function getWidth(image) {
    return image.naturalWidth || image.width;
  }

  function getHeight(image) {
    return image.naturalHeight || image.height;
  }

  return {
    getWidth: getWidth,
    getHeight: getHeight
  };
});
/**
 * Promise.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * Promise polyfill under MIT license: https://github.com/taylorhakes/promise-polyfill
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/* eslint-disable */
/* jshint ignore:start */

/**
 * Modifed to be a feature fill and wrapped as tinymce module.
 */
define("ephox/imagetools/util/Promise", [], function() {
  if (window.Promise) {
    return window.Promise;
  }

  // Use polyfill for setImmediate for performance gains
  var asap = Promise.immediateFn || (typeof setImmediate === 'function' && setImmediate) ||
    function(fn) { setTimeout(fn, 1); };

  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function() {
      fn.apply(thisArg, arguments);
    };
  }

  var isArray = Array.isArray || function(value) { return Object.prototype.toString.call(value) === "[object Array]"; };

  function Promise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = null;
    this._value = null;
    this._deferreds = [];

    doResolve(fn, bind(resolve, this), bind(reject, this));
  }

  function handle(deferred) {
    var me = this;
    if (this._state === null) {
      this._deferreds.push(deferred);
      return;
    }
    asap(function() {
      var cb = me._state ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (me._state ? deferred.resolve : deferred.reject)(me._value);
        return;
      }
      var ret;
      try {
        ret = cb(me._value);
      }
      catch (e) {
        deferred.reject(e);
        return;
      }
      deferred.resolve(ret);
    });
  }

  function resolve(newValue) {
    try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === this) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (typeof then === 'function') {
          doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
          return;
        }
      }
      this._state = true;
      this._value = newValue;
      finale.call(this);
    } catch (e) { reject.call(this, e); }
  }

  function reject(newValue) {
    this._state = false;
    this._value = newValue;
    finale.call(this);
  }

  function finale() {
    for (var i = 0, len = this._deferreds.length; i < len; i++) {
      handle.call(this, this._deferreds[i]);
    }
    this._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, resolve, reject){
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.resolve = resolve;
    this.reject = reject;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, onFulfilled, onRejected) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        onFulfilled(value);
      }, function (reason) {
        if (done) return;
        done = true;
        onRejected(reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      onRejected(ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function(onFulfilled, onRejected) {
    var me = this;
    return new Promise(function(resolve, reject) {
      handle.call(me, new Handler(onFulfilled, onRejected, resolve, reject));
    });
  };

  Promise.all = function () {
    var args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      var remaining = args.length;
      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) { res(i, val); }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }
      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for(var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  return Promise;
});

/* jshint ignore:end */
/* eslint-enable */
/**
 * Mime.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Returns mime types for uris.
 */
define("ephox/imagetools/util/Mime", [], function() {
  function getUriPathName(uri) {
    var a = document.createElement('a');

    a.href = uri;

    return a.pathname;
  }

  function guessMimeType(uri) {
    var parts = getUriPathName(uri).split('.'),
      ext = parts[parts.length - 1],
      mimes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png'
      };

    if (ext) {
      ext = ext.toLowerCase();
    }

    return mimes[ext];
  }

  return {
    guessMimeType: guessMimeType
  };
});
/**
 * Conversions.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Converts blob/uris/images back and forth.
 */
define("ephox/imagetools/util/Conversions", [
  "ephox/imagetools/util/Promise",
  "ephox/imagetools/util/Canvas",
  "ephox/imagetools/util/Mime",
  "ephox/imagetools/util/ImageSize"
], function(Promise, Canvas, Mime, ImageSize) {
  function loadImage(image) {
    return new Promise(function(resolve) {
      function loaded() {
        image.removeEventListener('load', loaded);
        resolve(image);
      }

      if (image.complete) {
        resolve(image);
      } else {
        image.addEventListener('load', loaded);
      }
    });
  }

  function imageToCanvas(image) {
    return loadImage(image).then(function(image) {
      var context, canvas;

      canvas = Canvas.create(ImageSize.getWidth(image), ImageSize.getHeight(image));
      context = Canvas.get2dContext(canvas);
      context.drawImage(image, 0, 0);

      return canvas;
    });
  }

  function imageToBlob(image) {
    return loadImage(image).then(function(image) {
      var src = image.src;

      if (src.indexOf('blob:') === 0) {
        return blobUriToBlob(src);
      }

      if (src.indexOf('data:') === 0) {
        return dataUriToBlob(src);
      }

      return imageToCanvas(image).then(function(canvas) {
        return dataUriToBlob(canvas.toDataURL(Mime.guessMimeType(src)));
      });
    });
  }

  function blobToImage(blob) {
    return new Promise(function(resolve) {
      var image = new Image();

      function loaded() {
        image.removeEventListener('load', loaded);
        resolve(image);
      }

      image.addEventListener('load', loaded);
      image.src = URL.createObjectURL(blob);

      if (image.complete) {
        loaded();
      }
    });
  }

  function blobUriToBlob(url) {
    return new Promise(function(resolve) {
      var xhr = new XMLHttpRequest();

      xhr.open('GET', url, true);
      xhr.responseType = 'blob';

      xhr.onload = function() {
        if (this.status == 200) {
          resolve(this.response);
        }
      };

      xhr.send();
    });
  }

  function dataUriToBlob(uri) {
    return new Promise(function(resolve) {
      var str, arr, i, matches, type, blobBuilder;

      uri = uri.split(',');

      matches = /data:([^;]+)/.exec(uri[0]);
      if (matches) {
        type = matches[1];
      }

      str = atob(uri[1]);

      if (window.WebKitBlobBuilder) {
        /*globals WebKitBlobBuilder:false */
        blobBuilder = new WebKitBlobBuilder();

        arr = new ArrayBuffer(str.length);
        for (i = 0; i < arr.length; i++) {
          arr[i] = str.charCodeAt(i);
        }

        blobBuilder.append(arr);

        resolve(blobBuilder.getBlob(type));
        return;
      }

      arr = new Uint8Array(str.length);

      for (i = 0; i < arr.length; i++) {
        arr[i] = str.charCodeAt(i);
      }

      resolve(new Blob([arr], {type: type}));
    });
  }

  function uriToBlob(url) {
    if (url.indexOf('blob:') === 0) {
      return blobUriToBlob(url);
    }

    if (url.indexOf('data:') === 0) {
      return dataUriToBlob(url);
    }

    return null;
  }

  function canvasToBlob(canvas, type) {
    return dataUriToBlob(canvas.toDataURL(type));
  }

  function blobToDataUri(blob) {
    return new Promise(function(resolve) {
      var reader = new FileReader();

      reader.onloadend = function() {
        resolve(reader.result);
      };

      reader.readAsDataURL(blob);
    });
  }

  function blobToBase64(blob) {
    return blobToDataUri(blob).then(function(dataUri) {
      return dataUri.split(',')[1];
    });
  }

  function revokeImageUrl(image) {
    URL.revokeObjectURL(image.src);
  }

  return {
    // used outside
    blobToImage: blobToImage,
    // used outside
    imageToBlob: imageToBlob,
    // used outside
    blobToDataUri: blobToDataUri,
    // used outside
    blobToBase64: blobToBase64,

    // helper method
    imageToCanvas: imageToCanvas,

    // helper method
    canvasToBlo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                