window.DinosaurPill.Matcher = (function matcher(DinosaurPill, Backbone) {
  var Ledger = DinosaurPill.Ledger;

  var Matcher = function() {
    DinosaurPill.on(DinosaurPill.Events.LOOKING_AT, function(lookingAt) {
      this.match(lookingAt);
    }, this);

    DinosaurPill.on(DinosaurPill.Events.ATTEMPT_LOOKING_AT, function(lookingAt) {
      this.match(lookingAt);
    }, this);

    this.on('match', function(lookingAt, result) {
      DinosaurPill.takedown(lookingAt, result);
    }, this);

    this.on('partial-match', function(lookingAt, result) {
    }, this);
  };

  _.extend(Matcher.prototype, Backbone.Events);

  Matcher.prototype.match = function match(lookingAt) {
    if (lookingAt.isNothing()) {
      this.trigger('no-match', lookingAt);
      return;
    }

    Ledger.enqueue(function(db) {
      Ledger.Website.findForURI(db, lookingAt.uri, _.bind(function(error, result) {
        if (!result) {
          this.trigger('no-match', lookingAt);
          return;
        }

        this.trigger('match', lookingAt, result);
        this.trigger('partial-match', lookingAt, result);
      }, this));
    }, this);
  };

  return new Matcher();
})(window.DinosaurPill, window.Backbone);
