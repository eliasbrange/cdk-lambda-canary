#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkLambdaCanaryStack } from "../lib/cdk-lambda-canary-stack";

const app = new cdk.App();
new CdkLambdaCanaryStack(app, "CdkLambdaCanaryStack", {});
