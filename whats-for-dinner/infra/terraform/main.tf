# Terraform configuration for What's for Dinner infrastructure
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
}

# Configure providers
provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "whats-for-dinner"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
}

provider "supabase" {
  access_token = var.supabase_access_token
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Local values
locals {
  common_tags = {
    Project     = "whats-for-dinner"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
  
  # Naming convention
  name_prefix = "${var.project_name}-${var.environment}"
  
  # Availability zones
  azs = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"
  
  name_prefix = local.name_prefix
  cidr        = var.vpc_cidr
  azs         = local.azs
  
  public_subnets  = var.public_subnets
  private_subnets = var.private_subnets
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
  
  tags = local.common_tags
}

# Security Groups
module "security_groups" {
  source = "./modules/security-groups"
  
  name_prefix = local.name_prefix
  vpc_id      = module.vpc.vpc_id
  
  tags = local.common_tags
}

# RDS Database
module "database" {
  source = "./modules/database"
  
  name_prefix = local.name_prefix
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnets
  
  db_instance_class = var.db_instance_class
  db_allocated_storage = var.db_allocated_storage
  db_engine_version = var.db_engine_version
  
  security_group_ids = [module.security_groups.database_sg_id]
  
  tags = local.common_tags
}

# Redis Cache
module "redis" {
  source = "./modules/redis"
  
  name_prefix = local.name_prefix
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnets
  
  node_type = var.redis_node_type
  num_cache_clusters = var.redis_num_cache_clusters
  
  security_group_ids = [module.security_groups.redis_sg_id]
  
  tags = local.common_tags
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"
  
  name_prefix = local.name_prefix
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.public_subnets
  
  security_group_ids = [module.security_groups.alb_sg_id]
  
  tags = local.common_tags
}

# ECS Cluster
module "ecs" {
  source = "./modules/ecs"
  
  name_prefix = local.name_prefix
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnets
  
  security_group_ids = [module.security_groups.ecs_sg_id]
  
  tags = local.common_tags
}

# S3 Buckets
module "storage" {
  source = "./modules/storage"
  
  name_prefix = local.name_prefix
  
  tags = local.common_tags
}

# CloudWatch Logs
module "logging" {
  source = "./modules/logging"
  
  name_prefix = local.name_prefix
  
  tags = local.common_tags
}

# Monitoring and Alerting
module "monitoring" {
  source = "./modules/monitoring"
  
  name_prefix = local.name_prefix
  
  tags = local.common_tags
}

# Cost Management
module "cost_management" {
  source = "./modules/cost-management"
  
  name_prefix = local.name_prefix
  
  tags = local.common_tags
}

# Security and Compliance
module "security" {
  source = "./modules/security"
  
  name_prefix = local.name_prefix
  
  tags = local.common_tags
}