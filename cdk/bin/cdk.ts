#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/amplify-hosting-stack';

const app = new cdk.App();

// .envファイルから、CDK_STACK_NAMEを読み込む
const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
    console.log('.envファイルの読み込みに失敗しました。', result.error);
    process.exit(1);
}
// .envファイルから、CDK_STACK_NAMEを取得する
const cdkStackName = process.env.CDK_STACK_NAME;
if (!cdkStackName) {
    console.log('.envファイルにCDK_STACK_NAMEを設定してください。');
    process.exit(1);
}


new CdkStack(app, cdkStackName, {
    /* If you don't specify 'env', this stack will be environment-agnostic.
     * Account/Region-dependent features and context lookups will not work,
     * but a single synthesized template can be deployed anywhere. */

    /* Uncomment the next line to specialize this stack for the AWS Account
     * and Region that are implied by the current CLI configuration. */
    // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

    /* Uncomment the next line if you know exactly what Account and Region you
     * want to deploy the stack to. */
    // env: { account: '123456789012', region: 'us-east-1' },

    /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});