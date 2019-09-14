/**
 * Created by Mahesh on 12/5/16.
 */

EPUBJS.reader = {};
EPUBJS.reader.plugins = {}; //-- Attach extra Controllers as plugins (like search?)

(function(root, $) {

    var previousReader = root.ePubReader || {};

    var ePubReader = root.ePubReader = function(path, options) {
        return new EPUBJS.Reader(path, options);
    };

    //exports to multiple environments
    if (typeof define === 'function' && define.amd) {
        //AMD
        define(function(){ return Reader; });
    } else if (typeof module != "undefined" && module.exports) {
        //Node
        module.exports = ePubReader;
    }

})(window, jQuery);