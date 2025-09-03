resource "aws_apigatewayv2_api" "webhook_api" {
  name          = "${local.name}-dockerhub-webhook"
  protocol_type = "HTTP"
  tags          = local.tags
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id                 = aws_apigatewayv2_api.webhook_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.call_endpoint.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "webhook_route" {
  api_id    = aws_apigatewayv2_api.webhook_api.id
  route_key = "ANY /webhook"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.webhook_api.id
  name        = "$default"
  auto_deploy = true
  tags        = local.tags
}

resource "aws_lambda_permission" "allow_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.call_endpoint.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.webhook_api.execution_arn}/*/*"
}
