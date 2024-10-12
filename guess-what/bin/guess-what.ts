#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GuessWhatStack } from '../lib/guess-what-stack';

const app = new cdk.App();
new GuessWhatStack(app, 'GuessWhatStack', {
  env: { account: "128007096314", region: "ap-southeast-1" },
});