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

## Usage

todo

## Liscense

MIT