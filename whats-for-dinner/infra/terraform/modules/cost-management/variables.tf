# Cost Management Module Variables

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "budget_limit" {
  description = "Monthly budget limit in USD"
  type        = number
  default     = 1000
}

variable "budget_alert_thresholds" {
  description = "Budget alert thresholds (percentage)"
  type        = list(number)
  default     = [50, 80, 100]
}

variable "budget_email_addresses" {
  description = "Email addresses for budget alerts"
  type        = list(string)
  default     = []
}

variable "enable_cur" {
  description = "Enable Cost and Usage Report"
  type        = bool
  default     = false
}

variable "enable_anomaly_detection" {
  description = "Enable cost anomaly detection"
  type        = bool
  default     = true
}

variable "enable_daily_cost_alarm" {
  description = "Enable daily cost alarm"
  type        = bool
  default     = true
}

variable "daily_cost_threshold" {
  description = "Daily cost threshold in USD"
  type        = number
  default     = 50
}

variable "cost_alert_emails" {
  description = "Email addresses for cost alerts"
  type        = list(string)
  default     = []
}

variable "production_account_ids" {
  description = "Production account IDs for cost categorization"
  type        = list(string)
  default     = []
}

variable "development_account_ids" {
  description = "Development account IDs for cost categorization"
  type        = list(string)
  default     = []
}

variable "staging_account_ids" {
  description = "Staging account IDs for cost categorization"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}