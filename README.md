async-require
=============
[![Build Status](https://travis-ci.org/dmitriiabramov/async-require.svg?branch=master)](https://travis-ci.org/dmitriiabramov/async-require)

```javascript
// app.js
//= require_lib
//= require ./submodule.js

exports.f = function () { return 'app'; };
```

```javascript
// submodule.js
exports.f = function () { return 'submodule'; };
```

```html
<script src="http://localhost:6969/app.js></script>
<script>
    var app = require('app.js'),
        submodule = require('submodule.js');
    console.log(app.f());
    console.log(submodule.f());
</script>
```


### development
```shell
make install && make dev
```

### run all tests
```shell
make test
```

### watch mocha test
```shell
make watch_mocha
```

### run karma tests
```shell
brew install phantomjs
make karma
```

##### Features TODO
- Q => ES-6 Promises
- multiple paths
- get rid of mutable config
- parse directives differently for different file types
- production build
- generate layered build config file automatically (which package cantains required module)
- heartbeat
- ~~unified API for serving assets~~
- ~~throw error in main thread (main app) on compile error (coffee/hamlc)~~
- ~~`require ./file.js wrap_in_module`~~
- ~~make module names relative paths~~
- ~~compile coffee/hamlc~~
- ~~'require_tree' && 'require_directory' directives~~

##### API

1. getAssetList(paths, filePath)
    @param paths {Array} of absolute directory paths for lookup
    @param filePath {String} relative path to a single js file

2. getASset(paths, filePath, preprocessors)
    @param paths {Array} of absolute directory paths for lookup
    @param filePath {String} relative path to a single js file
    @param [preprocessors] {Object} hash-map of preprocessor name as
        keys and booleans as values for enabling/disabling preprocessors

3. getBuild()
    TODO
