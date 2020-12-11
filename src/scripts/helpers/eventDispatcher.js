function EventDispatcher() {
  this.events = {};
}

EventDispatcher.prototype.listen = function (event, listener) {
  if (typeof(this.events[event]) === 'undefined') {
    this.events[event] = [];
  }

  if (typeof(listener) === 'function') {
    this.events[event].push(listener);
  }

  return this;
};

EventDispatcher.prototype.forgot = function (event) {
  this.events[event] = [];

  return this;
};

EventDispatcher.prototype.dispatch = function (event, params) {
  let result = true;

  if (Array.isArray(this.events[event])) {
    this.events[event].forEach(function (listener) {
      result = listener.apply(null, params) || false;
    });
  }

  return result;
};

export default EventDispatcher;
