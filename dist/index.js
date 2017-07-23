var fs = require('fs');
var path = require('path');

var OS_Regexps = {};

// Check for /src/aura/Component/ComponentController.js or /src/aura/Component/ComponentHelper.js pattern
var buidRegexp = function buidRegexp(sep) {
  var separator = '\\' + sep;
  var regex = 'src' + separator + 'aura' + separator + '[^' + separator + ']+' + separator + '.+(Controller|Helper|Renderer).js$';
  // Override regex with custom supplied regex
  if (process.env.AURA_HOOK_REGEX) {
    regex = process.env.AURA_HOOK_REGEX;
  }
  return new RegExp(regex);
};
var isAuraFile = function isAuraFile(filename) {
  var sep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : path.sep;

  var auraRegex = OS_Regexps[sep];
  if (!auraRegex) {
    auraRegex = OS_Regexps[sep] = buidRegexp(sep);
  }
  return auraRegex.test(filename);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL2hvb2tzL2hvb2tzLmpzIiwiLi4vaG9va3MvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxubGV0IE9TX1JlZ2V4cHMgPSB7fVxuXG4vLyBDaGVjayBmb3IgL3NyYy9hdXJhL0NvbXBvbmVudC9Db21wb25lbnRDb250cm9sbGVyLmpzIG9yIC9zcmMvYXVyYS9Db21wb25lbnQvQ29tcG9uZW50SGVscGVyLmpzIHBhdHRlcm5cbmNvbnN0IGJ1aWRSZWdleHAgPSBzZXAgPT4ge1xuICBjb25zdCBzZXBhcmF0b3IgPSAnXFxcXCcgKyBzZXA7XG4gIGxldCByZWdleCA9IGBzcmMke3NlcGFyYXRvcn1hdXJhJHtzZXBhcmF0b3J9W14ke3NlcGFyYXRvcn1dKyR7c2VwYXJhdG9yfS4rKENvbnRyb2xsZXJ8SGVscGVyfFJlbmRlcmVyKS5qcyRgO1xuICAvLyBPdmVycmlkZSByZWdleCB3aXRoIGN1c3RvbSBzdXBwbGllZCByZWdleFxuICBpZiAocHJvY2Vzcy5lbnYuQVVSQV9IT09LX1JFR0VYKSB7XG4gICAgcmVnZXggPSBwcm9jZXNzLmVudi5BVVJBX0hPT0tfUkVHRVhcbiAgfVxuICByZXR1cm4gbmV3IFJlZ0V4cChyZWdleClcbn1cbmV4cG9ydCBjb25zdCBpc0F1cmFGaWxlID0gKGZpbGVuYW1lLCBzZXAgPSBwYXRoLnNlcCkgPT4ge1xuICBsZXQgYXVyYVJlZ2V4ID0gT1NfUmVnZXhwc1tzZXBdXG4gIGlmICghYXVyYVJlZ2V4KSB7XG4gICAgYXVyYVJlZ2V4ID0gT1NfUmVnZXhwc1tzZXBdID0gYnVpZFJlZ2V4cChzZXApO1xuICB9XG4gIHJldHVybiBhdXJhUmVnZXgudGVzdChmaWxlbmFtZSk7XG59XG5cbi8vIEFkZCBtb2R1bGUuZXhwb3J0cyBmb3IgZXZlcnkgYXVyYSBmaWxlXG5leHBvcnQgY29uc3QgYXVyYUNvZGVUcmFuc2Zvcm1lciA9IChjb2RlKSA9PiB7XG4gIHJldHVybiAnbW9kdWxlLmV4cG9ydHM9JyArIGNvZGU7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGhvb2tJc3RhbmJ1bChfaXN0YW5idWwpIHtcbiAgLy8gVGhpcyBtZXRob2QgcmVsaWVzIG9uIGEgLS1wb3N0LXJlcXVpcmUtaG9vayBtb2NoYS1hdXJhIHBhcmFtZXRlciBmb3IgaXN0YW5idWwgY292ZXJcbiAgdmFyIG9yaWdpbmFsSG9va1JlcXVpcmUgPSBfaXN0YW5idWwuaG9vay5ob29rUmVxdWlyZTtcblxuICBfaXN0YW5idWwuaG9vay5ob29rUmVxdWlyZSA9IGZ1bmN0aW9uKG1hdGNoZXIsIHRyYW5zZm9ybWVyLCBvcHRpb25zKSB7XG4gICAgZnVuY3Rpb24gdHJhbnNmb3JtZXJXcmFwcGVyKGNvZGUsIGZpbGVuYW1lKSB7XG4gICAgICByZXR1cm4gdHJhbnNmb3JtZXIoaXNBdXJhRmlsZShmaWxlbmFtZSkgPyAgYXVyYUNvZGVUcmFuc2Zvcm1lcihjb2RlKSA6IGNvZGUsIGZpbGVuYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIG9yaWdpbmFsSG9va1JlcXVpcmUobWF0Y2hlciwgdHJhbnNmb3JtZXJXcmFwcGVyLCBvcHRpb25zKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaG9va1JlcXVpcmUoX01vZHVsZSkge1xuICBjb25zdCBvcmlnaW5hbEpzRXh0ZW5zaW9uID0gX01vZHVsZS5fZXh0ZW5zaW9uc1snLmpzJ107XG5cbiAgX01vZHVsZS5fZXh0ZW5zaW9uc1snLmpzJ10gPSBmdW5jdGlvbiAobW9kdWxlLCBmaWxlbmFtZSkge1xuICAgICAgXG4gICAgICBpZiAoIWlzQXVyYUZpbGUoZmlsZW5hbWUpKSB7XG4gICAgICAgIHJldHVybiBvcmlnaW5hbEpzRXh0ZW5zaW9uKG1vZHVsZSwgZmlsZW5hbWUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29kZSA9IGF1cmFDb2RlVHJhbnNmb3JtZXIoZnMucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCAndXRmOCcpLCBmaWxlbmFtZSk7XG4gICAgICBtb2R1bGUuX2NvbXBpbGUoY29kZSwgZmlsZW5hbWUpO1xuICB9O1xufVxuXG5leHBvcnQgY29uc3QgcnVuVW5kZXJJc3RhbmJ1bCA9IChfY2FjaGUpID0+IE9iamVjdC5rZXlzKF9jYWNoZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLnNvbWUoKGtleSkgPT4ga2V5LmluZGV4T2YoJ25vZGVfbW9kdWxlcy9pc3RhbmJ1bCcpICE9PSAtMSk7XG5cblxuXG4iLCJjb25zdCBNb2R1bGUgPSByZXF1aXJlKCdtb2R1bGUnKTtcbmltcG9ydCB7IGhvb2tJc3RhbmJ1bCwgaG9va1JlcXVpcmUsIHJ1blVuZGVySXN0YW5idWwgfSBmcm9tICcuL2hvb2tzJztcblxuaWYgKHJ1blVuZGVySXN0YW5idWwocmVxdWlyZS5jYWNoZSkpIHtcbiAgY29uc3QgaXN0YW5idWwgPSByZXF1aXJlKCdpc3RhbmJ1bCcpOyAgXG4gIGhvb2tJc3RhbmJ1bChpc3RhbmJ1bCk7XG59IGVsc2Uge1xuICBob29rUmVxdWlyZShNb2R1bGUpO1xufVxuXG4vLyBDb25mb3JtIHRvIHBvc3QtcmVxdWlyZS1ob29rIGZvciBpc3RhbmJ1bFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG51bGw7XG59Il0sIm5hbWVzIjpbImZzIiwicmVxdWlyZSIsInBhdGgiLCJPU19SZWdleHBzIiwiYnVpZFJlZ2V4cCIsInNlcGFyYXRvciIsInNlcCIsInJlZ2V4IiwicHJvY2VzcyIsImVudiIsIkFVUkFfSE9PS19SRUdFWCIsIlJlZ0V4cCIsImlzQXVyYUZpbGUiLCJmaWxlbmFtZSIsImF1cmFSZWdleCIsInRlc3QiLCJhdXJhQ29kZVRyYW5zZm9ybWVyIiwiY29kZSIsImhvb2tJc3RhbmJ1bCIsIl9pc3RhbmJ1bCIsIm9yaWdpbmFsSG9va1JlcXVpcmUiLCJob29rIiwiaG9va1JlcXVpcmUiLCJtYXRjaGVyIiwidHJhbnNmb3JtZXIiLCJvcHRpb25zIiwidHJhbnNmb3JtZXJXcmFwcGVyIiwiX01vZHVsZSIsIm9yaWdpbmFsSnNFeHRlbnNpb24iLCJfZXh0ZW5zaW9ucyIsIm1vZHVsZSIsInJlYWRGaWxlU3luYyIsIl9jb21waWxlIiwicnVuVW5kZXJJc3RhbmJ1bCIsIl9jYWNoZSIsIk9iamVjdCIsImtleXMiLCJzb21lIiwia2V5IiwiaW5kZXhPZiIsIk1vZHVsZSIsImNhY2hlIiwiaXN0YW5idWwiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFNQSxLQUFLQyxRQUFRLElBQVIsQ0FBWDtBQUNBLElBQU1DLE9BQU9ELFFBQVEsTUFBUixDQUFiOztBQUVBLElBQUlFLGFBQWEsRUFBakI7OztBQUdBLElBQU1DLGFBQWEsU0FBYkEsVUFBYSxNQUFPO01BQ2xCQyxZQUFZLE9BQU9DLEdBQXpCO01BQ0lDLGdCQUFjRixTQUFkLFlBQThCQSxTQUE5QixVQUE0Q0EsU0FBNUMsVUFBMERBLFNBQTFELHVDQUFKOztNQUVJRyxRQUFRQyxHQUFSLENBQVlDLGVBQWhCLEVBQWlDO1lBQ3ZCRixRQUFRQyxHQUFSLENBQVlDLGVBQXBCOztTQUVLLElBQUlDLE1BQUosQ0FBV0osS0FBWCxDQUFQO0NBUEY7QUFTQSxBQUFPLElBQU1LLGFBQWEsU0FBYkEsVUFBYSxDQUFDQyxRQUFELEVBQThCO01BQW5CUCxHQUFtQix1RUFBYkosS0FBS0ksR0FBUTs7TUFDbERRLFlBQVlYLFdBQVdHLEdBQVgsQ0FBaEI7TUFDSSxDQUFDUSxTQUFMLEVBQWdCO2dCQUNGWCxXQUFXRyxHQUFYLElBQWtCRixXQUFXRSxHQUFYLENBQTlCOztTQUVLUSxVQUFVQyxJQUFWLENBQWVGLFFBQWYsQ0FBUDtDQUxLOzs7QUFTUCxBQUFPLElBQU1HLHNCQUFzQixTQUF0QkEsbUJBQXNCLENBQUNDLElBQUQsRUFBVTtTQUNwQyxvQkFBb0JBLElBQTNCO0NBREs7O0FBS1AsQUFBTyxTQUFTQyxZQUFULENBQXNCQyxTQUF0QixFQUFpQzs7TUFFbENDLHNCQUFzQkQsVUFBVUUsSUFBVixDQUFlQyxXQUF6Qzs7WUFFVUQsSUFBVixDQUFlQyxXQUFmLEdBQTZCLFVBQVNDLE9BQVQsRUFBa0JDLFdBQWxCLEVBQStCQyxPQUEvQixFQUF3QzthQUMxREMsa0JBQVQsQ0FBNEJULElBQTVCLEVBQWtDSixRQUFsQyxFQUE0QzthQUNuQ1csWUFBWVosV0FBV0MsUUFBWCxJQUF3Qkcsb0JBQW9CQyxJQUFwQixDQUF4QixHQUFvREEsSUFBaEUsRUFBc0VKLFFBQXRFLENBQVA7O1dBRUtPLG9CQUFvQkcsT0FBcEIsRUFBNkJHLGtCQUE3QixFQUFpREQsT0FBakQsQ0FBUDtHQUpGOzs7QUFRRixBQUFPLFNBQVNILFdBQVQsQ0FBcUJLLE9BQXJCLEVBQThCO01BQzdCQyxzQkFBc0JELFFBQVFFLFdBQVIsQ0FBb0IsS0FBcEIsQ0FBNUI7O1VBRVFBLFdBQVIsQ0FBb0IsS0FBcEIsSUFBNkIsVUFBVUMsTUFBVixFQUFrQmpCLFFBQWxCLEVBQTRCOztRQUVqRCxDQUFDRCxXQUFXQyxRQUFYLENBQUwsRUFBMkI7YUFDbEJlLG9CQUFvQkUsTUFBcEIsRUFBNEJqQixRQUE1QixDQUFQOzs7UUFHRUksT0FBT0Qsb0JBQW9CaEIsR0FBRytCLFlBQUgsQ0FBZ0JsQixRQUFoQixFQUEwQixNQUExQixDQUFwQixFQUF1REEsUUFBdkQsQ0FBWDtXQUNPbUIsUUFBUCxDQUFnQmYsSUFBaEIsRUFBc0JKLFFBQXRCO0dBUEo7OztBQVdGLEFBQU8sSUFBTW9CLG1CQUFtQixTQUFuQkEsZ0JBQW1CLENBQUNDLE1BQUQ7U0FBWUMsT0FBT0MsSUFBUCxDQUFZRixNQUFaLEVBQ2pCRyxJQURpQixDQUNaLFVBQUNDLEdBQUQ7V0FBU0EsSUFBSUMsT0FBSixDQUFZLHVCQUFaLE1BQXlDLENBQUMsQ0FBbkQ7R0FEWSxDQUFaO0NBQXpCOztBQ3ZEUCxJQUFNQyxTQUFTdkMsUUFBUSxRQUFSLENBQWY7QUFDQSxBQUVBLElBQUlnQyxpQkFBaUJoQyxRQUFRd0MsS0FBekIsQ0FBSixFQUFxQztNQUM3QkMsV0FBV3pDLFFBQVEsVUFBUixDQUFqQjtlQUNheUMsUUFBYjtDQUZGLE1BR087Y0FDT0YsTUFBWjs7OztBQUlGVixPQUFPYSxPQUFQLEdBQWlCLFlBQVc7U0FDbkIsSUFBUDtDQURGIn0=
