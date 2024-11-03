output "vpc_id" {
  value = aws_vpc.main.id
}

output "subnet_ids" {
  value = [aws_subnet.subnet1.id, aws_subnet.subnet2.id]
}

output "security_group_id" {
  value = aws_security_group.security_group.id
}

output "alb_dns_name" {
  value = aws_lb.ecs_alb.dns_name
}