'use strict';

if (typeof global.DOMException === 'undefined') {
  global.DOMException = (function () {
    function DOMException(message, name) {
      this.message = message || '';
      this.name = name || 'Error';
      var error = new Error(message);
      this.stack = error.stack;
    }
    DOMException.prototype = Object.create(Error.prototype);
    DOMException.prototype.constructor = DOMException;
    return DOMException;
  })();
}
