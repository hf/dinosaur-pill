window.DinosaurPill.Ledger = (function ledger(DinosaurPill, Backbone) {
  var Ledger = function Ledger() {
    this._db = Ledger.createDatabase();

    this._queue = [];

    this._db.on('ready', function() {
      console.log('rready');

      this.trigger('dequeuing', this);

      _.each(this._queue, function(action) {
        action(this.db, this);
      });

      this._queue = null;

      this.trigger('dequeued', this);
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

  Ledger.sync = function sync(method, child, options) {
    if (!(child.collection instanceof Ledger.Collection) || _.isNull(child.objectStore) || _.isUndefined(child.objectStore)) {
      throw new Error("Child model does not specify a Ledger.Collection or an IDBObjectStore name.");
    }

    switch (method) {
      case 'create':
        DinosaurPill.Ledger.enqueue(_.bind(function(db) {
          var tx = db.transaction(child.collection.objectStore, "readwrite")
            , os = tx.objectStore(child.collection.objectStore)
            , rq = null;

          if (os.keyPath) {
            rq = tx.add(os, child.toJSON());
          } else {
            rq = tx.add(os, child.toJSON(), child.id);
          }

          tx.on('complete', function() {
            options.success(null, rq.result);
          }, this);

          tx.on('error', function() {
            options.error(rq.error);
          });
        }, this));

        break;

      case 'read':
        DinosaurPill.Ledger.enqueue(_.bind(function(db) {
          var tx = db.transaction(child.collection.objectStore, "readonly")
            , rq = tx.get(child.collection.objectStore, child.id);

          tx.on('complete', function() {
            options.success(rq.result);
          }, this);

          tx.on('error', function() {
            options.error(rq.error);
          });
        }, this));

        break;

      case 'update':
        DinosaurPill.Ledger.enqueue(_.bind(function(db) {
          var tx = db.transaction(child.collection.objectStore, "readwrite")
            , os = tx.objectStore(child.collection.objectStore)
            , rq = null;

          if (os.keyPath) {
            tx.put(os, child.toJSON());
          } else {
            tx.put(os, child.toJSON(), child.id);
          }

          tx.on('complete', function() {
            options.success(rq.result);
          }, this);

          tx.on('error', function() {
            options.error(rq.error);
          });
        }, this));

        break;

      case 'delete':
        DinosaurPill.Ledger.enqueue(_.bind(function(db) {
          var tx = db.transaction(child.collection.objectStore, "readwrite")
            , rq = tx.delete(child.collection.objectStore, child.id);

          tx.on('complete', function() {
            options.success(rq.result);
          }, this);

          tx.on('error', function() {
            options.error(rq.error);
          });
        }, this));

        break;
    }
  };

  Ledger.Model = Backbone.Model.extend({
    objectStore: null,
    sync: function sync() {
      Ledger.sync.apply(this, arguments);
    }
  });

  Ledger.Collection = Backbone.Collection.extend({
    objectStore: null,
    sync: function sync() {
      Ledger.sync.apply(this, arguments);
    },
    fetch: null
  });

  Ledger.Website = Ledger.Model.extend({
    objectStore: Ledger.ObjectStores.WEBSITES,
    idAttribute: Ledger.ObjectStores.KeyPaths.WEBSITES,
  }, {
    findForURI: function findForURI(db, uri, callback) {
      var websites = Ledger.ObjectStores.WEBSITES
        , tx = db.transaction(websites)
        , rq = tx.get(websites, uri.domain());

      tx.on('complete', function() {
        console.log(rq.result);
        var result = rq.result;

        if (result) {
          result = new Ledger.Website(result);
        }

        callback(null, result);
      });

      tx.on('error', function() {
        callback(rq.error, null);
      });
    }
  });

  _.extend(Ledger.prototype, _.pick(Ledger, 'Website', 'Model', 'Collection', 'sync', 'createDatabase', 'Migrations', 'NAME', 'VERSION'));

  _.extend(Ledger.prototype, Backbone.Events);

  Object.defineProperty(Ledger.prototype, 'db', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this._db;
    }
  });

  Ledger.prototype.enqueue = function enqueue(action, context) {
    context = context || {};

    if (_.isNull(this._queue)) {
      action.call(context, this.db, this);
      return;
    }

    this._queue.push(_.bind(action, context));
  };

  return new Ledger();
})(window.DinosaurPill, window.Backbone);
