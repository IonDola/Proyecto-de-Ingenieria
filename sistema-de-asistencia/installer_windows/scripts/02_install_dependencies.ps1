$backend = "$PSScriptRoot\..\backend"
$frontend = "$PSScriptRoot\..\frontend"

# Backend (Django)
python -m venv "$backend\venv"
& "$backend\venv\Scripts\activate.ps1"
pip install -r "$backend\requirements.txt"
python "$backend\manage.py" migrate
python "$backend\manage.py" collectstatic --noinput

# Frontend (Node)
cd $frontend
npm install
npm run build
