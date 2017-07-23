# mocha-aura

Test your Salesforce Lightning components with mocha

## Why?
Salesforce Aura components controller and helper files does not export anything and can not be directly required by nodejs. `mocha-aura` modifies standard nodejs loader for Salesforce Aura components and exports containing object.

##Code coverage with [istanbul](https://github.com/gotwarlost/istanbul)
`mocha-aura` can act as istanbul [--post-require-hook](http://gotwarlost.github.io/istanbul/public/apidocs/classes/Hook.html) and patch istanbul `hookRequire` hook. This allows to export Salesforce Aura controller and helper files before instrumenting it and have code coverage metrics.

## Installation

Clone this repo or download using `yarn` or `npm`

```
npm install mocha-aura --save
```

## Hooks

mocha-aura hooks nodejs require and istanbul hookRequire to properly load Salesforce js assets. By default it uses standard Salesforce naming convention, where all Aura files located in src/aura folder.
For different project structure you may supply your custom regex using `AURA_HOOK_REGEX` environment variable.

## Usage

### Run test 
`mocha  --require mocha-aura 'specs/**/*.js'`
Run all specs from specs folder

### Run code coverage
`istanbul cover -x 'specs/**/*.js' --root '../src/aura' --include-all-sources --post-require-hook mocha-aura ./node_modules/mocha-runner/bin/runner.js -- 'specs/**/*.js' html text-summary`


Here is the simple script section of package.json
```
  "scripts": {
    "test": "mocha  --require mocha-aura 'specs/**/*.js'",
    "watch": "chokidar --initial './specs/**' '../src/aura/**/*.js' -c 'npm run test'",
    "coverage": "istanbul cover -x 'specs/**/*.js' --root '../src/aura' --include-all-sources --post-require-hook mocha-aura ./node_modules/mocha-runner/bin/runner.js -- 'specs/**/*.js' html text-summary"
  },
```

To start simple test you have to pass `--require mocha-aura` to mocha. To run `istanbul cover` command you have to pass `--post-require-hook mocha-aura` parameter.


## Examples
[Async Operations](https://github.com/yury-sannikov/mocha-aura/wiki/Async-Operations)

[Aura Events](https://github.com/yury-sannikov/mocha-aura/wiki/Aura-Events)

[Aura Factory](https://github.com/yury-sannikov/mocha-aura/wiki/Aura-Factory)
[Check for Event Parameters](https://github.com/yury-sannikov/mocha-aura/wiki/Check-for-Event-Parameters)

[Emulate Apex Calls](https://github.com/yury-sannikov/mocha-aura/wiki/Emulate-Apex-Calls)

[How to mock Helper calls](https://github.com/yury-sannikov/mocha-aura/wiki/How-to-mock-Helper-calls)

[Mock component.find() calls](https://github.com/yury-sannikov/mocha-aura/wiki/Mock-component.find-calls)

[Testing Callbacks](https://github.com/yury-sannikov/mocha-aura/wiki/Testing-Callbacks)


See `examples/salesforce` folder

Specs for Lightning controller:

```javascript
const ctl = require('../../../src/aura/EventDuration/EventDurationController');

describe('EventDuration', function() {
  describe('EventDurationController', function() {
    it('doInit should call buildTimezoneObj', function() {
      const helper = {
        buildTimezoneObj: sinon.spy()
      }
      const controller = {}
      ctl.doInit(controller, null, helper);
      expect(helper.buildTimezoneObj).to.have.been.calledWith(controller);
    });
  });
});
```


## Liscense

MIT