from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime

def generate_student_history_pdf(student, actions):
    """
    Genera un PDF con el historial completo de un estudiante.
    
    Args:
        student: objeto Student con la información del estudiante
        actions: lista de objetos Action relacionados al estudiante
    
    Returns:
        BytesIO: buffer con el contenido del PDF
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter, 
        rightMargin=72, 
        leftMargin=72,
        topMargin=72, 
        bottomMargin=18
    )
    
    # Contenedor de elementos del PDF
    elements = []
    
    # Estilos
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#486589'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#BA9161'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    normal_style = styles['Normal']
    
    # Título del documento
    title = Paragraph("Historial de Estudiante", title_style)
    elements.append(title)
    elements.append(Spacer(1, 0.2*inch))
    
    # Información del estudiante
    student_heading = Paragraph("Información del Estudiante", heading_style)
    elements.append(student_heading)
    
    student_data = [
        ["Carnet/ID:", student.id_mep or "—"],
        ["Nombre completo:", f"{student.first_name} {student.surnames}"],
        ["Nacionalidad:", student.nationality or "—"],
        ["Fecha de nacimiento:", str(student.birth_date) if student.birth_date else "—"],
        ["Género:", student.gender or "—"],
        ["Sección:", student.section or "—"],
        ["Dirección:", student.address or "—"],
    ]
    
    student_table = Table(student_data, colWidths=[2*inch, 4*inch])
    student_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#B1BDCD')),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
    ]))
    
    elements.append(student_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Encargados legales
    guardians_heading = Paragraph("Encargados Legales", heading_style)
    elements.append(guardians_heading)
    
    guardians_data = []
    if student.guardian_name_1:
        guardians_data.append(["Encargado 1:", student.guardian_name_1])
        guardians_data.append(["Cédula:", student.guardian_id_1 or "—"])
        guardians_data.append(["Teléfono:", student.guardian_phone_1 or "—"])
        guardians_data.append(["Parentesco:", student.guardian_relationship_1 or "—"])
    
    if student.guardian_name_2:
        guardians_data.append(["Encargado 2:", student.guardian_name_2])
        guardians_data.append(["Cédula:", student.guardian_id_2 or "—"])
        guardians_data.append(["Teléfono:", student.guardian_phone_2 or "—"])
        guardians_data.append(["Parentesco:", student.guardian_relationship_2 or "—"])
    
    if student.guardian_name_3:
        guardians_data.append(["Encargado 3:", student.guardian_name_3])
        guardians_data.append(["Cédula:", student.guardian_id_3 or "—"])
        guardians_data.append(["Teléfono:", student.guardian_phone_3 or "—"])
        guardians_data.append(["Parentesco:", student.guardian_relationship_3 or "—"])
    
    if guardians_data:
        guardians_table = Table(guardians_data, colWidths=[2*inch, 4*inch])
        guardians_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#B1BDCD')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))
        elements.append(guardians_table)
    
    elements.append(Spacer(1, 0.3*inch))
    
    # Historial de acciones
    actions_heading = Paragraph("Historial de Acciones", heading_style)
    elements.append(actions_heading)
    
    if actions:
        # Encabezados de la tabla
        actions_data = [["Tipo", "Fecha", "Actor", "Estado", "Notas"]]
        
        for action in actions:
            fecha = action.created_at.strftime("%Y-%m-%d %H:%M") if action.created_at else "—"
            estado = "En Revisión" if action.on_revision else "Aplicado"
            notas = (action.notes[:50] + "...") if action.notes and len(action.notes) > 50 else (action.notes or "—")
            
            actions_data.append([
                action.type or "—",
                fecha,
                action.actor or "—",
                estado,
                notas
            ])
        
        actions_table = Table(actions_data, colWidths=[0.8*inch, 1.3*inch, 1.2*inch, 1*inch, 2.2*inch])
        actions_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#BA9161')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5F5')]),
        ]))
        elements.append(actions_table)
    else:
        no_actions = Paragraph("No hay acciones registradas para este estudiante.", normal_style)
        elements.append(no_actions)
    
    elements.append(Spacer(1, 0.3*inch))
    
    # Pie de página
    footer_text = f"Generado el: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    footer = Paragraph(footer_text, ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey,
        alignment=TA_CENTER
    ))
    elements.append(footer)
    
    # Construir el PDF
    doc.build(elements)
    
    buffer.seek(0)
    return buffer