# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
#  
# StopWatch is a simple and fast utility for measuring 
# code performance with a consistent API for multiple languages
#
# 
# Released under the MIT License.
# See https://opensource.org/licenses/MIT for more information.
#  
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

import sys
import time


def now():
    return int(round(time.time() * 1000))


class Stats(object):

    def __init__(self):
        self._n = 0
        self._mu = 0
        self._sq = 0
        self._min = sys.maxsize
        self._max = -1
        self._last_execution_time = 0

    @property
    def count(self):
        return self._n

    @property
    def min(self):
        return self._min

    @property
    def max(self):
        return self._max

    @property
    def mean(self):
        return self._mu

    @property
    def variance(self):
        if self._n > 1:
            return self._sq/self._n
        return 0.0

    @property
    def stddev(self):
        return self.variance**(1/2)

    @property
    def last_execution_time(self):
        return self._last_execution_time

    def to_object(self):
        return {
            'count': self.count,
            'min': self.min,
            'max': self.max,
            'mean': self.mean,
            'variance': self.variance,
            'stddev': self.stddev,
            'last_execution_time': self.last_execution_time,
        }

    def update(self, x):
        self._n += 1
        newmu = self._mu + ((x - self._mu) / self._n)
        self._sq += (x - self._mu) * (x - newmu)
        self._mu = newmu
        if x < min:
            self._min = x
        if x > max:
            self._max = x
        self._last_execution_time = x


_STOPWATCH_TIMES_MAP = {}


class StopWatchInternal(object):

    def __init__(self, identifier):
        self._identifier = str(identifier).lower()
        self._starttime = now()

    def stop(self):
        global _STOPWATCH_TIMES_MAP
        stop_time = now()
        if not self._identifier in _STOPWATCH_TIMES_MAP:
            stats = Stats()
            _STOPWATCH_TIMES_MAP[self._identifier] = stats
        else:
            stats = _STOPWATCH_TIMES_MAP[self._identifier]
        stats.update(stop_time - self._starttime)
        return stats


class StopWatch(object):

    @staticmethod
    def start(identifier):
        return StopWatchInternal(identifier)

    @staticmethod
    def reset():
        global _STOPWATCH_TIMES_MAP
        _STOPWATCH_TIMES_MAP = {}

    @staticmethod
    def stats():
        global _STOPWATCH_TIMES_MAP
        results = {}
        for identifier in _STOPWATCH_TIMES_MAP:
            val = _STOPWATCH_TIMES_MAP[identifier]
            results[identifier] = val.to_object()
        return results

    @staticmethod
    def table():
        global _STOPWATCH_TIMES_MAP
        results = []
        for identifier in _STOPWATCH_TIMES_MAP:
            datum = _STOPWATCH_TIMES_MAP[identifier].to_object()
            result = {'key': identifier}
            for key in datum:
                result[key] = datum[key]
            results.append(result)
        return tabelify(results)


def tabelify(items):
    """
    Convert an one-dimensional object or array to a tabular representation.

    :param items: Dictionary or list
    :return: Tabular representation in string form
    """

    SEPERATOR = "|"
    HEADER_DIVIDER = "-"

    def is_array(target):
        return (target is not None) and (isinstance(target, list))

    def is_undefined(target):
        return target is None

    def safe_get(dict, key):
        if key not in dict:
            return None
        return dict[key]

    def get_max_column_length():
        max_lengths = {}
        for item in items: # iterate over items
            for key in item: # iterate over each field
                val = item[key]
                length = 0 if is_undefined(val) else len(str(val))
                key_length = len(key)
                if key_length > length:
                    length = key_length
                if is_undefined(safe_get(max_lengths, key)):
                    max_lengths[key] = 0
                if length > max_lengths[key]:
                    max_lengths[key] = length
        return max_lengths

    # Convert to an array if dictionary is passed
    if not is_array(items):
        items = [items]

    # The maximum width of each property
    max_lengths = get_max_column_length()

    # Pad the string with whitespace
    def get_padded_str(value, property_name):
        value = "" if is_undefined(value) else str(value)
        max_length = max_lengths[property_name]
        if is_undefined(max_length) or max_length <= 0:
            max_length = len(value)
        while len(value) < max_length:
            value += " "
        return value

    header = ""
    result = ""
    is_header_set = False

    for item in items:  # iterate over items
        if not is_header_set:
            header += SEPERATOR + " "
        result += SEPERATOR + " "
        for key in max_lengths:  # iterate over each field
            if not is_header_set:
                header += get_padded_str(key, key)
                header += " " + SEPERATOR + " "
            result += get_padded_str(safe_get(item, key), key)
            result += " " + SEPERATOR + " "
        result += '\n'
        is_header_set = True

    return header + '\n' + (HEADER_DIVIDER*len(header)) + '\n' + result
