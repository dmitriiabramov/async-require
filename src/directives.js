/**
 * module is a container for multiple {Directive}s
 */
var config = require('./config.js'),
    Directive = require('./directive.js'),
    Promise = require('es6-promise').Promise,
    directiveToFiles = require('./directive_to_files.js'),
    build = require('./build.js'),
    path = require('path'),
    AVAILABLE_DIRECTIVE_TYPES = [
        'require_self',
        'require_fractal',
        'require_tree',
        'require_directory',
        'require',
        'exclude',
        'reference'
    ],
    DIRECTIVE_PATTERN = new RegExp("\\/\\/\\s*=\\s*(" + AVAILABLE_DIRECTIVE_TYPES.join('|') + ")(.*)$", "gm");

/**
 * @param assetNode {AssetNode}
 */
function Directives(assetNode) {
    this.parse = assetNode.parse; // need to parse?
    this.path = assetNode.path;
    this.dirname = path.dirname(this.path);
    if (this.parse) {
        this.directives = this._extract(assetNode.content);
    }
}

Directives.prototype = {
    /**
     * @return {Promise} resolves with list of files to require
     */
    filesToRequire: function() {
        if (!this.parse) {
            return Promise.resolve([]);
        }
        var _this = this;
        return new Promise(function(resolve, reject) {
            var filesPaths = [],
                promises = _this.directives.map(function(directive) {
                    return directive.filesToRequire();
                });
            Promise.all(promises).then(function(fileLists) {
                var files = [];
                fileLists.forEach(function(list) {
                    files = files.concat(list);
                });
                resolve(files);
            }).catch(function(err) {
                reject(err);
            });
        });
    },
    /**
     * get asset lists for all referenced nodes (only for reference
     * directive) TODO: move it out and separate logic for diffrent
     * directives.
     * resolves with hashmap of bundlePath -> [modulePaths]
     */
    getReferencedNodes: function() {
        if (!this.parse) {
            return Promise.resolve({});
        }
        var refs = this._getDirectivesByType('reference'),
            paths = [],
            _this = this;
        refs.forEach(function(directive) {
            paths = paths.concat(directive.args);
        });
        paths = paths.map(function(filePath) {
            return path.resolve(_this.dirname, filePath);
        });
        var relativePaths = paths.map(function(filePath) {
            return path.relative(config.assetPath, filePath);
        });

        var promises = paths.map(function(filePath) {
            return build.makeNodeList(filePath);
        });

        return new Promise(function(resolve, reject) {
            Promise.all(promises).then(function(lists) {
                var map = {},
                    moduleList;
                // create a map relativePath -> list of assetNodes
                for (var i = 0, length = lists.length; i < length; i++) {
                    moduleList = lists[i].map(function(assetNode) {
                        return assetNode.relativePath();
                    });
                    map[relativePaths[i]] = moduleList;
                }
                resolve(_this._invertRefKeys(map));
            }).catch(reject);
        });
    },
    /**
     * converm original ref map (bundleName -> [modules]) into
     * moduleName -> [bundles]
     *
     * @param map {Object} bundleName -> [listOfModules]
     */
    _invertRefKeys: function(map) {
        var reversedMap = {};
        for (var bundle in map) {
            map[bundle].forEach(function(module) {
                reversedMap[module] || (reversedMap[module] = []);
                reversedMap[module].push(bundle);
            });
        }
        return reversedMap;
    },
    /**
     * @param type {String}
     * return directives of given type
     */
    _getDirectivesByType: function(type) {
        if (!this.directives) {
            return [];
        }
        return this.directives.filter(function(directive) {
            return directive.type === type;
        });
    },
    /**
     * @return {Array} array of {Directive}
     */
    _extract: function(content) {
        var match, fileNames = [],
            _this = this;
        while (match = DIRECTIVE_PATTERN.exec(content)) {
            var directive = match[1],
                args = match[2],
                result = [directive];
            args && (result = result.concat(args.trim().split(/\s+/)));
            result = new Directive(_this.path, result);
            fileNames.push(result);
        }
        return fileNames;
    }
};

module.exports = Directives;
