# EventsBackend

## How to install

First, clone the repository.

Create a folder in the root of the project (same level as the <code>app</code> folder) called <code>secrets</code>

Get the firebase private key credential json file from me, and place that file the <code>secrets</code> directory.

Run <code>npm install</code>

## How to run

Run <code>npm start</code>


## How to test

This project uses my custom test suite. In order to add a test, simply add a .ts file to the <code>app/test/tests/</code> folder.

Any functions exported from this .ts file that include the substring "test" (case-insensitive) in the function name will be registered as a test by the testing suite.

The tests are run using expectation statements, which can be performed by including <code>require('../testExtensions')</code> in your test file and then writing expect functions in the form:

<code>expect(val1).verb.comparison(?val2)</code>

where val2 is optional depending on the comparison made. Here are some examples are included below:

<code>expect(1).toBe.equalTo(1)</code>
would evaulate to *true*

<code>expect(1).toBe.equalTo(2)</code>
would evaulate to *false*

<code>expect(1).is.defined()</code>
would evaulate to *true*

<code>expect(1).is.undefined()</code>
would evaulate to *false*

These expectation statements will automatically be registered and run by the testing file and will appear in the testing output. There is no need to return anything or register anything, so long as all the expect statements pass, the test will be considered to have passed!

Then in order to run the testing script, simply run:

<code>npm test</code>

