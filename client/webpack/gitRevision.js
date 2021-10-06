const {GitRevisionPlugin} = require('git-revision-webpack-plugin');

const gitRevisionPlugin = new GitRevisionPlugin({
  branch: true,
  versionCommand: 'describe --abbrev=0 --tags'
});

const RELEASE_BRANCH = 'releases';

const jenkinsBranchNameFromPR = process.env.CHANGE_BRANCH;
const jenkinsBranchNameFromPush = process.env.BRANCH_NAME || process.env.GIT_BRANCH;
const jenkinsCommitHash = process.env.GIT_COMMIT;
const jenkinsTag = process.env.TAG_NAME;

const isReleaseCandidate = () => !!jenkinsTag;
const commithash = () => jenkinsCommitHash || gitRevisionPlugin.commithash();
const branch = () =>
  isReleaseCandidate()
    ? RELEASE_BRANCH
    : jenkinsBranchNameFromPR || jenkinsBranchNameFromPush || gitRevisionPlugin.branch();
const version = () => jenkinsTag || gitRevisionPlugin.version();

module.exports = {commithash, branch, version, gitRevisionPlugin, isReleaseCandidate};
