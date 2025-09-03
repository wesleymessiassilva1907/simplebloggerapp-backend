module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${local.name}-vpc"
  cidr = var.vpc_cidr

  azs             = local.azs
  public_subnets  = local.public_subnets

  enable_nat_gateway = false
  create_igw         = true

  manage_default_security_group = true
  default_security_group_ingress = [
    {
      description = "allow all within SG"
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      self        = true
    }
  ]
  default_security_group_egress = [
    {
      description = "allow all egress"
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]

  tags = local.tags
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.24"

  cluster_name                    = "${local.name}-eks"
  cluster_version                 = var.cluster_version
  cluster_endpoint_public_access  = true

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.public_subnets

  enable_cluster_creator_admin_permissions = true

  eks_managed_node_groups = {
    default = {
      name           = "ng-public"
      instance_types = var.node_instance_types

      desired_size = 1
      min_size     = 1
      max_size     = 3

      subnet_ids = module.vpc.public_subnets
    }
  }

  tags = local.tags
}
