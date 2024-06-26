import * as cdk from "aws-cdk-lib";
import { HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
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

    const api = new HttpApi(this, "Api");
    api.addRoutes({
      path: "/hello",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration("ApiIntegration", apiFn),
    });

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url ?? "no URL set",
    });
  }
}
