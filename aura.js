const { eventFactory } = require('./lib/eventFactory')
const { componentFactory, useComponentAdapters } = require('./lib/componentFactory')
const { auraFactory } = require('./lib/auraFactory')
const { AuraUtil } = require('./lib/auraUtil')
const { apexCallFactory, apexSuccessResult, apexErrorResult } = require('./lib/apexCallFactory')

module.exports = {
    AuraUtil,
    eventFactory,
    componentFactory,
    useComponentAdapters,
    auraFactory,
    apexCallFactory,
    apexSuccessResult,
    apexErrorResult
}