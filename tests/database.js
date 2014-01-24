(function() {
  var expect = chai.expect;

  describe('DinosaurPill.Database', function() {
    describe('self', function() {
      it('should extend Backbone.Events', function() {
        var proto = DinosaurPill.Database.prototype;

        expect(proto).to.have.property('on');
        expect(proto).to.have.property('off');
        expect(proto).to.have.property('once');
        expect(proto).to.have.property('trigger');
      });
    });

    describe('constructor', function() {
      var clearDatabase = function(done) {
        var rq = window.indexedDB.deleteDatabase("dinosaur-pill-test");

        rq.onsuccess = function() {
          done();
        };

        rq.onerror = function(event) {
          done(event);
        };
      };

      afterEach(clearDatabase);
      beforeEach(clearDatabase);

      it('should construct a new DinosaurPill.Database without opening', function() {
        var db = new DinosaurPill.Database("dinosaur-pill-test", 1, { open: false });

        expect(db.isOpen()).to.be.false;
        expect(db.db).to.be.null;
        expect(db.name).to.be.null;
        expect(db.version).to.be.null;
        expect(db.migrations).to.be.null;

        db.close();
      });

      it('should open (create) a new DinosaurPill.Database and delete it', function(done) {
        var db = new DinosaurPill.Database("dinosaur-pill-test", 1);

        expect(db.isOpen()).to.be.false;
        expect(db.name).to.not.be.null;
        expect(db.version).to.not.be.null;
        expect(db.migrations).to.be.null;

        db.on('ready', function() {
          expect(db.isOpen()).to.be.true;
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
          expect(db.name).to.be.null;
          expect(db.version).to.be.null;
          expect(db.migrations).to.be.null;

          done();
        });
      });

      it('should migrate DinosaurPill.Database with an array migrations', function(done) {
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

        var db = new DinosaurPill.Database("dinosaur-pill-test", version, { migrations: migrations });

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

      it('should migrate DinosaurPill.Database with a migrations.run function', function(done) {
        var upgradeNeeded = false
          , upgrading = false
          , upgraded = false;

        var db = new DinosaurPill.Database("dinosaur-pill-test", 1, { migrations: {
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

      it('should not migrate DinosaurPill.Database, i.e. trigger only an explicit upgrade-needed event', function(done) {
        var db = new DinosaurPill.Database("dinosaur-pill-test", 100)
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
  });
})();
