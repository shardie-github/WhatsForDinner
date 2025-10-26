# Cost Management Module Outputs

output "budget_arn" {
  description = "ARN of the budget"
  value       = aws_budgets_budget.main.arn
}

output "budget_name" {
  description = "Name of the budget"
  value       = aws_budgets_budget.main.name
}

output "cur_bucket_name" {
  description = "Name of the Cost and Usage Report S3 bucket"
  value       = var.enable_cur ? aws_s3_bucket.cur[0].bucket : null
}

output "cur_bucket_arn" {
  description = "ARN of the Cost and Usage Report S3 bucket"
  value       = var.enable_cur ? aws_s3_bucket.cur[0].arn : null
}

output "anomaly_detector_arn" {
  description = "ARN of the cost anomaly detector"
  value       = var.enable_anomaly_detection ? aws_ce_anomaly_detector.main[0].arn : null
}

output "cost_alerts_topic_arn" {
  description = "ARN of the cost alerts SNS topic"
  value       = var.enable_daily_cost_alarm ? aws_sns_topic.cost_alerts[0].arn : null
}

output "cost_category_arn" {
  description = "ARN of the cost category"
  value       = aws_ce_cost_category.main.arn
}

output "daily_cost_alarm_name" {
  description = "Name of the daily cost alarm"
  value       = var.enable_daily_cost_alarm ? aws_cloudwatch_metric_alarm.daily_cost[0].alarm_name : null
}

output "cost_allocation_tags" {
  description = "List of cost allocation tags"
  value = [
    aws_ce_cost_allocation_tag.environment.tag_key,
    aws_ce_cost_allocation_tag.project.tag_key,
    aws_ce_cost_allocation_tag.managed_by.tag_key
  ]
}