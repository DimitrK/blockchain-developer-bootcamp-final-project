# blockchain-developer-bootcamp-final-project

Consesys bootcamp

## Project description

🎬 [Video demo](https://share.getcloudapp.com/xQuzY4E4)

The project aimed to run abstract automations on ethereum blockchain. The initial idea was to allow the user to enter an
oracle (or select from a list of predefined such as eth price), the comparisson (equal, less or more than) and a
threshold value which will be the trigger point to execute an automation. A user should be able to create an automation
through a wizzard, where she could enter a 3rd party verified smart contract on etherscan, select the desired function
to run and fill any parameters required along with the amount(if payable). Once completed the flow the automation would
be ready. All this for a hefty fee.

The automation creation wizzard is a dynamic interface which fetches the ABI from etherscan based on the cotract address
provided by the user, then each abi function gets parsed and is marked as `payable` if is such. A dropdown listing all
the functions for the given contract is presented to the user. Once a function gets selected, the interface renders the
proper input fields based on the required parameters for the function.

## Design

Unfortunately due to the complexity of the project, a lot of time was lost in researching and trying to bypass
limitations impossed by the blockchain itself. Initially some kind of mechanism for cron jobs would be required for
checking occassionaly each automation and its oracle for meeting the give condition. That seemed like a tricky problem
to tackle since ethereum blockchain itself has no such mechanism.

One idea was that we should rely on either a centralised web server which would take care of the task being also a
single point of failure

Then starting experimenting with the concept of 3rd party server nodes running by some node operators which could
monitor the smart contract for automations that met their conditions and request from the SC to trigger their actions
using a reward as incentive. That could move some automations forward to the queue than others depending of the amount
of reward the end user would set, leaving eventually the decission on which automations should execute or not up to the
node operators which was also not ideal. Also, if none decides to become a node operator automations could not be
fullfilled even if the conditions were met.

After some more research I found [Chainlink keepers](https://docs.chain.link/docs/chainlink-keepers/introduction/_)
could do similar job being agnostic on the underlying smart contract. I tried to experiment with them and seemed
straight forward but the next problem arose; how to query the automations and find the ones which meet their conditions?
Blockchain does not provide such indexing/querying functionality and that's something I still can't answer. I tried
experimenting with [The Graph](https://thegraph.com/en/) network in hopes to get a solution on that. Unfortunatelly I
seem unable to query for matching conditions using a single query, I would need as many as there are comparisson
operations a user can have in her condition (3: =, >, <) which is not ideal. Even if I would do that, what happens if
the Graph returned more than 1 automations matching the criteria? Keepers call `performUpkeep` to smart contract in
order to execute a function, but the call itself is limited by a gas limit which could probably cover the execution of
one or two automations at best, what about the others that met the condition?

Finally, Chainlink Keepers and Graph queries require constantly LINK and GRT to remain operational which could not be
sustainable if there are automations with conditions hard to meet, that could deplete any reserves on these coins
without ever fullfiling.

### Trade offs

Athough the initial idea for the project was the one mentioned above, I trimmed it down on the parts that could cover at
least the basic requirements of project (as per readme). So a user is able to set up an automation (for a predefined
oracle) passing the parameters required for the function of the contract and paying the fee and any payable amount she
desires. The amount payed gets subtracted from the wallet and the UI informed presenting the new balance to the user

## Installation
- Use Node v12.22.x
- Clone the repo and run `yarn`
- Add a `.env` file under `./client` with your etherscan API keys
```
S3_APP_PATH="client"
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
ROLLBAR_POST_SERVER_TOKEN="asbsd"
ROLLBAR_ACCESS_TOKEN=""
CLOUDFRONT_DISTRIBUTION_ID=""
# Cloudfront cdn
CDN_DOMAIN=""
ETHERSCAN_API_KEY="ETHERSCANAPIKEY"
ETHERSCAN_API_URL="https://api.etherscan.io/api"
```
- Add a `.env` file under `./solidity` with your infura(optional) and etherscan API keys
```
HDWALLET_MNEMONIC="shiver author subject neglect forget toward artefact clerk stable lab art clarify"
ROPSTEN_PROVIDER_URL="https://ropsten.infura.io/v3/<key>"
RINKEBY_PROVIDER_URL="https://rinkeby.infura.io/v3/<key>"
MAINNET_PROVIDER_URL="https://mainnet.infura.io/v3/<key>"
ETHERSCAN_API_KEY="ETHERSCANAPIKEY"
```
- Start the server using `yarn workspace @athens/solidity start`. Make sure you are not running anything else on port
  `8546`
  - Test smart contracts using `yarn workspace @athens/solidity test`
- Start the client using `yarn workspace @athens/client start`. Make sure you are not running anything else on port
  `8080` That's it, you can now use it for the bare minimum requirements showcased

## Project structure

The project is based on a monorepo structure;

- Smart contracts are located into `/solidity/contracts` folder. The `/solidity` directory contains everythin needed for
  running ganache (`/scripts`) deploying (`/migrations`) and testing (`/test`) the smart contracts
- UI is written in React and is located into `/client/app` directory. The views for the wizzard are in
  `./views/etherscan` while using ethereum and etherscan providers and hooks found on `shared/providers` and
  `shared/hooks`. The code quality of the FE unfortunatelly is not the ideal one for me since I tried to focus on most
  unknown to me parts of the assignment (solidity) and do research on that.




Wallet address:
0xcEdA3d3654648a67Fc5F7060De6Ce83cC7aDD8Ca