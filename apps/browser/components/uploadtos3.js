// Import AWS SDK
const AWS = require('aws-sdk');

// Configure the SDK with your credentials
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});
console.log('hi')
// Create an S3 instance
const s3 = new AWS.S3();

// Function to upload a file to S3
const uploadFileToS3 = async (bucketName, fileName, fileContent) => {
  const params = {
    Bucket: bucketName,
    Key: "middleware.ts", // File name you want to save as
    Body: fileContent
  };

  try {
    const data = await s3.upload(params).promise();
    console.log(`File uploaded successfully at ${data.Location}`);
  } catch (err) {
    console.log("Error", err);
  }
};

// Example usage
const bucketName = 'biosurveillanceprompts';
const fileName = 'prompts.json';
const fileContent = JSON.stringify({
  prompts: ["Example Prompt 1", "Example Prompt 2"],
  specificDiseases: ["Disease 1", "Disease 2"],
  specificRegionsCountries: ["Country 1", "Country 2"]
}, null, 2); // Formatting for readability

uploadFileToS3(bucketName, fileName, fileContent);
