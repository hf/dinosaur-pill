(function() {
  var expect = chai.expect
    , databaseName = "dinosaur-pill-test"
    , clearDatabase = function(done) {
        var rq = window.indexedDB.deleteDatabase(databaseName);

        rq.onsuccess = function() {
          done();
        };

        rq.onerror = function(event) {
          done(event);
        };
      };

  describe('DinosaurPill.Database', function() {
    describe('self', function() {
      it('should support events', function() {
        var proto = DinosaurPill.Database.prototype;

        expect(proto).to.have.property('on');
        expect(proto).to.have.property('off');
        expect(proto).to.have.property('once');
        expect(proto).to.have.property('trigger');
      });
    });

    describe('constructor', function() {
      afterEach(clearDatabase);
      beforeEach(clearDatabase);

      it('should construct a new database without opening', function() {
        var db = new DinosaurPill.Database(databaseName, 1, { open: false });

        expect(db.isOpen()).to.be.false;
        expect(db.db).to.be.null;
        expect(db.name).to.be.null;
        expect(db.version).to.be.null;
        expect(db.migrations).to.be.null;

        db.close();
      });

      it('should open (create) and delete a database', function(done) {
        var db = new DinosaurPill.Database(databaseName, 1);

        expect(db.isOpen()).to.be.false;
        expect(db.db).to.be.null;
        expect(db.name).to.not.be.null;
        expect(db.version).to.not.be.null;
        expect(db.migrations).to.be.null;

        db.on('ready', function() {
          expect(db.isOpen()).to.be.true;
          expect(db.db).to.not.be.null;
          expect(db.name).to.not.be.null;
          expect(db.version).to.not.be.null;
          expect(db.migrations).to.be.null;

          db.delete();
        });

        db.on('error', function(event) {
          done(event);
        });

        db.on('deleted', function() {
          expect(db.isOpen()).to.be.false;
          expect(db.db).to.be.null;
          expect(db.name).to.be.null;
          expect(db.version).to.be.null;
          expect(db.migrations).to.be.null;

          done();
        });
      });

      it('should migrate with an array migrations', function(done) {
        var migrations = []
          , version = 100
          , i = 0
          , upgradeNeeded = false
          , upgrading = false
          , upgraded = false;

        for (i = 1; i <= version; i++) {
          migrations.push(function(db, newVersion, oldVersion, migrationVersion) {
            expect(upgradeNeeded).to.be.true;
            expect(upgrading).to.be.true;
            expect(upgraded).to.be.false;

            expect(db).to.be.an.instanceof(IDBDatabase);
            expect(newVersion).to.not.be.null;
            expect(oldVersion).to.not.be.null;
            expect(migrationVersion).to.not.be.null;
          });
        };

        var db = new DinosaurPill.Database(databaseName, version, { migrations: migrations });

        db.on('ready', function() {
          expect(upgradeNeeded).to.be.true;
          expect(upgrading).to.be.true;
          expect(upgraded).to.be.true;

          done();
        });

        db.on('error', function(event) {
          done(event);
        });

        db.on('upgrading', function() {
          expect(upgradeNeeded).to.be.true;
          expect(upgrading).to.be.false;

          upgrading = true;
        });

        db.on('upgraded', function() {
          expect(upgradeNeeded).to.be.true;
          expect(upgrading).to.be.true;
          expect(upgraded).to.be.false;

          upgraded = true;
        });

        db.on('upgrade-needed', function() {
          expect(upgradeNeeded).to.be.false;

          upgradeNeeded = true;
        });
      });

      it('should migrate with a migrations.run function', function(done) {
        var upgradeNeeded = false
          , upgrading = false
          , upgraded = false;

        var db = new DinosaurPill.Database(databaseName, 1, { migrations: {
          run: function(db, newVersion, oldVersion) {
            expect(upgradeNeeded).to.be.true;
            expect(upgrading).to.be.true;
            expect(upgraded).to.be.false;

            expect(db).to.be.an.instanceof(IDBDatabase);
            expect(newVersion).to.not.be.null;
            expect(oldVersion).to.not.be.null;
          }
        }});

        db.on('ready', function() {
          expect(upgradeNeeded).to.be.true;
          expect(upgrading).to.be.true;
          expect(upgraded).to.be.true;

          done();
        });

        db.on('error', function(event) {
          done(event);
        });

        db.on('upgrading', function() {
          expect(upgradeNeeded).to.be.true;
          expect(upgrading).to.be.false;

          upgrading = true;
        });

        db.on('upgraded', function() {
          expect(upgradeNeeded).to.be.true;
          expect(upgrading).to.be.true;
          expect(upgraded).to.be.false;

          upgraded = true;
        });

        db.on('upgrade-needed', function() {
          expect(upgradeNeeded).to.be.false;

          upgradeNeeded = true;
        });
      });

      it('should not migrate, i.e. only trigger an explicit "upgrade-needed" event', function(done) {
        var db = new DinosaurPill.Database(databaseName, 100)
          , upgradeNeeded = false
          , upgrading = false
          , upgraded = false;

        db.on('ready', function() {
          expect(upgrading).to.be.false;
          expect(upgraded).to.be.false;
          expect(upgradeNeeded).to.be.true;

          done();
        });

        db.on('error', function(event) {
          done(event);
        });

        db.on('upgrade-needed', function() {
          expect(upgrading).to.be.false;
          expect(upgraded).to.be.false;
          expect(upgradeNeeded).to.be.false;

          upgradeNeeded = true;
        });

        db.on('upgrading', function() {
          expect(upgrading).to.be.false;

          upgrading = true;
        });

        db.on('upgraded', function() {
          expect(upgraded).to.be.false;

          upgraded = true;
        });
      });
    });

    describe('close()', function() {
      afterEach(clearDatabase);
      beforeEach(clearDatabase);

      it('should properly close an open database', function(done) {
        var db = new DinosaurPill.Database(databaseName, 1)
          , closing = false
          , closed  = false;

        db.on('ready', function() {
          db.close();
        });

        db.on('error', function(event) {
          done(event);
        });

        db.on('closing', function() {
          expect(closing).to.be.false;

          expect(db.isOpen()).to.be.true;
          expect(db.db).to.not.be.null;
          expect(db.name).to.not.be.null;
          expect(db.version).to.not.be.null;

          closing = true;
        });

        db.on('closed', function() {
          expect(closed).to.be.false;
          expect(closing).to.be.true;

          expect(db.isOpen()).to.be.false;
          expect(db.db).to.be.null;
          expect(db.name).to.be.null;
          expect(db.version).to.be.null;
          expect(db.migrations).to.be.null;

          closed = true;

          done();
        });
      });
    });

    describe('transaction()', function() {
      afterEach(clearDatabase);
      beforeEach(clearDatabase);

      it('should not create a new transaction on a non-open database', function() {
        var db = new DinosaurPill.Database(databaseName, 1, { open: false });

        expect(db.isOpen()).to.be.false;
        expect(db.db).to.be.null;
        expect(db.transaction()).to.be.null;
      });

      it('should create a new transaction on an open database', function(done) {
        var objectStores = [
          "exampleOS1",
          "exampleOS2",
          "exampleOS3"
         ], modes = [
          "readonly",
          "readwrite"
         ];

        var migrations = {
          run: function(db, newVersion, oldVersion) {
            _.each(objectStores, function(objectStore) {
              db.createObjectStore(objectStore);
            });
          }
        };

        var db = new DinosaurPill.Database(databaseName, 1, { migrations: migrations })
          , upgraded = false;

        db.on('ready', function() {
          expect(upgraded).to.be.true;

          expect(db.isOpen()).to.be.true;
          expect(db.db).to.be.an.instanceof(IDBDatabase);

          var tx = db.transaction(objectStores);

          expect(tx).to.not.be.null;
          expect(tx.mode).to.equal("readonly");
          expect(tx).to.be.an.instanceof(DinosaurPill.Database.Transaction);
          expect(tx.db).to.equal(db);
          expect(tx.transaction).to.be.an.instanceof(IDBTransaction);

          expect(_.isEmpty(_.difference(tx.objectStores, objectStores))).to.be.true;

          var sample = _.sample(objectStores)
            , ptx = tx
            , mode = _.sample(modes);

          tx = db.transaction(sample, mode);

          expect(tx).to.not.be.null;
          expect(tx.mode).to.equal(mode);
          expect(tx).to.be.an.instanceof(DinosaurPill.Database.Transaction);
          expect(tx.db).to.equal(db);
          expect(tx.transaction).to.be.an.instanceof(IDBTransaction);

          expect(_.isEmpty(_.difference(tx.objectStores, [sample]))).to.be.true;

          expect(tx).to.not.equal(ptx);

          done();
        });

        db.on('error', function(event) {
          done(event);
        });

        db.on('upgraded', function() {
          expect(upgraded).to.be.false;

          upgraded = true;
        });
      });
    });
  });

  describe('DinosaurPill.Database.Transaction', function() {
    describe('self', function() {
      it('should support events', function() {
        var proto = DinosaurPill.Database.prototype;

        expect(proto).to.have.property('on');
        expect(proto).to.have.property('off');
        expect(proto).to.have.property('once');
        expect(proto).to.have.property('trigger');
      });
    });

    describe('constructor', function() {
      afterEach(clearDatabase);
      beforeEach(clearDatabase);

    });
  });
})();
