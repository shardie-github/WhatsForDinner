# Cost Management Module

# Budget
resource "aws_budgets_budget" "main" {
  name         = "${var.name_prefix}-budget"
  budget_type  = "COST"
  limit_amount = var.budget_limit
  limit_unit   = "USD"
  time_unit    = "MONTHLY"
  time_period_start = "2024-01-01_00:00"

  cost_filters = {
    Service = [
      "Amazon Elastic Compute Cloud - Compute",
      "Amazon Relational Database Service",
      "Amazon ElastiCache",
      "Amazon Simple Storage Service",
      "Amazon CloudWatch",
      "Amazon Elastic Load Balancing",
      "Amazon Elastic Container Service"
    ]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = var.budget_alert_thresholds[0]
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = var.budget_email_addresses
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = var.budget_alert_thresholds[1]
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = var.budget_email_addresses
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = var.budget_alert_thresholds[2]
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = var.budget_email_addresses
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-budget"
  })
}

# Cost and Usage Report
resource "aws_cur_report_definition" "main" {
  count = var.enable_cur ? 1 : 0

  report_name                = "${var.name_prefix}-cur"
  time_unit                  = "DAILY"
  format                     = "textORcsv"
  compression                = "GZIP"
  additional_schema_elements = ["RESOURCES"]
  s3_bucket                  = aws_s3_bucket.cur[0].bucket
  s3_prefix                  = "cur/"
  s3_region                  = "us-east-1"
  additional_artifacts       = ["REDSHIFT", "QUICKSIGHT"]
  refresh_closed_reports     = true
  report_versioning          = "CREATE_NEW_REPORT"
}

# S3 Bucket for Cost and Usage Report
resource "aws_s3_bucket" "cur" {
  count = var.enable_cur ? 1 : 0

  bucket = "${var.name_prefix}-cur-${random_string.bucket_suffix[0].result}"

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-cur-bucket"
  })
}

resource "random_string" "bucket_suffix" {
  count   = var.enable_cur ? 1 : 0
  length  = 8
  special = false
  upper   = false
}

# S3 Bucket Policy for Cost and Usage Report
resource "aws_s3_bucket_policy" "cur" {
  count = var.enable_cur ? 1 : 0

  bucket = aws_s3_bucket.cur[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSBucketPermissionsCheck"
        Effect = "Allow"
        Principal = {
          Service = "billingreports.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = aws_s3_bucket.cur[0].arn
      },
      {
        Sid    = "AWSBucketDelivery"
        Effect = "Allow"
        Principal = {
          Service = "billingreports.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.cur[0].arn}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      }
    ]
  })
}

# Cost Anomaly Detection
resource "aws_ce_anomaly_detector" "main" {
  count = var.enable_anomaly_detection ? 1 : 0

  name = "${var.name_prefix}-anomaly-detector"

  specification = jsonencode({
    AnomalyDetectorType = "DIMENSIONAL"
    Dimension          = "SERVICE"
    MatchAnomalyDetector = {
      MatchOptions = ["EQUALS"]
      Key          = "SERVICE"
      Values       = [
        "Amazon Elastic Compute Cloud - Compute",
        "Amazon Relational Database Service",
        "Amazon ElastiCache",
        "Amazon Simple Storage Service",
        "Amazon CloudWatch",
        "Amazon Elastic Load Balancing",
        "Amazon Elastic Container Service"
      ]
    }
  })

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-anomaly-detector"
  })
}

# Cost Allocation Tags
resource "aws_ce_cost_allocation_tag" "environment" {
  tag_key = "Environment"
  status  = "Active"
}

resource "aws_ce_cost_allocation_tag" "project" {
  tag_key = "Project"
  status  = "Active"
}

resource "aws_ce_cost_allocation_tag" "managed_by" {
  tag_key = "ManagedBy"
  status  = "Active"
}

# CloudWatch Alarms for Cost
resource "aws_cloudwatch_metric_alarm" "daily_cost" {
  count = var.enable_daily_cost_alarm ? 1 : 0

  alarm_name          = "${var.name_prefix}-daily-cost"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  period              = "86400" # 24 hours
  statistic           = "Maximum"
  threshold           = var.daily_cost_threshold
  alarm_description   = "This metric monitors daily AWS costs"
  alarm_actions       = [aws_sns_topic.cost_alerts[0].arn]

  dimensions = {
    Currency = "USD"
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-daily-cost"
  })
}

# SNS Topic for Cost Alerts
resource "aws_sns_topic" "cost_alerts" {
  count = var.enable_daily_cost_alarm ? 1 : 0

  name = "${var.name_prefix}-cost-alerts"

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-cost-alerts"
  })
}

# SNS Topic Subscription for Cost Alerts
resource "aws_sns_topic_subscription" "cost_email" {
  count = var.enable_daily_cost_alarm && length(var.cost_alert_emails) > 0 ? 1 : 0

  topic_arn = aws_sns_topic.cost_alerts[0].arn
  protocol  = "email"
  endpoint  = var.cost_alert_emails[0]
}

# Cost Optimization Recommendations
resource "aws_ce_cost_category" "main" {
  name = "${var.name_prefix}-cost-category"

  rule {
    value = "Production"
    rule {
      dimension {
        key  = "LINKED_ACCOUNT"
        values = var.production_account_ids
      }
    }
  }

  rule {
    value = "Development"
    rule {
      dimension {
        key  = "LINKED_ACCOUNT"
        values = var.development_account_ids
      }
    }
  }

  rule {
    value = "Staging"
    rule {
      dimension {
        key  = "LINKED_ACCOUNT"
        values = var.staging_account_ids
      }
    }
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-cost-category"
  })
}