from django.contrib import messages
from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from .models import Student, Action
from .forms import StudentForm

def student_list(request):
    q = request.GET.get("q", "").strip()
    qs = Student.objects.all()
    if q:
        qs = qs.filter(
            Q(id_mep__icontains=q) |
            Q(first_name__icontains=q) |
            Q(last_name__icontains=q)
        )
    students = Paginator(qs, 10).get_page(request.GET.get("page"))
    return render(request, "students/student_list.html", {"students": students, "q": q})

def student_create(request):
    if request.method == "POST":
        form = StudentForm(request.POST)
        if form.is_valid():
            student = form.save()
            messages.success(request, "Estudiante creado exitosamente.")
            # TODO : bitacora STUDENT_CREATED
            return redirect(reverse("students:student_detail", args=[student.id]))
    else:
        form = StudentForm()
    return render(request, "students/student_form.html", {"form": form, "mode": "create"})

def student_edit(request, pk):
    student = get_object_or_404(Student, pk=pk)
    if request.method == "POST":
        form = StudentForm(request.POST, instance=student)
        if form.is_valid():
            form.save()
            messages.success(request, "Cambios guardados.")
            # TODO : bitacora STUDENT_UPDATED
            return redirect(reverse("students:student_detail", args=[student.id]))
    else:
        form = StudentForm(instance=student)
    return render(request, "students/student_form.html", {"form": form, "mode": "edit", "student": student})

def student_detail(request, pk):
    student = get_object_or_404(Student, pk=pk)
    return render(request, "students/student_detail.html", {"student": student})

def history_list(request, student_id):
    student = get_object_or_404(Student, pk=student_id)
    actions = Paginator(student.actions.all(), 10).get_page(request.GET.get("page"))
    return render(request, "students/history_list.html", {"student": student, "actions": actions})

def history_detail(request, student_id, action_id):
    student = get_object_or_404(Student, pk=student_id)
    action = get_object_or_404(Action, pk=action_id, student=student)
    return render(request, "students/history_detail.html", {"student": student, "action": action})
