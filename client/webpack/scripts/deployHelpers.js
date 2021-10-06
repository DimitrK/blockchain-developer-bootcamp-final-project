const path = require('path');
const {execSync} = require('child_process');
const fs = require('fs');

const options = {stdio: 'inherit'};

const DEFAULT_S3_BUCKET_NAME = 'workablehr-ui';

const getFileFrom = (file, version) => {
  if (!version) {
    return file;
  }
  const [name, extension] = file.split(/\.([^.]+)$/);
  return `${name}.${version}.${extension}`;
};

const log = (...args) => console.error('DEPLOY FAILED -', ...args); // eslint-disable-line

const VERSION_REGEX = /^v\d+\.\d+\.\d+$/;

const isValidVersion = version => VERSION_REGEX.test(version);

/**
 * @description A helper for uploading files to s3
 * @example
 * makeUpload()
 *   .of('referrals')
 *   .from('releases')
 *   .to('production')
 *   .withVersion('v4.49.0')
 *   .doFile('index.html')
 *
 * will copy s3://workablehr-ui/referrals/releases/index.v4.49.0.html to s3://workablehr-ui/referrals/production/index.html
 *
 * makeUpload()
 *   .of('referrals')
 *   .to('production')
 *   .withVersion('v4.49.0')
 *   .doVersion()
 *
 * will create a VERSION file with the git version as its content, upload the file to s3://workablehr-ui/referrals/production/VERSION
 * and then rm the local VERSION file
 *
 * makeUpload()
 *  .of('referrals')
 *  .from('releases')
 *  .to('production')
 *  .doPattern('*.png');
 *
 * will copy s3://workablehr-ui/referrals/releases/*.png to s3://workablehr-ui/referrals/production/
 */

exports.makeUpload = () => {
  const params = {};

  const parameterize = {
    of: appName => {
      if (!appName) {
        log('of: appName param cannot be empty');
        process.exit(1);
      }
      params.appName = appName;
      return parameterize;
    },
    from: folderFrom => {
      if (!folderFrom) {
        log('from: folderFrom param cannot be empty');
        process.exit(1);
      }
      params.folderFrom = folderFrom;
      return parameterize;
    },
    to: folderTo => {
      if (!folderTo) {
        log('to: folderTo param cannot be empty');
        process.exit(1);
      }
      params.folderTo = folderTo;
      return parameterize;
    },
    withTransformer: transformer => {
      if (typeof transformer !== 'function') {
        log('transformer should be a function.');
        process.exit(1);
      }
      params.transformer = transformer;
      return parameterize;
    },
    withVersion: version => {
      let processedVersion = version;
      if (!isValidVersion(processedVersion)) {
        processedVersion = `v${version}`;
        if (!isValidVersion(processedVersion)) {
          log('The provided version is not valid.');
          process.exit(1);
        }
      }
      params.version = processedVersion;
      return parameterize;
    },
    doFile: file => {
      if (!file || !params.appName || !params.folderFrom || !params.folderTo) {
        log('The params file, appName, folderFrom and folderTo are required.');
        process.exit(1);
      }
      const s3basePath = path.join(process.env.S3_BUCKET_NAME || DEFAULT_S3_BUCKET_NAME, params.appName);
      const base = `s3://${s3basePath}`;

      let fileFrom;
      if (params.folderFrom.startsWith('./dist')) {
        fileFrom = `${params.folderFrom}/${getFileFrom(file, params.version)}`;
      } else {
        fileFrom = `${base}/${params.folderFrom}/${getFileFrom(file, params.version)}`;
      }
      const fileTo = `${base}/${params.folderTo}/${file}`;

      try {
        if (params.transformer) {
          const localFile = `./dist/tmp-${file}`;

          execSync(`aws s3 cp ${fileFrom} ${localFile}`, options);

          const fileContents = fs.readFileSync(localFile).toString();
          const updatedFileContents = params.transformer(fileContents);
          fs.writeFileSync(localFile, updatedFileContents);

          execSync(
            `aws s3 cp ${localFile} ${fileTo} --metadata-directive REPLACE --acl public-read --cache-control no-cache,max-age=0,s-maxage=0 --expires 0`,
            options
          );

          fs.unlinkSync(localFile);
        } else {
          execSync(
            `aws s3 cp ${fileFrom} ${fileTo} --metadata-directive REPLACE --acl public-read --cache-control no-cache,max-age=0,s-maxage=0 --expires 0`,
            options
          );
        }
      } catch (error) {
        log('error', error);
        process.exit(error.status);
      }
    },
    doPattern: pattern => {
      if (!pattern || !params.appName || !params.folderFrom || !params.folderTo) {
        log('The params pattern, appName, folderFrom and folderTo are required.');
        process.exit(1);
      }
      const s3basePath = path.join(process.env.S3_BUCKET_NAME || DEFAULT_S3_BUCKET_NAME, params.appName);
      const base = `s3://${s3basePath}`;

      const fileFrom = `${base}/${params.folderFrom}`;
      const fileTo = `${base}/${params.folderTo}`;

      try {
        execSync(
          `aws s3 cp ${fileFrom} ${fileTo} --recursive --exclude "*" --include "${pattern}" --metadata-directive REPLACE --acl public-read --cache-control no-cache,max-age=0,s-maxage=0 --expires 0`,
          options
        );
      } catch (error) {
        log('error', error);
        process.exit(error.status);
      }
    },
    doVersion: () => {
      if (!params.appName || !params.folderTo || !params.version) {
        log('uploadVersionFile: The params appName, folderTo and version are required.');
        process.exit(1);
      }

      const s3basePath = path.join(process.env.S3_BUCKET_NAME || DEFAULT_S3_BUCKET_NAME, params.appName);
      const base = `s3://${s3basePath}`;
      const fileTo = `${base}/${params.folderTo}/VERSION`;

      try {
        execSync(`echo ${params.version} >> VERSION`, options);
        execSync(
          `aws s3 cp ./VERSION ${fileTo} --metadata-directive REPLACE --acl public-read --cache-control no-cache,max-age=0,s-maxage=0 --expires 0`,
          options
        );
        execSync('rm ./VERSION', options);
      } catch (error) {
        log('uploadVersionFile error', error);
        process.exit(error.status);
      }
    }
  };

  return parameterize;
};
