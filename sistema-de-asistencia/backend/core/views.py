from django.http import HttpResponse

def not_allowed(request):
    html = """
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Acceso Erroneo</title>
        </head>
        <body>
            <p>El acceso al sistema de asistencia debe realizarse desde el frontend</p>
        </body>
    </html>
    """
    return HttpResponse(html)