import type {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyHandlerV2,
): Promise<APIGatewayProxyResultV2> => {
  console.log(event);

  if (Math.random() < 0.8) {
    throw new Error("error");
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello winter!" }),
  };
};
