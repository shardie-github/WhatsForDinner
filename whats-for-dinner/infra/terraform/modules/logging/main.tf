# Logging Module

# CloudWatch Log Group for Application
resource "aws_cloudwatch_log_group" "application" {
  name              = "/aws/ecs/${var.name_prefix}"
  retention_in_days = 30

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-application-logs"
  })
}

# CloudWatch Log Group for Nginx
resource "aws_cloudwatch_log_group" "nginx" {
  name              = "/aws/ecs/${var.name_prefix}/nginx"
  retention_in_days = 30

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-nginx-logs"
  })
}

# CloudWatch Log Group for Database
resource "aws_cloudwatch_log_group" "database" {
  name              = "/aws/rds/instance/${var.name_prefix}-db/postgresql"
  retention_in_days = 30

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-database-logs"
  })
}

# CloudWatch Log Group for Redis
resource "aws_cloudwatch_log_group" "redis" {
  name              = "/aws/elasticache/redis/${var.name_prefix}"
  retention_in_days = 7

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-redis-logs"
  })
}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.name_prefix}"
  retention_in_days = 14

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-lambda-logs"
  })
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.name_prefix}"
  retention_in_days = 30

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-api-gateway-logs"
  })
}

# CloudWatch Log Group for Load Balancer
resource "aws_cloudwatch_log_group" "alb" {
  name              = "/aws/applicationloadbalancer/${var.name_prefix}"
  retention_in_days = 30

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-alb-logs"
  })
}

# CloudWatch Log Stream for Application
resource "aws_cloudwatch_log_stream" "application" {
  name           = "application"
  log_group_name = aws_cloudwatch_log_group.application.name
}

# CloudWatch Log Stream for Nginx
resource "aws_cloudwatch_log_stream" "nginx" {
  name           = "nginx"
  log_group_name = aws_cloudwatch_log_group.nginx.name
}

# CloudWatch Log Stream for Database
resource "aws_cloudwatch_log_stream" "database" {
  name           = "postgresql"
  log_group_name = aws_cloudwatch_log_group.database.name
}

# CloudWatch Log Stream for Redis
resource "aws_cloudwatch_log_stream" "redis" {
  name           = "redis"
  log_group_name = aws_cloudwatch_log_group.redis.name
}

# CloudWatch Log Stream for Lambda
resource "aws_cloudwatch_log_stream" "lambda" {
  name           = "lambda"
  log_group_name = aws_cloudwatch_log_group.lambda.name
}

# CloudWatch Log Stream for API Gateway
resource "aws_cloudwatch_log_stream" "api_gateway" {
  name           = "api-gateway"
  log_group_name = aws_cloudwatch_log_group.api_gateway.name
}

# CloudWatch Log Stream for Load Balancer
resource "aws_cloudwatch_log_stream" "alb" {
  name           = "alb"
  log_group_name = aws_cloudwatch_log_group.alb.name
}

# CloudWatch Log Metric Filter for Errors
resource "aws_cloudwatch_log_metric_filter" "error_filter" {
  name           = "${var.name_prefix}-error-filter"
  log_group_name = aws_cloudwatch_log_group.application.name
  pattern        = "[timestamp, request_id, level=\"ERROR\", ...]"

  metric_transformation {
    name      = "ErrorCount"
    namespace = "WhatForDinner/Application"
    value     = "1"
  }
}

# CloudWatch Log Metric Filter for Warnings
resource "aws_cloudwatch_log_metric_filter" "warning_filter" {
  name           = "${var.name_prefix}-warning-filter"
  log_group_name = aws_cloudwatch_log_group.application.name
  pattern        = "[timestamp, request_id, level=\"WARN\", ...]"

  metric_transformation {
    name      = "WarningCount"
    namespace = "WhatForDinner/Application"
    value     = "1"
  }
}

# CloudWatch Log Metric Filter for High Response Time
resource "aws_cloudwatch_log_metric_filter" "slow_request_filter" {
  name           = "${var.name_prefix}-slow-request-filter"
  log_group_name = aws_cloudwatch_log_group.application.name
  pattern        = "[timestamp, request_id, level=\"INFO\", message=\"Request completed\", duration, ...]"

  metric_transformation {
    name      = "SlowRequestCount"
    namespace = "WhatForDinner/Application"
    value     = "1"
  }
}

# CloudWatch Alarm for Error Rate
resource "aws_cloudwatch_metric_alarm" "error_rate" {
  alarm_name          = "${var.name_prefix}-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ErrorCount"
  namespace           = "WhatForDinner/Application"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "This metric monitors application error rate"
  alarm_actions       = [aws_sns_topic.log_alerts.arn]

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-error-rate"
  })
}

# CloudWatch Alarm for Warning Rate
resource "aws_cloudwatch_metric_alarm" "warning_rate" {
  alarm_name          = "${var.name_prefix}-warning-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "WarningCount"
  namespace           = "WhatForDinner/Application"
  period              = "300"
  statistic           = "Sum"
  threshold           = "20"
  alarm_description   = "This metric monitors application warning rate"
  alarm_actions       = [aws_sns_topic.log_alerts.arn]

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-warning-rate"
  })
}

# CloudWatch Alarm for Slow Requests
resource "aws_cloudwatch_metric_alarm" "slow_requests" {
  alarm_name          = "${var.name_prefix}-slow-requests"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "SlowRequestCount"
  namespace           = "WhatForDinner/Application"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "This metric monitors slow request rate"
  alarm_actions       = [aws_sns_topic.log_alerts.arn]

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-slow-requests"
  })
}

# SNS Topic for Log Alerts
resource "aws_sns_topic" "log_alerts" {
  name = "${var.name_prefix}-log-alerts"

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-log-alerts"
  })
}

# SNS Topic Subscription for Log Alerts
resource "aws_sns_topic_subscription" "log_email" {
  count     = var.log_alert_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.log_alerts.arn
  protocol  = "email"
  endpoint  = var.log_alert_email
}

# SNS Topic Subscription for Slack
resource "aws_sns_topic_subscription" "log_slack" {
  count     = var.slack_webhook_url != "" ? 1 : 0
  topic_arn = aws_sns_topic.log_alerts.arn
  protocol  = "https"
  endpoint  = var.slack_webhook_url
}