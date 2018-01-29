const AWS = require('aws-sdk');

const codebuild = new AWS.CodeBuild();
const codepipeline = new AWS.CodePipeline();

/*
  TODO
  create iam encryption key (for S3 bucket)
  build S3 bucket (for storing codepipeline stuff)
  buidl S3 bucket (for storing output artifacts)
  create iam role for codebuild
  create cloudfront distribution
  create bucket policy for codebuild role->bucket[PutObject], cloudfront->bucket[GetObject]

  const iam = new AWS.IAM();
  const s3 = new AWS.S3();

  iam.createAccessKey(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response

    // data = {
    //   AccessKey: {
    //     AccessKeyId: "AKIAIOSFODNN7EXAMPLE", 
    //     CreateDate: <Date Representation>, 
    //     SecretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY", 
    //     Status: "Active", 
    //     UserName: "Bob"
    //   }
    // }
  });

  var params = {
    Bucket: "bucketname", // variable 
      CreateBucketConfiguration: {
      LocationConstraint: "us-west-2"
    }
  };
  s3.createBucket(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
    
    // data = {
    // Location: "http://examplebucket.s3.amazonaws.com/"
    // }
    
  });

*/



/*
  Maybe TODO
  mirror clone repo into codecommit at input location, 
  add buildspec.yml to that repo

  const codecommit = new AWS.CodeCommit();
  codecommit.createRepository(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
*/


const codeBuildParams = {
  artifacts: {
    type: 'NO_ARTIFACTS',
  },
  environment: { 
    computeType: 'BUILD_GENERAL1_MEDIUM', 
    image: 'aws/codebuild/nodejs:6.3.1-1.0.0', /* required */
    type: 'LINUX_CONTAINER',
    // environmentVariables: [
    //   {
    //     name: 'STRING_VALUE', /* required */
    //     value: 'STRING_VALUE' /* required */
    //   },
    //   /* more items */
    // ]
  },
  name: 'STRING_VALUE', /* project name? */
  source: {
    type: 'GITHUB',
    auth: {
      type: 'OAUTH',
      resource: 'STRING_VALUE' //??
    },
    location: 'STRING_VALUE' /* github location */
  },
  // tags: [
  //   {
  //     key: 'STRING_VALUE',
  //     value: 'STRING_VALUE'
  //   },
  //   /* more items */
  // ],
  timeoutInMinutes: 0
};
codebuild.createProject(codeBuildParams, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});


const codePipelineParams = {
  pipeline: {
    artifactStore: {
      location: 'STRING_VALUE', /* variable */
      type: S3,
      encryptionKey: {
        id: 'STRING_VALUE', /* variable */
        type: KMS
      }
    },
    name: 'STRING_VALUE', /* variable */
    stages: [
      {
        actions: [
          {
            actionTypeId: {
              category: 'Build',
              owner: 'AWS',
              provider: 'CodeBuild',
              version: 'STRING_VALUE' //???
            },
            name: 'Do Erething',
            runOrder: 0
          },
          /* more items */
        ],
        name: 'Pull, Build, Deploy'
      }
    ],
    version: 0
  }
};

codepipeline.createPipeline(codePipelineParams, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
