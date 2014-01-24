window.DinosaurPill.Database = (function(DinosaurPill, Backbone) {
  var D = DinosaurPill.DEBUG;

  var Database = function Database(name, version, options) {
    if (_.isObject(name)) {
      options = name;
      name = null;
    }

    options = options || {};
    options = _.defaults(_.pick(options, 'open', 'migrations'),
      {
        open: !!name && !!version,
        migrations: null
      });

    this._db = null;
    this._name = null;
    this._version = null;
    this._migrations = null;

    if (options.open) {
      this.open(name, version, options.migrations);
    }

    if (D) {
      this.on('ready', function() {
        console.log('ready');
      });

      this.on('error', function(event) {
        console.log('error-db', event);
      });

      this.on('upgrade-needed', function(event) {
        console.log('upgrade-needed', event);
      });

      this.on('upgrading', function() {
        console.log('upgrading');
      });

      this.on('upgraded', function() {
        console.log('upgraded');
      });

      this.on('blocked', function() {
        console.log('blocked');
      });

      this.on('closing', function() {
        console.log('closing');
      });

      this.on('closed', function() {
        console.log('closed');
      });

      this.on('delete-blocked', function(event) {
        console.log('delete-blocked', event);
      });

      this.on('deleted', function() {
        console.log('deleted');
      });

      this.on('abort', function() {
        console.log('abort-db');
      });

      this.on('version-change', function(event) {
        console.log('version-change', event);
      });

      this.on('transaction-aborted', function(event) {
        console.log('transaction-aborted', event);
      });

      this.on('transaction-error', function(event) {
        console.log('transaction-error', event);
      });

      this.on('transaction-complete', function(event) {
        console.log('transaction-complete', event);
      });
    }
  };

  _.extend(Database.prototype, Backbone.Events);

  Database.Request = function Request(transaction, request) {
    this._transaction = transaction;
    this._request = request;

    this._request.onsuccess = _.bind(function(event) {
      this.trigger('success', this);
      this.transaction.trigger('request-success', event, this);
      this.db.trigger('request-success', event, this);
    }, this);

    this._request.onerror = _.bind(function(event) {
      this.trigger('error', this);
      this.transaction.trigger('request-error', event, this);
      this.db.trigger('request-error', event, this);
    }, this);
  };

  _.extend(Database.Request.prototype, Backbone.Events);

  Object.defineProperty(Database.Request.prototype, 'transaction', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this._transaction;
    }
  });

  Object.defineProperty(Database.Request.prototype, 'db', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this.transaction.db;
    }
  });

  Object.defineProperty(Database.Request.prototype, 'request', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this._request;
    }
  });

  Object.defineProperty(Database.Request.prototype, 'source', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this.request.source;
    }
  });

  Object.defineProperty(Database.Request.prototype, 'result', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this.request.result;
    }
  });

  Object.defineProperty(Database.Request.prototype, 'readyState', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this.request.readyState;
    }
  });

  Object.defineProperty(Database.Request.prototype, 'error', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this.request.error;
    }
  });

  Database.Transaction = function Transaction(database, objectStores, mode) {
    this._db = database;
    this._aborted  = false;
    this._error    = false;
    this._complete = false;

    this._objectStores = _.flatten([objectStores]);

    this._transaction = this.db.db.transaction(this._objectStores, mode);

    this._transaction.onabort = _.bind(function(event) {
      this._aborted = true;
      this.trigger('abort', this);
      this.db.trigger('transaction-aborted', this, event);
    }, this)

    this._transaction.onerror = _.bind(function(event) {
      this._error = true;
      this.trigger('error', event);
      this.db.trigger('transaction-error', this, event);
    }, this);

    this._transaction.oncomplete = _.bind(function() {
      this._complete = true;
      this.trigger('complete', event);
      this.db.trigger('transaction-complete', this);
    }, this);

    if (D) {
      this.off('abort');
      this.on('abort', function(event) {
        console.log('abort', event);
      });

      this.off('complete');
      this.on('complete', function(event) {
        console.log('complete', event);
      });

      this.off('error');
      this.on('error', function(event) {
        console.log('error', event);
      });
    }
  };

  _.extend(Database.Transaction.prototype, Backbone.Events);

  Database.Transaction.prototype.again = function again() {
    Database.Transaction.call(this, this.db, this.objectStores, this.mode);

    return this;
  };

  Object.defineProperty(Database.Transaction.prototype, 'objectStores', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this._objectStores;
    }
  });

  Object.defineProperty(Database.Transaction.prototype, 'transaction', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this._transaction;
    }
  });

  Object.defineProperty(Database.Transaction.prototype, 'db', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this._db;
    }
  });

  Object.defineProperty(Database.Transaction.prototype, 'mode', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this._transaction.mode;
    }
  });

  Object.defineProperty(Database.Transaction.prototype, 'error', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this.transaction.error;
    }
  });

  Database.Transaction.prototype.isAborted = function isAborted() {
    return this._aborted;
  };

  Database.Transaction.prototype.hasError = function hasError() {
    return this._error;
  };

  Database.Transaction.prototype.isComplete = function isComplete() {
    return this._complete;
  };

  Database.Transaction.prototype.isUsable = function isUsable() {
    return !this.isComplete() && !this.isAborted() && !this.hasError();
  };

  Database.Transaction.prototype.objectStore = function objectStore(name) {
    if (name instanceof IDBObjectStore) {
      name = name.name;
    }

    return this.transaction.objectStore(name);
  };

  Database.Transaction.prototype.abort = function abort() {
    return this.transaction.abort();
  };

  Database.Transaction.prototype.add = function add(objectStore, value, key) {
    if (!this.isUsable()) {
      return null;
    }

    objectStore = this.objectStore(objectStore);

    return new Database.Request(this, objectStore.add(value, key));
  };

  Database.Transaction.prototype.clear = function clear(objectStore) {
    if (!this.isUsable()) {
      return null;
    }

    objectStore = this.objectStore(objectStore);

    return new Database.Request(this, objectStore.clear());
  };

  Database.Transaction.prototype.delete = function(objectStore, key) {
    if (!this.isUsable()) {
      return null;
    }

    objectStore = this.objectStore(objectStore);

    return new Database.Request(this, objectStore.delete(key));
  };

  Database.Transaction.prototype.get = function get(objectStore, key) {
    if (!this.isUsable()) {
      return null;
    }

    objectStore = this.objectStore(objectStore);

    return new Database.Request(this, objectStore.get(key));
  };

  Database.Transaction.prototype.put = function put(objectStore, value, key) {
    if (!this.isUsable()) {
      return null;
    }

    objectStore = this.objectStore(objectStore);

    return new Database.Request(this, objectStore.put(value, key));
  };

  Database.prototype.open = function open(name, version, migrations) {
    if (migrations && migrations.length < version) {
      throw new Error("Cannot open database with too few migrations.");
    }

    this._name = name;
    this._version = version;
    this._migrations = migrations || null;

    var request = window.indexedDB.open(name, version)
      , migrate = _.bind(function(event) {
        this.trigger('upgrading', { oldVersion: event.oldVersion, newVersion: event.newVersion });

        if (!_.isFunction(migrations.run)) {
          _.each(this._migrations, function(migration, index) {
            migration.call({}, request.result, event.newVersion, event.oldVersion, index);
          });
        } else {
          this._migrations.run(request.result, event.newVersion, event.oldVersion);
        }

        this.trigger('upgraded', event.newVersion);
      }, this);

    request.onsuccess = _.bind(function(event) {
      this._db = request.result;

      this._db.onerror = _.bind(function(event) {
        this.trigger('error', event);
      }, this);

      this._db.onabort = _.bind(function(event) {
        this.trigger('abort', event);
      }, this);

      this._db.onversionchange = _.bind(function(event) {
        if (_.isNull(event.newVersion) || _.isNull(event.version)) {
          this.close();
        } else {
          console.log('here');
          this.trigger('version-change', event);
          if (migrations) {
            migrate(event);
          }
        }
      }, this);

      this.trigger('ready', this);
    }, this);

    request.onerror = _.bind(function(event) {
      this._db = null;

      this.trigger('error', event);
    }, this);

    request.onupgradeneeded = _.bind(function(event) {
      this.trigger('upgrade-needed', event);

      if (migrations) {
        migrate(event);
      }
    }, this);

    request.onblocked = _.bind(function(event) {
      this.trigger('blocked');
    }, this);
  };

  Object.defineProperty(Database.prototype, 'db', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this._db;
    }
  });

  Object.defineProperty(Database.prototype, 'version', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this._version;
    }
  });

  Object.defineProperty(Database.prototype, 'name', {
    enumerable: false,
    configurable: false,
    get: function() {
      return this._name;
    }
  });

  Object.defineProperty(Database.prototype, 'migrations', {
    enumerable: false,
    configurable: false,
    get: function () {
      return this._migrations;
    }
  });

  Database.prototype.isOpen = function isOpen() {
    return _.isObject(this.db);
  };

  Database.prototype.close = function close() {
    if (this.isOpen()) {
      this.trigger('closing', this);
      this._db.close();
      this._db = null;
      this._name = null;
      this._version = null;
      this._migrations = null;
      this.trigger('closed', this);
    }
  };

  Database.prototype.delete = function() {
    if (!this.isOpen()) {
      return false;
    }

    var request = window.indexedDB.deleteDatabase(this.name);

    request.onsuccess = _.bind(function(event) {
      this.trigger('deleted', this);
    }, this);

    request.onerror = _.bind(function(event) {
      this.trigger('error', event);
    }, this);

    request.onblocked = _.bind(function(event) {
      this.trigger('delete-blocked', event);
      this.close();
    }, this);

    return true;
  };

  Database.prototype.transaction = function transaction(objectStores, mode) {
    if (!this.isOpen()) {
      return null;
    }

    return new Database.Transaction(this, objectStores, mode || "readonly");
  };

  return Database;
})(window.DinosaurPill, window.Backbone);
