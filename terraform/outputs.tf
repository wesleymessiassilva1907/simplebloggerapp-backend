output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnets" {
  value = module.vpc.public_subnets
}

output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "dockerhub_webhook_url" {
  value       = "${aws_apigatewayv2_api.webhook_api.api_endpoint}/webhook"
}

output "lambda_name" {
  value = aws_lambda_function.call_endpoint.function_name
}
