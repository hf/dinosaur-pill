(function() {
  var expect = chai.expect;

  describe('DinosaurPill.Database', function() {
    describe('@@', function() {
      it('should extend Backbone.Events', function() {
        var proto = DinosaurPill.Database.prototype;

        expect(proto).to.have.property('on');
        expect(proto).to.have.property('off');
        expect(proto).to.have.property('once');
        expect(proto).to.have.property('trigger');
      });

      it('should have NAME and VERSION', function() {
        expect(DinosaurPill.Database).to.have.property('VERSION');
        expect(DinosaurPill.Database.VERSION).to.be.a('number');

        expect(DinosaurPill.Database).to.have.property('NAME');
        expect(DinosaurPill.Database.NAME).to.be.a('string');
      });
    });
  });

  describe('DinosaurPill.Database.Migrations', function() {
    describe('@@', function() {
      it('should exist', function() {
          expect(DinosaurPill.Database).to.have.property('Migrations');
          expect(DinosaurPill.Database.Migrations).to.be.an.instanceof(Array);

          expect(DinosaurPill.Database.Migrations).to.have.property('run');
          expect(DinosaurPill.Database.Migrations.run).to.be.a('function');
      });

      it('should match Database.VERSION', function() {
        expect(DinosaurPill.Database.VERSION).to.equal(DinosaurPill.Database.Migrations.length);
      });
    });
  });
})();
