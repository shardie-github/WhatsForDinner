# Security Groups Module Outputs

output "alb_sg_id" {
  description = "ID of the ALB security group"
  value       = aws_security_group.alb.id
}

output "ecs_sg_id" {
  description = "ID of the ECS security group"
  value       = aws_security_group.ecs.id
}

output "database_sg_id" {
  description = "ID of the database security group"
  value       = aws_security_group.database.id
}

output "redis_sg_id" {
  description = "ID of the Redis security group"
  value       = aws_security_group.redis.id
}

output "lambda_sg_id" {
  description = "ID of the Lambda security group"
  value       = aws_security_group.lambda.id
}

output "bastion_sg_id" {
  description = "ID of the bastion host security group"
  value       = aws_security_group.bastion.id
}

output "security_group_ids" {
  description = "Map of all security group IDs"
  value = {
    alb      = aws_security_group.alb.id
    ecs      = aws_security_group.ecs.id
    database = aws_security_group.database.id
    redis    = aws_security_group.redis.id
    lambda   = aws_security_group.lambda.id
    bastion  = aws_security_group.bastion.id
  }
}