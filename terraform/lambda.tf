data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/lambda"
  output_path = "${path.module}/lambda.zip"
}

resource "aws_lambda_function" "call_endpoint" {
  function_name = "${local.name}-call-endpoint"
  role          = aws_iam_role.lambda_role.arn
  runtime       = "python3.12"
  handler       = "call_endpoint.handler"

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = {
      TARGET_ENDPOINT = var.target_get_endpoint
    }
  }

  tags = local.tags
}
