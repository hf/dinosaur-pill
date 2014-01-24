window.DinosaurPill = (function(DinosaurPill) {
  if (!_.isObject(DinosaurPill)) {
    DinosaurPill = {
      DEBUG: true,

      Events: {
        LOOKING_AT:   'looking-at',
        ATTEMPT_LOOKING_AT: 'attempt-to-look-at',
        TAKEDOWN: 'takedown',
        SUSPENDING: 'suspending'
      }
    };
  }

  _.extend(DinosaurPill, Backbone.Events);

  DinosaurPill.lookAt = function lookAt(lookingAt) {
    DinosaurPill.trigger(DinosaurPill.Events.LOOKING_AT, lookingAt, DinosaurPill.CURRENT_EYES);

    DinosaurPill.CURRENT_EYES = lookingAt;
  };

  DinosaurPill.attemptToLookAt = function willLookAt(lookingAt) {
    DinosaurPill.trigger(DinosaurPill.Events.ATTEMPT_LOOKING_AT, lookingAt);
  };

  DinosaurPill.takedown = function takedown(lookingAt, website) {
    DinosaurPill.trigger(DinosaurPill.Events.TAKEDOWN, lookingAt, website);
  };

  DinosaurPill.suspend = function suspend() {
    DinosaurPill.trigger(DinosaurPill.Events.SUSPENDING);
  };

  if (DinosaurPill.DEBUG) {
    DinosaurPill.on(DinosaurPill.Events.LOOKING_AT, function(lookingAt) {
      console.log('looking-at', lookingAt.toString());
    }, {});

    DinosaurPill.on(DinosaurPill.Events.ATTEMPT_LOOKING_AT, function(lookingAt) {
      console.log('attempt-looking-at', lookingAt.toString());
    }, {});
  }

  return DinosaurPill;
})(window.DinosaurPill);
