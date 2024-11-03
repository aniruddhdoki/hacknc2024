resource "aws_launch_template" "ecs_lt" {
  name_prefix   = var.project_name
  instance_type = "t4g.micro"
  image_id      = "ami-054585888b95ba894"

  key_name               = aws_key_pair.key.key_name
  vpc_security_group_ids = [aws_security_group.security_group.id]

  iam_instance_profile {
    arn = aws_iam_instance_profile.ecs_instance_profile.arn
  }

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size = 30
      volume_type = "gp2"
    }
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "ecs-instance"
    }
  }

  user_data = filebase64("${path.module}/ecs.sh")
}
