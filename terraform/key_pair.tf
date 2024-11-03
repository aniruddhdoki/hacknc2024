resource "aws_key_pair" "key" {
  key_name   = "${var.project_name}-key"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC0JH03tj42N3ceA1TymPSedsgeiC5mONVt3KDYSP3ieRuDN+cpz4Q1ityRQPGj6u5A2hc+97L5w/DfNNWXO1SrZZqVDilz/mGQi6rsOdpSZBEXBN9n+9TC8sP1VFzcHgOkszsU/VMnFVaRrJURGoqcvxxsNU/rRMlsfKwkAEAGs2zHdWuURyFKH6jyni9Q6T5lAorLUdv4lMFR/0jf142e0c/DGfSTGyT4zoneZPnZ7PDwj2qwi69LCpmCNC3kxHMRXXDEWkfkUz+vcgxB97RBUO/qaDvGtSpR95LbgB0STPROihnzrSywR2fyeoytC6+AJ5ap+jVxjG+y0mSkCk8J pmoharana@Prajwals-MacBook-Air-2.local"
}