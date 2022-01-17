const objToArray = obj => {
  if (typeof obj !== 'object') {
    return obj.toString();
  }

  return Object.values(obj).reduce((acc, v) => {
    if (Object.prototype.toString.call(v) === '[object Object]') {
      acc.push(Object.values(v).map(objToArray));
    } else {
      acc.push(v.toString());
    }
    return acc;
  }, []);
};

export const assertEvent = (tx, eventName, reasonFailed) => {
  const {event, args} = tx.logs.find(({event}) => event === eventName) || {};
  assert.equal(event, eventName, reasonFailed);

  const meta = {
    withValues: (argsExpected, reasonFailed) => {
      const argsExpectedArray = argsExpected instanceof Array ? argsExpected : Object.values(argsExpected).length;

      if (!args.__length__ && !argsIncluded.length) {
        assert.equal(true, true);
      }

      if (Number(args.__length__) !== argsExpectedArray.length) {
        assert.fail(`${reasonFailed} [args length mismatch ${argsExpected.length}/${args.__length__}]`);
      }

      const passedCheck = argsExpectedArray.every((arg, i) => {
        return typeof arg === 'object'
          ? assert.includeDeepMembers(args[i], objToArray(arg)) === undefined
          : assert.equal(args[i], arg) === undefined;
      });

      if (passedCheck) {
        assert.equal(true, true);
      } else {
        assert.fail(reasonFailed);
      }

      return meta;
    },
    withKeys: (keysExpected = [], reasonFailed) => {
      const passedCheck = keysExpected.every(key => key in args);

      if (passedCheck) {
        assert.equal(true, true);
      } else {
        assert.fail(reasonFailed);
      }

      return meta;
    }
  };

  return meta;
};

export const eventValueSelector = (tx, eventName, key) => {
  const {args} = tx.logs.find(({event}) => event === eventName) || {};
  if (!args || !args.__length__) {
    throw new Error('invalid selector for tx');
  }
  return args[key];
};
