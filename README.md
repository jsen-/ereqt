# ereqt

Enhanced REQquire of Typescript

Allows you to use all bleeding edge typescript features - for which only ES6 target is available - in nodejs, keeping the source map debugging support.

When you require a `.ts` file, it is transpiled on the fly and cached to keep resonable performace.

The first compilation step is through TypeScript (with `tsconfig.json` support) targetting ES6.

Second compilation step is through Babel (with `.babelrc` support)

As a third step, the results are ran through [sorcery](https://github.com/Rich-Harris/sorcery) which maps the last source map in the chain to the original source file.


## installation

```
npm install --save-dev ereqt
```
or just
```
npm i -D ereqt
```


## usage

This is somewhat complicated due to the current state of debuggers in the wild.

Debugging is only confirmed working on Visual Studio 2015 Community (RC and above) with `iojs` or `nodejs v4.0.0` .

- create new `.ts` file eg.: [dev.ts](files/dev.ts) with the following contents:

	```
	require('ereqt/register');
	setTimeout(function() {		// should fix a bug which causes all breakpoints being ignored in synchronous code on startup
		require('./index'); 	// update to the actual application antry point
	}, 200);
	```
- set it as an application entry point in your IDE ("Set as Node.js Startup File" in VS)

- create [.ereqt.json](files/.ereqt.json) in your project root:

	```
	{
		"cacheDir": ".cache"
	}
	```
	Everytime a typescript file is `require`d, this file is looked up upwards in the file system tree starting in the location of the `require`d file.
	If the file is not found, you'll get a warning and the resulting file will have to be recompiled the next time program runs.
	The resulting source map will be inlined, but the debugging might not work anyway.

- set breakpoints and start debugging :)

**Note:** Production use is not recommended.


## Contribute

I'm currently looking for ways to enable the debugging support in other IDEs.
Any ideas are welcome. If you find a way to make it work in other IDEs/debuggers (code, IntelliJ IDEA, WebStorm, node-inspector, iron-node, etc.), please submit an issue or pull request.

Current version is far from feature complete, so please submit an issue with your ideas.


## Recommendations
Blacklist `regenerator` in your [.babelrc](files/.babelrc) - node supports generators for quite some time now and it makes debugging of async functions much easier
