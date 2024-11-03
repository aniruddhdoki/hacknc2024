resource "aws_ecs_task_definition" "ecs_task_definition" {
  family             = "${var.project_name}-ecs-task"
  network_mode       = "awsvpc"
  execution_role_arn = aws_iam_role.ecs_instance_role.arn
  cpu                = 128
  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }
  container_definitions = jsonencode([
    {
      name      = "web-container"
      image     = "nginx"
      cpu       = 128
      memory    = 256
      essential = true
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
          protocol      = "tcp"
        }
      ]
    }
  ])
}
