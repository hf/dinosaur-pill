window.DinosaurPill.LookingAt = (function(DinosaurPill, Backbone) {
  var LookingAt = function LookingAt(options) {
    options = options || {};
    options = _.pick(options, 'tabID', 'uri', 'timestamp');

    this._tabID = options.tabID;
    this._rawURI = options.uri;
    this._timestamp = options.timestamp || Date.now();

    this._uri = null;

    if (!_.isNull(this._rawURI)) {
      this._uri = new URI(this._rawURI);
    }
  };

  LookingAt.fromTab = function fromTab(tab) {
    if (!tab || !tab.url) {
      return LookingAt.NOTHING;
    }

    return new LookingAt({
      uri:   tab.url,
      tabID: tab.id,
      timestamp: Date.now()
    });
  };

  Object.defineProperty(LookingAt, 'NOTHING', {
    enumerable: false,
    configurable: false,
    get: function() {
      return new LookingAt({ uri: null, timestamp: Date.now(), tabID: null });
    }
  });

  Object.defineProperty(LookingAt.prototype, 'rawURI', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this._rawURI;
    }
  });

  Object.defineProperty(LookingAt.prototype, 'uri', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this._uri;
    }
  });

  Object.defineProperty(LookingAt.prototype, 'tabID', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this._tabID;
    }
  });

  Object.defineProperty(LookingAt.prototype, 'timestamp', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this._timestamp;
    }
  });

  LookingAt.prototype.isNothing = function isNothing() {
    return _.isNull(this.tabID);
  };

  LookingAt.prototype.toString = function toString() {
    if (this.isNothing()) {
      return "@" + this.timestamp + " - Looking at nothing.";
    }

    return "@" + this.timestamp + " - Looking at tab#" + this.tabID + ", URI: " + this.rawURI;
  };

  return LookingAt;
})(window.DinosaurPill, window.Backbone);
