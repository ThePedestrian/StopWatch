# StopWatch

**StopWatch** is a simple and fast utility for measuring code performance with a consistent API for multiple languages. The idea was born out of the need to do benchmarking over the same code-block with the need to understand the **average (mean)**, **min**, **max**, **standard deviation**, **variance**, **count**, and **last execution time**  between multiple iterations.

**Example**

| Key | count | min | max | mean     | variance  | stdDev   | lastExecutionTime | 
|---------|------------|---------|------------|---------|------------|---------|------------|
| ExampleClass.method1() | 3     | 0   | 3   | 1        | 2         | 1.414213 | 3                 | 
| ExampleClass.method2() | 3     | 0   | 8   | 3        | 12.66666  | 3.559026 | 8                 | 
| ExampleClass.method3() | 3     | 0   | 2   | 0.666666 | 0.8888888 | 0.942809 | 2                 | 
| ExampleClass.method4() | 3     | 0   | 1   | 0.333333 | 0.2222222 | 0.471404 | 1                 | 
| ExampleClass.method5() | 3     | 0   | 0   | 0        | 0         | 0        | 0                 | 

# API

| Method | Description |
|---------|------------|
| **start(id)** | Start the benchmarking with a given identifier. Returns a StopWatchInternal object on which stop() can be called. |
| **stop()** | Measure the performance and add to internal cache |
| **flush()** | Clear the internal cache |
| **stats()** | An key-value pair containing the stats per given identifier |
| **table()** | String representation of a table |

# How to use
**PYTHON**
```python
from stopwatch import StopWatch

sw = StopWatch.start("SOME_IDENTIFIER")
# ... more code
sw.stop()

print StopWatch.table()
```

**JAVASCRIPT (NodeJS + Browser)**
```javascript
// import or include using <script> tag

sw = StopWatch.start("SOME_IDENTIFIER")
// more code
sw.stop()

console.log(StopWatch.table())
```


# License
----

MIT

