const AWS = require('aws-sdk');

const iam = new AWS.IAM();
const s3 = new AWS.S3();
const codebuild = new AWS.CodeBuild();

const testRoleName = 'Test-Role-CodeBuild';
const testBucketName = 'test-bucket123123';
const testRegion = 'us-west-2';
const testCodeBuildName = 'TestProject';
/* 
  Create IAM Role with CodeBuildBasePolicy-test-us-west-2, 
  CodeBuildTrustPolicy-test2-1517206382734, and 
  CodeBuildVPCTrustPolicy-test21517206383536 policies
*/
const createRole(roleName) => {

  const createRoleParams = {
    AssumeRolePolicyDocument: '%7B%22Version%22:%222012-10-17%22%7D',
    RoleName: roleName
  };
  const basePolicyParams = {
    PolicyArn: 'arn:aws:iam::141819503534:policy/service-role/CodeBuildBasePolicy-test-us-west-2',
    RoleName: roleName
  };
  const trustPolicyParams = {
    PolicyArn: 'arn:aws:iam::141819503534:policy/service-role/CodeBuildTrustPolicy-test2-1517206382734',
    RoleName: roleName
  };
  const vpcPolicyParams = {
    PolicyArn: 'arn:aws:iam::141819503534:policy/service-role/CodeBuildVPCTrustPolicy-test21517206383536',
    RoleName: roleName
  };
  return new Promise((resolve, reject) => {
    iam.createRole(createRoleParams, (createRoleErr, createRoleData) => {
      if (createRoleErr) {
        console.log(createRoleErr, createRoleErr.stack);
        reject(createRoleErr);
      } else {
        iam.attachRolePolicy(basePolicyParams, (basePolicyErr) => {
          if (basePolicyErr) {
            console.log(basePolicyErr, basePolicyErr.stack);
            reject(basePolicyErr);
          } else {
            iam.attachRolePolicy(trustPolicyParams, (trustPolicyErr) => {
              if (trustPolicyErr) {
                console.log(trustPolicyErr, trustPolicyErr.stack);
                reject(trustPolicyErr);
              } else {
                iam.attachRolePolicy(vpcPolicyParams, (vpcPolicyErr) => {
                  if (vpcPolicyErr) {
                    console.log(vpcPolicyErr, vpcPolicyErr.stack);
                    reject(vpcPolicyErr);
                  } else {
                    resolve(createRoleData.Role.Arn);
                  }
                });
              }
            });
          }
        });
      }
    });
  });
}

/*
  Create S3 bucket, with web distribution set
  Create bucket policy to open getObject for all objects
  to public, and putObject for all objects to the IAM Role above
*/
const createS3Website(bucketName, region, codeBuildRoleARN) => {

  const createS3BucketParams = {
    Bucket: bucketName,
    ACL: 'private',
    CreateBucketConfiguration: {
      LocationConstraint: region
    }
  };
  const bucketPolicyParams = {
    Bucket: bucketName,
    Policy: '{"Version": "2012-10-17","Statement": [{"Effect": "Allow","Principal": {"AWS": "' + codeBuildRoleARN + '"},"Action": "s3:PutObject","Resource": "arn:aws:s3:::' + bucketName + '/*"},{"Effect": "Allow","Principal": "*","Action": "s3:GetObject","Resource": "arn:aws:s3:::' + bucketName + '/*"}]}'
  };
  const bucketWebsiteParams = {
    Bucket: bucketName,
    WebsiteConfiguration: {
      ErrorDocument: {
        Key: 'error.html'
      },
      IndexDocument: {
        Suffix: 'index.html'
      }
    }
  };
  return new Promise((resolve, reject) => {
    s3.createBucket(createS3BucketParams, (s3BucketErr) => {
      if (s3BucketErr) {
        console.log(s3BucketErr, s3BucketErr.stack);
        reject(s3BucketErr);
      } else {
        s3.putBucketPolicy(bucketPolicyParams, (bucketPolicyErr) => {
          if (bucketPolicyErr) {
            console.log(bucketPolicyErr, bucketPolicyErr.stack);
            reject(bucketPolicyErr);
          } else {
            s3.putBucketWebsite(bucketWebsiteParams, (bucketWebsiteErr) => {
              if (bucketWebsiteErr) {
                console.log(bucketWebsiteErr, bucketWebsiteErr.stack);
                reject(bucketWebsiteErr);
              } else {
                resolve();
              }
            });
          }
        });
      }
    });
  });
}

/*
  create code build
*/
createRole(testRoleName).then((roleARN) => {
  createS3Website(testBucketName, testRegion, roleARN).then(() => {

    const codeBuildParams = {
      artifacts: {
        type: 'NO_ARTIFACTS',
      },
      environment: { 
        computeType: 'BUILD_GENERAL1_MEDIUM', 
        image: 'aws/codebuild/nodejs:6.3.1-1.0.0',
        type: 'LINUX_CONTAINER'
      },
      name: testCodeBuildName,
      source: {
        type: 'GITHUB',
        location: 'https://github.com/robertglenn/angular5-example-app.git'
      },
      timeoutInMinutes: 0
    };
    codebuild.createProject(codeBuildParams, function(codeBuildErr, codeBuildData) {
      if (codeBuildErr) console.log(codeBuildErr, codeBuildErr.stack); // an error occurred
      else     console.log(codeBuildData);           // successful response
    });
  });
});
