/**
 *  
 * StopWatch is a simple and fast utility for measuring 
 * code performance with a consistent API for multiple languages
 * 
 * 
 * Released under the MIT License.
 * See https://opensource.org/licenses/MIT for more information. 
 * 
 */
(function (module) {

    "use strict";

    var SEPERATOR = "|";
    var HEADER_DIVIDER = "-";

    var timesMap = {};

    var now = (function () {
        if (!Date.now) {
            Date.now = function now() {
                return new Date().getTime();
            };
        }
        return Date.now;
    }());

    var isArray = function (x) {
        return x && x.constructor === Array;
    };

    var isUndefined = function (x) {
        return typeof x === "undefined";
    };

    /**
     * Utility for iterating arrays or objects
     * @param {*} item 
     * @param {*} callback 
     */
    var forEach = function (item, callback) {
        var isArr = isArray(item);
        for (var key in item) {
            if (!isArr) { // object
                if (item.hasOwnProperty(key)) {
                    callback(item[key], key);
                }
            } else {
                callback(item[key], key);
            }
        }
    };

    /**
     * Statistics use the Welford's Algorithm for estimation.
     * This method is said to be the most stable.
     */
    function Stats() {
        var n = 0;
        var mu = 0;
        var sq = 0;
        var min = Number.MAX_VALUE;
        var max = -1;
        var lastExecutionTime = 0;

        /**
         * Update the stats with the latest value
         * @param {Number} x The current value to the update
         */
        this.update = function(x) {
            n += 1;
            var newMu = mu + ((x - mu) / n);
            sq += (x - mu) * (x - newMu);
            mu = newMu;
            if (x < min) { min = x }
            if (x > max) { max = x }
            lastExecutionTime = x;
        };

        this.count = function () { return n; };
        this.min = function () { return min; };
        this.max = function () { return max; };
        this.mean = function () { return mu; };
        this.variance = function () { return (n > 1) ? (sq/n) : 0.0; };
        this.stdDev = function () { return Math.sqrt(this.variance()); };
        this.lastExecutionTime = function () { return lastExecutionTime; };

        this.toObject = function () {
            return {
                count: this.count(),
                min: this.min(),
                max: this.max(),
                mean: this.mean(),
                variance: this.variance(),
                stdDev: this.stdDev(),
                lastExecutionTime: this.lastExecutionTime()
            }
        };

        this.toString = function () {
            return "Stats " + JSON.stringify(this.toObject(), null, 4);
        };
    };

    /**
     * Internal representation of the passed information
     * @param {String} identifier 
     * @param {Number} startTime 
     */
    function StopWatchInternal(identifier, startTime) {

        this.stop = function () {
            var stopTime = now();
            var stats = timesMap[identifier];
            if (!stats) {
                stats = new Stats();
                timesMap[identifier] = stats;
            }
            stats.update(stopTime - startTime);
            return stats;
        };
    }

    /**
     * Convert an one-dimensional object or array to a tabular
     * representation.
     */
    function Tableify(items) {

        // Convert to an array if object is passed
        if (!isArray(items)) {
            items = [items];
        }

        // The maximum width of each property
        var maxLengths = (function () {
            var maxLengths = {};
            forEach(items, function (item, index) {
                forEach(item, function(val, key) {
                    var length = !isUndefined(val) ? val.toString().length : 0;
                    var keyLength = key.toString().length;
                    if (keyLength > length) { length = keyLength; }
                    if (!maxLengths[key]) { maxLengths[key] = 0; }
                    if (length > maxLengths[key]) { maxLengths[key] = length; }
                });
            });
            return maxLengths;
        })();

        // Padded string
        var getPaddedString = function (value, propertyName) {
            value = isUndefined(value) ? "" : value.toString();
            var maxLength = maxLengths[propertyName] || value.length;
            while (value.length < maxLength) {
                value += ' ';
            }
            return value;
        };

        var header = '';
        var result = '';
        var isHeaderSet = false;

        forEach(items, function(item, index) {
            if (!isHeaderSet) {
                header += SEPERATOR + ' ';
            }
            result += SEPERATOR + ' ';
            forEach(maxLengths, function(ignore, key) {
                if (!isHeaderSet) {
                    header += getPaddedString(key, key);
                    header += ' ' + SEPERATOR + ' ';
                }
                result += getPaddedString(item[key], key);
                result += ' ' + SEPERATOR + ' ';
            });
            result += '\n';
            isHeaderSet = true;
        });

        return header + '\n' + Array(header.length).join("-") + '\n' + result;
    }

    // Public methods
    var publicmethods = {

        /**
         * Start measuring the time
         * @param {String} identifier 
         */
        start: function(identifier) {
            return new StopWatchInternal(identifier, now());
        },

        /**
         * Reset all previously remembered stats
         */
        flush: function () {
            timesMap = {};
        },

        /**
         * Get the stats as a key/value pair
         */
        stats: function () {
            // Return a copy. Original object cannot
            // be modified from outside
            var results = {};
            forEach(timesMap, function(val, key) {
                results[key] = val.toObject();
            });
            return results;
        },

        /**
         * Get a string table representation of stats
         */
        table: function () {
            var results = [];
            forEach(timesMap, function(val, key) {
                // copy back in sorted order with key first
                var datum = val.toObject();
                var result = { key: key };
                forEach(datum, function(propertyValue, propertyName) {
                    result[propertyName] = propertyValue;
                });
                results.push(result);
            });
            return Tableify(results);
        }
    };

    // export
    module.exports = module.StopWatch = publicmethods;

})(typeof module !== 'undefined' ? module : this);