# Redis Module Outputs

output "endpoint" {
  description = "Redis cluster endpoint"
  value       = aws_elasticache_replication_group.main.configuration_endpoint_address
  sensitive   = true
}

output "port" {
  description = "Redis cluster port"
  value       = aws_elasticache_replication_group.main.port
}

output "id" {
  description = "Redis replication group ID"
  value       = aws_elasticache_replication_group.main.id
}

output "arn" {
  description = "Redis replication group ARN"
  value       = aws_elasticache_replication_group.main.arn
}

output "primary_endpoint" {
  description = "Redis primary endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}

output "reader_endpoint" {
  description = "Redis reader endpoint"
  value       = aws_elasticache_replication_group.main.reader_endpoint_address
  sensitive   = true
}

output "subnet_group_name" {
  description = "Redis subnet group name"
  value       = aws_elasticache_subnet_group.main.name
}

output "parameter_group_name" {
  description = "Redis parameter group name"
  value       = aws_elasticache_parameter_group.main.name
}

output "log_group_name" {
  description = "Redis CloudWatch log group name"
  value       = aws_cloudwatch_log_group.redis.name
}

output "alerts_topic_arn" {
  description = "ARN of the Redis alerts SNS topic"
  value       = aws_sns_topic.redis_alerts.arn
}