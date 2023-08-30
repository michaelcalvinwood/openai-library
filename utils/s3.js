require('dotenv').config();
const { S3, ListObjectsV2Command , PutObjectCommand, DeleteObjectsCommand } = require("@aws-sdk/client-s3");
const {S3_ENDPOINT, S3_ENDPOINT_DOMAIN, S3_REGION, S3_KEY, S3_SECRET, S3_BUCKET} = process.env;

const options = {
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    credentials: {
        accessKeyId: S3_KEY,
        secretAccessKey: S3_SECRET
    }
}

console.log(options);

const s3Client = new S3(options);

exports.uploadHTML = async (data, bucketFolder, bucketFileName) => {
    const bucketParams = {
        Bucket: process.env.S3_BUCKET,
        Key: `${bucketFolder}/${bucketFileName}`,
        Body: data,
        ACL: 'public-read',
        'ContentType': 'text/html'
      };
    
      try {
        const data = await s3Client.send(new PutObjectCommand(bucketParams));
        const link = `https://${process.env.S3_BUCKET}.${process.env.S3_ENDPOINT_DOMAIN}/${bucketParams.Key}`;
        return link;
      } catch (err) {
        console.log("Error", err);
        return '';
      }      
};

const upload = async (localFolder, localFileName, bucketFolder, bucketFileName) => {
    const data = await fsp.readFile(localFolder+localFileName);
    let contentType = '';

    contentType = mime.lookup(localFileName);

    if (!contentType) contentType = 'application/octet-stream';

    const bucketParams = {
        Bucket: process.env.S3_BUCKET,
        Key: `${bucketFolder}/${bucketFileName}`,
        Body: data,
        ACL: 'public-read',
        'Content-Type': contentType
      };
    
      try {
        const data = await s3Client.send(new PutObjectCommand(bucketParams));
        const link = `https://${process.env.S3_BUCKET}.${process.env.S3_ENDPOINT_DOMAIN}/${bucketParams.Key}`;
        return link;
      } catch (err) {
        console.log("Error", err);
        return '';
      }      
};
