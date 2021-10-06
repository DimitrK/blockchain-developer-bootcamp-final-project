const {commithash, version, isReleaseCandidate} = require('./gitRevision');

const getHash = () => (isReleaseCandidate() ? version() : commithash());
const getHtmlFilename = envName => `${envName}/index.${getHash()}.html`;
const getSWFilename = envName => `${envName}/sw.${getHash()}.js`;
const getManifestFilename = envName => `${envName}/manifest.${getHash()}.json`;

module.exports = {getHash, getHtmlFilename, getSWFilename, getManifestFilename};
