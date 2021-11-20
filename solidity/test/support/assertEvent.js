export const assertEvent = (tx, eventName, reasonFailed) => {
  const {event, args} = tx.logs[0];
  assert.equal(event, eventName, reasonFailed);

  const meta = {
    withValues: (argsExpected, reasonFailed) => {
      const argsExpectedArray =
        argsExpected instanceof Array ? argsExpected : Object.values(argsExpected).length;

      if (!args.__length__ && !argsIncluded.length) {
        assert.equal(true, true);
      }

      if (Number(args.__length__) !== argsExpectedArray.length) {
        assert.fail(`${reasonFailed} [args length mismatch ${argsExpected.length}/${args.__length__}]`);
      }

      const passedCheck = argsExpectedArray.every((arg, i) => args[i] == arg);

      if (passedCheck) {
        assert.equal(true, true);
      } else {
        assert.fail(reasonFailed);
      }

      return meta;
    },
    withKeys: (keysExpected = [], reasonFailed) => {
      const passedCheck = keysExpected.every((key) => key in args);

      if(passedCheck) {
        assert.equal(true, true);
      } else {
        assert.fail(reasonFailed);
      }

      return meta;
    }
  };

  return meta;
};
