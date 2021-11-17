const ether = (amount, unit = ether.units.WEI) => {
  const inWei = amount * 10 ** unit;
  const to = {};
  Object.keys(ether.units).forEach(u => {
     to[u.toLowerCase()] = () => inWei / 10 ** ether.units[u];
  });

  return {to};
}

ether.units = Object.freeze({
  WEI: 0,
  GWEI: 9,
  ETH: 18
});

export default ether;
