window.DinosaurPill.Ledger = (function ledger(DinosaurPill, Backbone) {
  var Ledger = function Ledger() {
    this._db = Ledger.createDatabase();

    this._queue = [];

    this._db.on('success', function() {
      this.trigger('dequeuing', this);

      _.each(this._queue, function(action) {
        action(this.db, this);
      });

      this._queue = null;

      this.trigger('dequeued', this);
    });

    DinosaurPill.on(DinosaurPill.Events.LOOKING_AT, function(lookingAt) {
      this.lookingAt(lookingAt);
    }, this);
  };

  Ledger.ObjectStores = Ledger.prototype.ObjectStores = {
      WEBSITES: 'websites',
      KeyPaths: {
        WEBSITES: 'domain'
      }
  };

  Ledger.Migrations = Ledger.prototype.Migrations = [
    function(db) {
      if (!db.objectStoreNames.contains(Ledger.ObjectStores.WEBSITES)) {
        db.createObjectStore(Ledger.ObjectStores.WEBSITES, { keyPath: Ledger.ObjectStores.KeyPaths.WEBSITES });
      }
    }
  ];

  Ledger.Migrations.run = Ledger.prototype.Migrations.run = function migrations(db, newVersion, oldVersion) {
    _.each(Ledger.Migrations.slice(oldVersion, newVersion), function(migration, index) {
      migration(db);
    });
  };

  Ledger.NAME = Ledger.prototype.NAME = 'dinosaur-pill';
  Ledger.VERSION = Ledger.prototype.VERSION = Ledger.Migrations.length;

  Ledger.createDatabase = Ledger.prototype.createDatabase = function create(options) {
    options = options || {};
    options.migrations = Ledger.Migrations;

    return new DinosaurPill.Database(Ledger.NAME, Ledger.VERSION, options);
  };

  Ledger.Websites = Ledger.prototype.Websites = {};
  Ledger.Websites.findForURI = Ledger.prototype.Websites.findForURI = function findForURI(db, uri, callback) {
    console.log('here');

    var tx = db.transaction("websites")
      , rq = tx.get("websites", uri.domain());

    tx.on('complete', function() {
      callback(null, rq.result);
    });

    tx.on('error', function() {
      callback(rq.error, null);
    });
  };

  _.extend(Ledger.prototype, Backbone.Events);

  Object.defineProperty(Ledger.prototype, 'db', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this._db;
    }
  });

  Ledger.prototype.enqueue = function enqueue(action) {
    if (_.isNull(this._queue)) {
      action(db, this);
      return;
    }

    this._queue.push(action);
  };

  Ledger.prototype.lookingAt = function lookingAt(lookingAt) {
    if (lookingAt.isNothing()) {
      return;
    }

    Ledger.Websites.findForURI(this.db, lookingAt.uri, function(error, result) {
      console.log('found-for-uri', error, result);

      if (error) {
        return;
      }

      if (_.isObject(result)) {
        chrome.tabs.update(lookingAt.tabID, { url: chrome.extension.getURL("/pill.html") });

        chrome.tabs.query({ url: ("*://*." + result.domain + "/*") }, function(tabs) {
          console.log('tabs', tabs, ("*://*." + result.domain + "/*"));
          _.each(tabs, function(tab) {
            chrome.tabs.update(tab.id, { url: chrome.extension.getURL("/pill.html") });
          });
        });
      }
    });
  };

  return new Ledger();
})(window.DinosaurPill, window.Backbone);
