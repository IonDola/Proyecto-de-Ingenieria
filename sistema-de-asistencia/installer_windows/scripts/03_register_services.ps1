$nssm = "$PSScriptRoot\..\nssm\nssm.exe"
$backend = "$PSScriptRoot\..\backend"
$frontend = "$PSScriptRoot\..\frontend"

# Servicio de Django
& $nssm install SistemaAsistenciaDjango "$backend\venv\Scripts\python.exe" "manage.py" "runserver" "0.0.0.0:8000"
& $nssm set SistemaAsistenciaDjango AppDirectory "$backend"

# Servicio de Node
& $nssm install SistemaAsistenciaNode "node.exe" "npm" "start"
& $nssm set SistemaAsistenciaNode AppDirectory "$frontend"

& $nssm start SistemaAsistenciaDjango
& $nssm start SistemaAsistenciaNode
