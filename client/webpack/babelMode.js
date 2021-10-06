const getBabelMode = () => process.env.BABEL_MODE;

module.exports = {
  getBabelMode,
  isCjs() {
    return getBabelMode() === 'cjs';
  },
  isEsm() {
    return getBabelMode() === 'esm';
  }
};
