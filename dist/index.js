var fs = require('fs');

// Check for /src/aura/Component/ComponentController.js or /src/aura/Component/ComponentHelper.js pattern
var isAuraFile = function isAuraFile(filename) {
  return (/src\/aura\/[^/]+\/.+(Controller|Helper).js$/.test(filename)
  );
};

// Add module.exports for every aura file
var auraCodeTransformer = function auraCodeTransformer(code) {
  return 'module.exports=' + code;
};

function hookIstanbul(_istanbul) {
  // This method relies on a --post-require-hook mocha-aura parameter for istanbul cover
  var originalHookRequire = _istanbul.hook.hookRequire;

  _istanbul.hook.hookRequire = function (matcher, transformer, options) {
    function transformerWrapper(code, filename) {
      return transformer(isAuraFile(filename) ? auraCodeTransformer(code) : code, filename);
    }
    return originalHookRequire(matcher, transformerWrapper, options);
  };
}

function hookRequire(_Module) {
  var originalJsExtension = _Module._extensions['.js'];

  _Module._extensions['.js'] = function (module, filename) {

    if (!isAuraFile(filename)) {
      return originalJsExtension(module, filename);
    }

    var code = auraCodeTransformer(fs.readFileSync(filename, 'utf8'), filename);
    module._compile(code, filename);
  };
}

var runUnderIstanbul = function runUnderIstanbul(_cache) {
  return Object.keys(_cache).some(function (key) {
    return key.indexOf('node_modules/istanbul') !== -1;
  });
};

var Module = require('module');
if (runUnderIstanbul(require.cache)) {
  var istanbul = require('istanbul');
  hookIstanbul(istanbul);
} else {
  hookRequire(Module);
}

// Conform to post-require-hook for istanbul
module.exports = function () {
  return null;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL2hvb2tzL2hvb2tzLmpzIiwiLi4vaG9va3MvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuXG4vLyBDaGVjayBmb3IgL3NyYy9hdXJhL0NvbXBvbmVudC9Db21wb25lbnRDb250cm9sbGVyLmpzIG9yIC9zcmMvYXVyYS9Db21wb25lbnQvQ29tcG9uZW50SGVscGVyLmpzIHBhdHRlcm5cbmV4cG9ydCBjb25zdCBpc0F1cmFGaWxlID0gKGZpbGVuYW1lKSA9PiAvc3JjXFwvYXVyYVxcL1teL10rXFwvLisoQ29udHJvbGxlcnxIZWxwZXIpLmpzJC8udGVzdChmaWxlbmFtZSk7XG5cbi8vIEFkZCBtb2R1bGUuZXhwb3J0cyBmb3IgZXZlcnkgYXVyYSBmaWxlXG5leHBvcnQgY29uc3QgYXVyYUNvZGVUcmFuc2Zvcm1lciA9IChjb2RlKSA9PiB7XG4gIHJldHVybiAnbW9kdWxlLmV4cG9ydHM9JyArIGNvZGU7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGhvb2tJc3RhbmJ1bChfaXN0YW5idWwpIHtcbiAgLy8gVGhpcyBtZXRob2QgcmVsaWVzIG9uIGEgLS1wb3N0LXJlcXVpcmUtaG9vayBtb2NoYS1hdXJhIHBhcmFtZXRlciBmb3IgaXN0YW5idWwgY292ZXJcbiAgdmFyIG9yaWdpbmFsSG9va1JlcXVpcmUgPSBfaXN0YW5idWwuaG9vay5ob29rUmVxdWlyZTtcblxuICBfaXN0YW5idWwuaG9vay5ob29rUmVxdWlyZSA9IGZ1bmN0aW9uKG1hdGNoZXIsIHRyYW5zZm9ybWVyLCBvcHRpb25zKSB7XG4gICAgZnVuY3Rpb24gdHJhbnNmb3JtZXJXcmFwcGVyKGNvZGUsIGZpbGVuYW1lKSB7XG4gICAgICByZXR1cm4gdHJhbnNmb3JtZXIoaXNBdXJhRmlsZShmaWxlbmFtZSkgPyAgYXVyYUNvZGVUcmFuc2Zvcm1lcihjb2RlKSA6IGNvZGUsIGZpbGVuYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIG9yaWdpbmFsSG9va1JlcXVpcmUobWF0Y2hlciwgdHJhbnNmb3JtZXJXcmFwcGVyLCBvcHRpb25zKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaG9va1JlcXVpcmUoX01vZHVsZSkge1xuICBjb25zdCBvcmlnaW5hbEpzRXh0ZW5zaW9uID0gX01vZHVsZS5fZXh0ZW5zaW9uc1snLmpzJ107XG5cbiAgX01vZHVsZS5fZXh0ZW5zaW9uc1snLmpzJ10gPSBmdW5jdGlvbiAobW9kdWxlLCBmaWxlbmFtZSkge1xuICAgICAgXG4gICAgICBpZiAoIWlzQXVyYUZpbGUoZmlsZW5hbWUpKSB7XG4gICAgICAgIHJldHVybiBvcmlnaW5hbEpzRXh0ZW5zaW9uKG1vZHVsZSwgZmlsZW5hbWUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29kZSA9IGF1cmFDb2RlVHJhbnNmb3JtZXIoZnMucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCAndXRmOCcpLCBmaWxlbmFtZSk7XG4gICAgICBtb2R1bGUuX2NvbXBpbGUoY29kZSwgZmlsZW5hbWUpO1xuICB9O1xufVxuXG5leHBvcnQgY29uc3QgcnVuVW5kZXJJc3RhbmJ1bCA9IChfY2FjaGUpID0+IE9iamVjdC5rZXlzKF9jYWNoZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLnNvbWUoKGtleSkgPT4ga2V5LmluZGV4T2YoJ25vZGVfbW9kdWxlcy9pc3RhbmJ1bCcpICE9PSAtMSk7XG5cblxuXG4iLCJjb25zdCBNb2R1bGUgPSByZXF1aXJlKCdtb2R1bGUnKTtcbmltcG9ydCB7IGhvb2tJc3RhbmJ1bCwgaG9va1JlcXVpcmUsIHJ1blVuZGVySXN0YW5idWwgfSBmcm9tICcuL2hvb2tzJztcblxuaWYgKHJ1blVuZGVySXN0YW5idWwocmVxdWlyZS5jYWNoZSkpIHtcbiAgY29uc3QgaXN0YW5idWwgPSByZXF1aXJlKCdpc3RhbmJ1bCcpOyAgXG4gIGhvb2tJc3RhbmJ1bChpc3RhbmJ1bCk7XG59IGVsc2Uge1xuICBob29rUmVxdWlyZShNb2R1bGUpO1xufVxuXG4vLyBDb25mb3JtIHRvIHBvc3QtcmVxdWlyZS1ob29rIGZvciBpc3RhbmJ1bFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG51bGw7XG59Il0sIm5hbWVzIjpbImZzIiwicmVxdWlyZSIsImlzQXVyYUZpbGUiLCJmaWxlbmFtZSIsInRlc3QiLCJhdXJhQ29kZVRyYW5zZm9ybWVyIiwiY29kZSIsImhvb2tJc3RhbmJ1bCIsIl9pc3RhbmJ1bCIsIm9yaWdpbmFsSG9va1JlcXVpcmUiLCJob29rIiwiaG9va1JlcXVpcmUiLCJtYXRjaGVyIiwidHJhbnNmb3JtZXIiLCJvcHRpb25zIiwidHJhbnNmb3JtZXJXcmFwcGVyIiwiX01vZHVsZSIsIm9yaWdpbmFsSnNFeHRlbnNpb24iLCJfZXh0ZW5zaW9ucyIsIm1vZHVsZSIsInJlYWRGaWxlU3luYyIsIl9jb21waWxlIiwicnVuVW5kZXJJc3RhbmJ1bCIsIl9jYWNoZSIsIk9iamVjdCIsImtleXMiLCJzb21lIiwia2V5IiwiaW5kZXhPZiIsIk1vZHVsZSIsImNhY2hlIiwiaXN0YW5idWwiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFNQSxLQUFLQyxRQUFRLElBQVIsQ0FBWDs7O0FBR0EsQUFBTyxJQUFNQyxhQUFhLFNBQWJBLFVBQWEsQ0FBQ0MsUUFBRDt3REFBNERDLElBQTlDLENBQW1ERCxRQUFuRDs7Q0FBakM7OztBQUdQLEFBQU8sSUFBTUUsc0JBQXNCLFNBQXRCQSxtQkFBc0IsQ0FBQ0MsSUFBRCxFQUFVO1NBQ3BDLG9CQUFvQkEsSUFBM0I7Q0FESzs7QUFLUCxBQUFPLFNBQVNDLFlBQVQsQ0FBc0JDLFNBQXRCLEVBQWlDOztNQUVsQ0Msc0JBQXNCRCxVQUFVRSxJQUFWLENBQWVDLFdBQXpDOztZQUVVRCxJQUFWLENBQWVDLFdBQWYsR0FBNkIsVUFBU0MsT0FBVCxFQUFrQkMsV0FBbEIsRUFBK0JDLE9BQS9CLEVBQXdDO2FBQzFEQyxrQkFBVCxDQUE0QlQsSUFBNUIsRUFBa0NILFFBQWxDLEVBQTRDO2FBQ25DVSxZQUFZWCxXQUFXQyxRQUFYLElBQXdCRSxvQkFBb0JDLElBQXBCLENBQXhCLEdBQW9EQSxJQUFoRSxFQUFzRUgsUUFBdEUsQ0FBUDs7V0FFS00sb0JBQW9CRyxPQUFwQixFQUE2Qkcsa0JBQTdCLEVBQWlERCxPQUFqRCxDQUFQO0dBSkY7OztBQVFGLEFBQU8sU0FBU0gsV0FBVCxDQUFxQkssT0FBckIsRUFBOEI7TUFDN0JDLHNCQUFzQkQsUUFBUUUsV0FBUixDQUFvQixLQUFwQixDQUE1Qjs7VUFFUUEsV0FBUixDQUFvQixLQUFwQixJQUE2QixVQUFVQyxNQUFWLEVBQWtCaEIsUUFBbEIsRUFBNEI7O1FBRWpELENBQUNELFdBQVdDLFFBQVgsQ0FBTCxFQUEyQjthQUNsQmMsb0JBQW9CRSxNQUFwQixFQUE0QmhCLFFBQTVCLENBQVA7OztRQUdFRyxPQUFPRCxvQkFBb0JMLEdBQUdvQixZQUFILENBQWdCakIsUUFBaEIsRUFBMEIsTUFBMUIsQ0FBcEIsRUFBdURBLFFBQXZELENBQVg7V0FDT2tCLFFBQVAsQ0FBZ0JmLElBQWhCLEVBQXNCSCxRQUF0QjtHQVBKOzs7QUFXRixBQUFPLElBQU1tQixtQkFBbUIsU0FBbkJBLGdCQUFtQixDQUFDQyxNQUFEO1NBQVlDLE9BQU9DLElBQVAsQ0FBWUYsTUFBWixFQUNqQkcsSUFEaUIsQ0FDWixVQUFDQyxHQUFEO1dBQVNBLElBQUlDLE9BQUosQ0FBWSx1QkFBWixNQUF5QyxDQUFDLENBQW5EO0dBRFksQ0FBWjtDQUF6Qjs7QUNyQ1AsSUFBTUMsU0FBUzVCLFFBQVEsUUFBUixDQUFmO0FBQ0EsQUFFQSxJQUFJcUIsaUJBQWlCckIsUUFBUTZCLEtBQXpCLENBQUosRUFBcUM7TUFDN0JDLFdBQVc5QixRQUFRLFVBQVIsQ0FBakI7ZUFDYThCLFFBQWI7Q0FGRixNQUdPO2NBQ09GLE1BQVo7Ozs7QUFJRlYsT0FBT2EsT0FBUCxHQUFpQixZQUFXO1NBQ25CLElBQVA7Q0FERiJ9
