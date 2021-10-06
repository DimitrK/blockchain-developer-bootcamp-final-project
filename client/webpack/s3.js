const S3Plugin = require('webpack-s3-plugin');
const NON_CACHEABLE_FILES = [/remoteEntry\.js$/, /index\.html$/];
const shouldCacheFile = file => {
  return /\.(js|css|html|png|jpeg|svg)$/.test(file) && NON_CACHEABLE_FILES.every(regExp => !regExp.test(file));
};

/**
 * @param {string} bucket - The name of the s3 bucket.
 * @param {string} basePath - The specific folder path under the bucket.
 * @param {string} directory - Which folder to upload, if any, otherwise uploads compilation output.
 * @param {string} cloudfrontDistributionId - Optional, if provided the cloudfront cache will be invalidated.
 */

const s3 = (bucket, basePath, directory, cloudfrontDistributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID) => ({
  onlySourceMaps = false
} = {}) => {
  const upload = ({s3Options = {}, s3UploadOptions = {}, cloudfrontInvalidateOptions = {}, ...options} = {}) =>
    new S3Plugin({
      exclude: /\.map$/,
      directory,
      s3Options: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: 'us-east-1',
        ...s3Options
      },
      basePath,
      s3UploadOptions: {
        Bucket: bucket,
        CacheControl(file) {
          if (shouldCacheFile(file)) {
            return 'public, max-age=31557600';
          }
          /**
          * Temporary hack because when no caching headers are present, Cloudfront caches the files indefinitely.
          */
          return 'public, max-age=60';
        },
        Expires(file) {
          if (shouldCacheFile(file)) {
            return new Date(new Date().setFullYear(new Date().getFullYear() + 1));
          }
        },
        ...s3UploadOptions
      },
      cloudfrontInvalidateOptions: {
        DistributionId: cloudfrontDistributionId,
        Items: ['/*'],
        ...cloudfrontInvalidateOptions
      },
      ...options
    });

  if (onlySourceMaps) {
    return upload({
      include: /\.map$/,
      s3UploadOptions: {
        ACL: 'private'
      }
    });
  }

  return upload({
    exclude: /\.map$/,
    s3UploadOptions: {
      ACL: 'public-read',
      CacheControl: 'public, max-age=31557600',
      Expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    }
  });
};

module.exports = s3;
