import simpleStorage from '@/app/contracts/simpleStorageFactory';

export default function (tokenId, web3) {
  const contract = simpleStorage(web3);

  return new Promise((resolve, reject) => {
    contract.then((instance) => {
      instance
        .getToken(tokenId)
        .then((response) => {
          resolve([parseInt(response[0].toString(), 10), response[1].toString()]);
        })
        .catch(reject);
    });
  });
}
