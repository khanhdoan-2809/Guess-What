#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GuessWhatStack, RepositoryStack, PREFIX } from '../lib/guess-what-stack';

const app = new cdk.App();
const repoStackName = `${PREFIX}-repo`;
const ecsStackName = `${PREFIX}-stack`;
const account = "128007096314";
const region = "ap-southeast-1";

const repoStack = new RepositoryStack(app, repoStackName, {
  env: { account, region },
})

new GuessWhatStack(app, 'GuessWhatStack', repoStack.repository, {
  env: { account, region },
});