#! /bin/sh
mkdir -p .ganache
./node_modules/.bin/ganache-cli \
  --db .ganache \
  -l 8000038 \
  -i 1337 \
  -e 10000 \
  -a 10 \
  -g 134000000000 \
  -u 0 \
  -h 0.0.0.0 \
  -p 8546 \
  -m "$HDWALLET_MNEMONIC" \
  --verbose
