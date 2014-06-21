var fs = require('fs'),
    config = require('./config.js'),
    path = require('path'),
    Promise = require('es6-promise').Promise;

/**
 * @param options.path {String} asset path
 * @param [options.wrap] {Boolean} whether to wrap file in module
 * @param [options.content] {String} content
 * @param [option.directives] {Array}
 */
function AssetNode(options) {
    if (!options.path) { throw new Error('path is required'); }
    this.path = options.path;
    this.content = options.content;
    this.wrap = options.wrap;
    this.directives = options.directives;
    this.children = options.children || [];
}

AssetNode.prototype = {
    /**
     * Modifies file path resolving it
     */
    resolvePath: function() {
        this.path = path.resolve(config.assetPath, this.path);
    },
    /**
     * readFile `this.path` and resolve promise with it's content
     * @return {Promise}
     */
    fetchContent: function() {
        var _this = this;
        return new Promise(function(resolve, reject) {
            fs.readFile(_this.path, function(err, content) {
                if (err) {
                    deferred.reject(err);
                } else {
                    resolve(content.toString());
                }
            });
        });
    }
};

module.exports = AssetNode;
