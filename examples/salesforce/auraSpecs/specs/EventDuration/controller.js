const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

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