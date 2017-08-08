const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

import { isAuraFile, auraCodeTransformer, hookIstanbul, hookRequire, runUnderIstanbul } from '../hooks/hooks';

describe('Hooks', function() {
  describe('isAuraFile', function() {
    it('should return true for aura controller', function() {
      expect(isAuraFile('src/aura/ViewComponent/ViewComponentController.js')).to.be.ok;
    });
    it('should return true for aura helper', function() {
      expect(isAuraFile('src/aura/ViewComponent/ViewComponentHelper.js')).to.be.ok;
    });
    describe('under windows', () => {
      it('should return true for aura helper', function() {
        expect(isAuraFile('src\\aura\\ViewComponent\\ViewComponentHelper.js', '\\')).to.be.ok;
      });
      it('should return false for aura non-js helper', function() {
        expect(isAuraFile('src\\aura\\ViewComponent\\ViewComponentHelper.jsx')).not.to.be.ok;
      });
    })
    describe('custom regex passed through process.env.AURA_HOOK_REGEX', () => {
      beforeEach(()=> {
        process.env.AURA_HOOK_REGEX = 'myAura/.+(Kontroller.js$|Xelper.js$)'
      })
      afterEach(()=> {
        delete process.env.AURA_HOOK_REGEX
      })
      it('should return true for custom helper', function() {
        expect(isAuraFile('myAura/ViewComponentXelper.js', '-')).to.be.ok;
      });
      it('should return true for custom controller', function() {
        expect(isAuraFile('myAura/ViewComponentKontroller.js', '-')).to.be.ok;
      });
    })
    it('should return true for aura renderer', function() {
      expect(isAuraFile('src/aura/ViewComponent/ViewComponentRenderer.js')).to.be.ok;
    });
    it('should return false for aura non-js helper', function() {
      expect(isAuraFile('src/aura/ViewComponent/ViewComponentHelper.jsx')).not.to.be.ok;
    });
    it('should return false for aura non-js controller', function() {
      expect(isAuraFile('src/aura/ViewComponent/ViewComponentController.cmp')).not.to.be.ok;
    });
    it('should return false for non aura js file', function() {
      expect(isAuraFile('src/aura/ViewComponentController.js')).not.to.be.ok;
    });
    it('should return false for non aura js file', function() {
      expect(isAuraFile('someotherfile.js')).not.to.be.ok;
    });
    it('should return false for misplaced aura helper', function() {
      expect(isAuraFile('aura/src/ViewComponent/ViewComponentHelper.js')).not.to.be.ok;
    });
  });

  describe('auraCodeTransformer', function() {
    it('should add module.exports= to the code', function() {
      expect(auraCodeTransformer('({test:1})')).to.equal('module.exports=({test:1})');
    });
  });

  describe('hookIstanbul', function() {
    it('should set up hookRequire', function() {
      let ist = { hook: {} }
      hookIstanbul(ist);
      expect(typeof ist.hook.hookRequire).to.be.equal('function');
    });

    it('hookRequire call should call original hook', function() {
      let originalHook = sinon.spy();
      let ist = { hook: { hookRequire:  originalHook} }
      hookIstanbul(ist);
      ist.hook.hookRequire();
      expect(originalHook).to.have.been.calledOnce;
    });
  });

  describe('hookRequire', function() {
    it('should hook js module extension', function() {
      const oldExtension = () => 0;
      let mod = {
        _extensions: {
          '.js': oldExtension
        }
      }
      hookRequire(mod);

      expect(mod._extensions['.js']).not.to.be.equal(oldExtension);
    });
  });

  describe('runUnderIstanbul', function() {
    it('should be truthy with istanbul in a cache', function() {
      expect(runUnderIstanbul({'user/node_modules/istanbul':{}})).to.be.ok;
    });
    it('should be truthy with istanbul in a cache for Windows', function() {
      expect(runUnderIstanbul({'user\\node_modules\\istanbul':{}}, '\\')).to.be.ok;
    });
    it('should be false with no istanbul in a cache', function() {
      expect(runUnderIstanbul({'user/node_modules/lodash':{}})).not.to.be.ok;
    });
  });

});