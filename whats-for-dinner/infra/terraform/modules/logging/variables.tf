# Logging Module Variables

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "log_alert_email" {
  description = "Email address for log alerts"
  type        = string
  default     = ""
}

variable "slack_webhook_url" {
  description = "Slack webhook URL for notifications"
  type        = string
  default     = ""
  sensitive   = true
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}