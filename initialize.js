window.DinosaurPill = (function(DinosaurPill) {
  if (!_.isObject(DinosaurPill)) {
    DinosaurPill = {
      DEBUG: true,

      Events: {
        LOOKING_AT: 'looking-at'
      }
    };
  }

  _.extend(DinosaurPill, Backbone.Events);

  DinosaurPill.lookAt = function lookAt(lookingAt) {
    DinosaurPill.trigger(DinosaurPill.Events.LOOKING_AT, lookingAt);
  };

  if (DinosaurPill.DEBUG) {
    DinosaurPill.on(DinosaurPill.Events.LOOKING_AT, function(lookingAt) {
      console.log('looking-at', lookingAt.toString());
    }, window);
  }

  return DinosaurPill;
})(window.DinosaurPill);
