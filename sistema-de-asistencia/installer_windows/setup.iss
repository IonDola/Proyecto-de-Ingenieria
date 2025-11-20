$nssm = "$PSScriptRoot\..\nssm\nssm.exe"
$backend = "$PSScriptRoot\..\backend"
$frontend = "$PSScriptRoot\..\frontend"

# Django service
& $nssm install ProyectoDjango "$backend\venv\Scripts\python.exe" "manage.py" "runserver" "0.0.0.0:8000"
& $nssm set ProyectoDjango AppDirectory "$backend"

# Node service
& $nssm install ProyectoNode "node.exe" "npm" "start"
& $nssm set ProyectoNode AppDirectory "$frontend"

# Start
& $nssm start ProyectoDjango
& $nssm start ProyectoNode
