## Global Serverless Image Gallery

A serverless image gallery application with images and its metadata being
replicated across two AWS regions. The application stores the images in Amazon Simple
Storage Service (S3) and image metadata in Amazon DynamoDB. Images stored in S3 are replicated to another AWS Region using S3’s Cross-Region Replication (CRR) and
image metadata in DynamoDB will be replicated using DynamoDB Global Tables.

![Global Serverless Image Gallery App](/img/global-serverless-image-gallery.png?raw=true)

## License Summary

This sample code is made available under a modified MIT license. See the LICENSE file.

## Tech Stack
### Required Tools
* [aws cli](http://docs.aws.amazon.com/cli/latest/userguide/installing.html)
* [npm](https://www.npmjs.com/)
* [angular-cli](https://github.com/angular/angular-cli)

### Frameworks
* [AWS JavaScript SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/browser-intro.html)
* [Angular 2](https://angular.io/docs/ts/latest/quickstart.html)
    * [TypeScript](https://www.typescriptlang.org/docs/tutorial.html)
* [Bootstrap](http://getbootstrap.com/)

## AWS Setup
##### Install the required tools (the installation script only runs on Linux and Mac)
* Create an AWS account
* [Install npm](https://www.npmjs.com/)
* [Install or update your aws cli](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) 
* [Install angular-cli](https://github.com/angular/angular-cli)


## Getting the code
_This uses the pre-configured AWS resources hosted by AWS_

```
# Clone it from github
git clone --depth 1 git@github.com:aws-samples/global-serverless-image-gallery.git
```

## Creating AWS Resources
This sample application uses Route 53 to route web traffic to primary and failover regions.

### Route-53 Public Hosted Zone
Create a Route-53 public hosted zone. This will be used to define domain names for endpoints. You can use a third-party domain name registrar and then [configure the DNS in Amazon Route 53](http://docs.aws.amazon.com/Route53/latest/DeveloperGuide/MigratingDNS.html), or you can purchase a domain directly from [Amazon Route 53.](http://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-register.html) 

### Facebook App ID
Cognito is used to provide user authentication for our serverless image gallery application. We will be using an External Identity Provider (Facebook) to provide authentication across AWS regions. Setup your [Facebook App](https://developers.facebook.com/docs/apps/register/) and get your Facebook App.

## Build the code, create required AWS resources and deploy the application   
```
# Create the AWS resources and deploy the application to S3
cd aws
./serverlessImageGalleryWithDNS.sh
```
Running the above command will create the necessary AWS resources, build and deploy application code to AWS. 
It will prompt you to choose AWS regions, your Facebook APP ID, application domain name and HostedZoneId. 

*Caution:* You might incur AWS charges after running the setup script

Once the above script is successfully executed, the application is accessible via your domain url.

