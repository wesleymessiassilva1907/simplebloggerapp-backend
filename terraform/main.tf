provider "aws" {
  region = var.aws_region
}

data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  name = var.project_name

  azs = slice(data.aws_availability_zones.available.names, 0, 2)

  public_subnets = [
    cidrsubnet(var.vpc_cidr, 8, 0),
    cidrsubnet(var.vpc_cidr, 8, 1),
  ]

  tags = merge(
    {
      Project   = local.name
      ManagedBy = "terraform"
    },
    var.tags
  )
}
