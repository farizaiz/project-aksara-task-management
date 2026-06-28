# Script to run all Aksara services
Write-Host "Starting Infrastructure..."
cd infra
docker-compose up -d
cd ..

Write-Host "Starting API Gateway..."
Start-Process -FilePath "go" -ArgumentList "run", "cmd/main.go" -WorkingDirectory "$PWD\api-gateway" -WindowStyle Normal

$services = @("user-service", "task-service", "project-service", "comment-service", "notification-service", "finance-service")

foreach ($service in $services) {
    Write-Host "Starting $service..."
    Start-Process -FilePath "go" -ArgumentList "run", "cmd/main.go" -WorkingDirectory "$PWD\services\$service" -WindowStyle Normal
}

Write-Host "Starting Frontend App..."
Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" -WorkingDirectory "$PWD\frontend-app" -WindowStyle Normal

Write-Host "All services started in separate windows."
