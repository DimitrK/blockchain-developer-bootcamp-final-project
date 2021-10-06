require('dotenv').configure();
const {makeUpload} = require('./webpack/scripts/deployHelpers');
const git = require('./webpack/gitRevision');
const s3AppPath = process.env.S3_APP_PATH ||  || 'client';

makeUpload().of(s3AppPath).from('releases').to('production').withVersion(git.version()).doFile('index.html');

makeUpload()
  .of(s3AppPath)
  .from('releases')
  .to('production')
  .withVersion(git.version())
  .withTransformer(js => {
    return js.replace(new RegExp(`releases/remoteEntry.${git.version()}.js`, 'g'), 'production/remoteEntry.js');
  })
  .doFile('remoteEntry.js');

makeUpload().of(s3AppPath).to('production').withVersion(git.version()).doVersion();
