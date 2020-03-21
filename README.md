Dumper
=======

Small web app to dump the pixel values of PNG images and convert them to index values in a color palette (look-up table).

Installation
------------

You will need to open it within a web server (because of CORS issues, it can't be opened as a local file). You can try it here: [Dumper (enDavid)](http://endavid.com/dumper/html/dumper.html)

Alternatively, you can install it as a Chrome plugin. Just point to the location of the `html` folder when adding it as a extension.

Supported formats
-----------------

Only PNG at the moment.

I'm not relying on the browser to read images, but using an external library, `PNGreader.js`. The reason for this is because the browser applies a color transformation, so if you try to read the values from a `canvas`, their values will be transformed based on the color space. Instead, I want to read raw values.

Development
-----------

### Style

We target ECMAScript 2016 (or ES7), so we can use all modern syntactic sugar. Older versions of Javascript are not supported.
Use ESLint to get the style right. I'm using AirBnB Javascript style as base. To install it, install Node.js first. Then, from the console, run `npm install` inside the root directory of this repository.

Preferred style:

* Declare classes with the `class` keyword, never with `function`.
* Keep files shorter than 500 lines. If they grow bigger, try to split the files in modules.
* Prefer modules and avoid the old `(function(global) {})(this);` wrapping construct.
* Prefer *readability* over backwards-compatibiliy.
* Use `Promises` for async operations, with the only exception of things that do not need to be waited for. For instance, images are loaded asynchronously, but we don't need to wait for them to be ready (for a WebGL texture to be created). A model can be loaded and displayed with a default white texture, and as images get loaded, the textures will appear.
* Use `async` and `await` syntactic sugar for Promises.
* Unfortunately, *Workers* do not support modules at the moment, so code involving workers will look uglier. Try to make the `Worker` code as independent as possible (even if it means copy-pasting a couple of already existing functions).

Comments about some of the custom rules in the ESLint config file:

* `"imports/extensions": 0`. This is disabled because the [so-called “bare” module specifiers are currently not supported](https://developers.google.com/web/fundamentals/primers/modules). There's a [complaint about this in AirBnB repo](https://github.com/airbnb/javascript/issues/1592).
* `"lines-between-class-members": 0`. IDEs make code pretty enough these days, so member functions are already easy to spot since they appear in a different color. No need to add extra spaces.

### Architecture

The code is roughly divided into 2 main blocks: UI and rendering. All the UI is created throw `controls.js`, with some helpers from `uiutils.js`. The canvas logic is inside `dumperCanvas.js`.
