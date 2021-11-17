#! /bin/sh
mkdir -p .ganache
./node_modules/.bin/ganache-cli \
  --db .ganache \
  -l 8000038 \
  -i 1234 \
  -e 10000 \
  -a 10 \
  -g 134000000000 \
  -u 0 \
  -m "$HDWALLET_MNEMONIC"
