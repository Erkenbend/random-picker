import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';
import {BlockPublicAccess} from "aws-cdk-lib/aws-s3";

// Lookup in route53, automatically created when buying domain from AWS
const ROOT_DOMAIN_NAME = 'ninasworkshop.de';
const ROOT_HOSTED_ZONE_ID = 'Z0671734S59DXF13NRZI';

// Project-specific constants
const SUBDOMAIN = 'randompicker';
const BUILD_DIR = '../dist';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DOMAIN SPECIFIC

    // Import the hosted zone that was created when buying the domain name
    const hostedZone = route53.PublicHostedZone.fromHostedZoneAttributes(this, 'RootHostedZone', {
      hostedZoneId: ROOT_HOSTED_ZONE_ID,
      zoneName: ROOT_DOMAIN_NAME
    })

    // Create root certificate
    const certificate = new acm.Certificate(this, 'RandomPickerRootCert', {
      domainName: ROOT_DOMAIN_NAME,
      subjectAlternativeNames: ['*.' + ROOT_DOMAIN_NAME],
      validation: acm.CertificateValidation.fromDns(hostedZone)
    });

    // FOR THIS APPLICATION

    // This will store a copy of the build directory
    const bucket = new s3.Bucket(this, 'RandomPickerBucket', {
      bucketName: 'random-picker-bucket-919713414705-us-east-1',  // Should be unique across all zones and accounts
      versioned: true,
      publicReadAccess: true,
      blockPublicAccess: new BlockPublicAccess({ignorePublicAcls: true})
    });

    // Sync the build directory contents with the S3 bucket
    const deployment = new s3deploy.BucketDeployment(this, 'DeployRandomPickerApplication', {
      sources: [s3deploy.Source.asset(BUILD_DIR)],
      destinationBucket: bucket,
      cacheControl: [s3deploy.CacheControl.fromString('max-age=0,no-cache,no-store,must-revalidate')]
    });

    // Create Cloudfront distribution with custom domain and redirects
    const distribution =  new cloudfront.Distribution(this, 'RandomPickerDistribution', {
      defaultBehavior: { origin: origins.S3BucketOrigin.withBucketDefaults(bucket) },
      domainNames: [SUBDOMAIN + '.' + ROOT_DOMAIN_NAME],
      certificate: certificate,
      errorResponses: [
        {
          httpStatus: 403,
          responsePagePath: '/index.html',
          responseHttpStatus: 200,
          ttl: cdk.Duration.minutes(0),
        },
        {
          httpStatus: 404,
          responsePagePath: '/index.html',
          responseHttpStatus: 200,
          ttl: cdk.Duration.minutes(0),
        },
      ],
    });

    // This A-record allows the Cloudfront distribution to be found under its custom domain
    const aRecord = new route53.ARecord(this, 'RandomPickerRecord', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      recordName: SUBDOMAIN + '.' + ROOT_DOMAIN_NAME
    });
  }
}
