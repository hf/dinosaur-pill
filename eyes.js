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

  LookingAt.prototype.toObject = function toObject() {
    return { uri: this.rawURI, timestamp: this.timestamp, tabID: this.tabID };
  };

  LookingAt.prototype.toJSON = function toJSON() {
    return JSON.stringify(this.toObject());
  };

  return LookingAt;
})(window.DinosaurPill, window.Backbone);

(function current_eyes(DinosaurPill) {
  var property = 'dinosaur-pill-current-eyes'
    , current_eyes = window.localStorage.getItem(property);

  if (current_eyes) {
    current_eyes = JSON.parse(current_eyes);
  }

  if (current_eyes) {
    current_eyes = new DinosaurPill.LookingAt(current_eyes);
  }

  Object.defineProperty(DinosaurPill, 'CURRENT_EYES', {
    get: function() {
      return current_eyes;
    },

    set: function(eyes) {
      current_eyes = eyes;

      if (eyes) {
        eyes = eyes.toObject();
      }

      window.localStorage.setItem(property, JSON.stringify(eyes));
    }
  });
})(window.DinosaurPill);
