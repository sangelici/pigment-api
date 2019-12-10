require('dotenv').config()
// Require mime-types package
require('mime-types')
// Require AWS SDK
const AWS = require('aws-sdk')
// Set AWS region
AWS.config.update({
  region: 'us-east-1'
})
// Create S3 Object instance
const s3 = new AWS.S3()
// Define bucket based on environment variable
const bucketName = process.env.BUCKET_NAME

module.exports = function (file) {
  // console.log('the file is; ', file)
  return new Promise((resolve, reject) => {
    // Create params object for s3 image
    const params = {
      Bucket: bucketName,
      Key: `${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: file.mimetype
    }
    // console.log(params)

    // Image to s3
    s3.upload(params, (err, s3Data) => {
      if (err) throw err
      resolve(s3Data)
    })
  })
}
