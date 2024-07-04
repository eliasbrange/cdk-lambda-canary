import * as cdk from "aws-cdk-lib";
import { HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Alarm } from "aws-cdk-lib/aws-cloudwatch";
import {
  LambdaApplication,
  LambdaDeploymentConfig,
  LambdaDeploymentGroup,
} from "aws-cdk-lib/aws-codedeploy";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import type { Construct } from "constructs";

export class CdkLambdaCanaryStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const apiFn = new NodejsFunction(this, "ApiFunction", {
      entry: "src/api.ts",
      timeout: cdk.Duration.seconds(10),
      runtime: Runtime.NODEJS_20_X,
    });

    const alias = apiFn.addAlias("live");

    const alarm = new Alarm(this, "MyAlarm", {
      alarmName: `${apiFn.functionName}-${apiFn.currentVersion.version}-errors`,
      metric: apiFn.metricErrors({
        period: cdk.Duration.minutes(1),
        dimensionsMap: {
          FunctionName: apiFn.functionName,
          Resource: `${apiFn.functionName}:${alias.aliasName}`,
          ExecutedVersion: apiFn.currentVersion.version,
        },
      }),
      threshold: 1,
      evaluationPeriods: 1,
    });

    const application = new LambdaApplication(this, "application");
    const deploymentGroup = new LambdaDeploymentGroup(this, "deploymentGroup", {
      application,
      alias,
      deploymentConfig: LambdaDeploymentConfig.CANARY_10PERCENT_5MINUTES,
      alarms: [alarm],
    });

    const api = new HttpApi(this, "Api");
    api.addRoutes({
      path: "/hello",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration("ApiIntegration", alias),
    });

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url ?? "no URL set",
    });
  }
}
