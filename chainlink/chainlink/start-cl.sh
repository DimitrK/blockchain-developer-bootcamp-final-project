#! /bin/bash

docker run -p 6688:6688 -it -v $(pwd)/chainlink:/chainlink --env-file $(pwd)/chainlink/chainlink-dev.env\
 --env-file $(pwd)/build/addrs.env -e ETH_URL=ws://host.docker.internal:8546\
 --name chainlink-dev -d smartcontract/chainlink:1.0.0 local n -p /chainlink/chainlink.pwd -a /chainlink/api.pwd
