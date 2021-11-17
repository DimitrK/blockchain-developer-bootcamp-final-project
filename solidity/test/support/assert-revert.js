const errorString = 'VM Exception while processing transaction: ';

async function tryCatch(promise, reason, customError = '') {
  try {
    const result = await promise;
    assert.fail('Expected to revert, instead got: ' + result.toString());
  } catch (error) {
    assert(error, 'Expected a VM exception but did not get one');
    assert(
      error.message.search(errorString + reason + customError) >= 0,
      "Expected an error containing '" + errorString + reason + customError + "' but got '" + error.message + "' instead"
    );
  }
};

export const catchRevert = async function (promise, error) {
  await tryCatch(promise, 'revert ', error);
};

export const catchOutOfGas = async function (promise) {
  await tryCatch(promise, 'out of gas');
};

export const catchInvalidJump = async function (promise) {
  await tryCatch(promise, 'invalid JUMP');
};

export const catchInvalidOpcode = async function (promise) {
  await tryCatch(promise, 'invalid opcode');
};

export const catchStackOverflow = async function (promise) {
  await tryCatch(promise, 'stack overflow');
};

export const catchStackUnderflow = async function (promise) {
  await tryCatch(promise, 'stack underflow');
};

export const catchStaticStateChange = async function (promise) {
  await tryCatch(promise, 'static state change');
};

