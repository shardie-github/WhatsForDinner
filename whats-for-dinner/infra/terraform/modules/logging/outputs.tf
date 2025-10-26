# Logging Module Outputs

output "log_group_name" {
  description = "Name of the application log group"
  value       = aws_cloudwatch_log_group.application.name
}

output "log_group_arn" {
  description = "ARN of the application log group"
  value       = aws_cloudwatch_log_group.application.arn
}

output "nginx_log_group_name" {
  description = "Name of the nginx log group"
  value       = aws_cloudwatch_log_group.nginx.name
}

output "nginx_log_group_arn" {
  description = "ARN of the nginx log group"
  value       = aws_cloudwatch_log_group.nginx.arn
}

output "database_log_group_name" {
  description = "Name of the database log group"
  value       = aws_cloudwatch_log_group.database.name
}

output "database_log_group_arn" {
  description = "ARN of the database log group"
  value       = aws_cloudwatch_log_group.database.arn
}

output "redis_log_group_name" {
  description = "Name of the redis log group"
  value       = aws_cloudwatch_log_group.redis.name
}

output "redis_log_group_arn" {
  description = "ARN of the redis log group"
  value       = aws_cloudwatch_log_group.redis.arn
}

output "lambda_log_group_name" {
  description = "Name of the lambda log group"
  value       = aws_cloudwatch_log_group.lambda.name
}

output "lambda_log_group_arn" {
  description = "ARN of the lambda log group"
  value       = aws_cloudwatch_log_group.lambda.arn
}

output "api_gateway_log_group_name" {
  description = "Name of the api gateway log group"
  value       = aws_cloudwatch_log_group.api_gateway.name
}

output "api_gateway_log_group_arn" {
  description = "ARN of the api gateway log group"
  value       = aws_cloudwatch_log_group.api_gateway.arn
}

output "alb_log_group_name" {
  description = "Name of the alb log group"
  value       = aws_cloudwatch_log_group.alb.name
}

output "alb_log_group_arn" {
  description = "ARN of the alb log group"
  value       = aws_cloudwatch_log_group.alb.arn
}

output "log_alerts_topic_arn" {
  description = "ARN of the log alerts SNS topic"
  value       = aws_sns_topic.log_alerts.arn
}

output "log_alerts_topic_name" {
  description = "Name of the log alerts SNS topic"
  value       = aws_sns_topic.log_alerts.name
}

output "error_rate_alarm_name" {
  description = "Name of the error rate alarm"
  value       = aws_cloudwatch_metric_alarm.error_rate.alarm_name
}

output "warning_rate_alarm_name" {
  description = "Name of the warning rate alarm"
  value       = aws_cloudwatch_metric_alarm.warning_rate.alarm_name
}

output "slow_requests_alarm_name" {
  description = "Name of the slow requests alarm"
  value       = aws_cloudwatch_metric_alarm.slow_requests.alarm_name
}