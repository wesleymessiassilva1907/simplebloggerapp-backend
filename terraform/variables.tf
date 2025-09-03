variable "project_name" {
  type        = string
  default     = "desafio-devops"
}

variable "aws_region" {
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
}

variable "cluster_version" {
  type        = string
  default     = "1.30"
}

variable "node_instance_types" {
  type        = list(string)
  default     = ["t3a.medium"]
}

variable "target_get_endpoint" {
  type        = string
  default = "google.com"
}

variable "tags" {
  type        = map(string)
  default     = {}
}
