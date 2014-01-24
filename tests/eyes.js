(function eyes(DinosaurPill, Backbone) {
  var expect = chai.expect;

  describe('DinosaurPill.LookingAt', function() {
    describe('NOTHING', function() {
      it('should create a new NOTHING (isNothing) object', function(done) {
        var a = null, b = null;

        _.delay(function() {
          a = DinosaurPill.LookingAt.NOTHING;
        }, 0);

        _.delay(function() {
          b = DinosaurPill.LookingAt.NOTHING
        }, 10);

        _.delay(function() {
          expect(a).not.to.equal(b);
          expect(b).not.to.equal(a);
          expect(a.timestamp).not.to.equal(b.timestamp);
          expect(a.isNothing()).to.be.true;
          expect(b.isNothing()).to.be.true;

          done();
        }, 20);
      });
    });

    describe('fromTab()', function() {
      it('should create a new NOTHING (isNothing) object without a tab', function() {
        var lookingAt = DinosaurPill.LookingAt.fromTab(null);

        expect(lookingAt).not.to.be.null;
        expect(lookingAt).not.to.be.undefined;
        expect(lookingAt.isNothing()).to.be.true;
        expect(lookingAt.timestamp).not.to.equal(0);
      });

      it('should create a new object (!isNothing) with a tab-like object', function() {
        var lookingAt = DinosaurPill.LookingAt.fromTab({
          url: "http://google.com"
        });

        expect(lookingAt).not.to.be.null;
        expect(lookingAt).not.to.be.undefined;
        expect(lookingAt.isNothing()).to.be.false;
        expect(lookingAt.uri).to.be.an.instanceof(URI);
        expect(lookingAt.rawURI).to.be.a('string');
        expect(lookingAt.timestamp).not.to.equal(0);
      });

      it('should create a new NOTHING object without a URL in tab-like object', function() {
        var lookingAt = DinosaurPill.LookingAt.fromTab({});

        expect(lookingAt).not.to.be.null;
        expect(lookingAt).not.to.be.undefined;
        expect(lookingAt.isNothing()).to.be.true;
        expect(lookingAt.uri).to.be.null;
        expect(lookingAt.rawURI).to.be.null;
        expect(lookingAt.timestamp).not.to.equal(0);
      });
    });
  });
})(window.DinosaurPill, window.Backbone);
