from django.test import TestCase
from django.urls import reverse
from students.models import Student

class StudentCreateTests(TestCase):
    def test_create_student_success(self):
        payload = {
            "id_mep": "202104001",
            "first_name": "Ana",
            "last_name": "López",
            "section": "1-3",
        }
        r = self.client.post(reverse("students:student_create"), payload, follow=True)
        self.assertEqual(r.status_code, 200)
        self.assertTrue(Student.objects.filter(id_mep="202104001").exists())

    def test_create_student_duplicate_id_mep_blocked(self):
        Student.objects.create(id_mep="X123", first_name="A", last_name="B", section="1-1")
        r = self.client.post(reverse("students:student_create"), {
            "id_mep": "X123","first_name":"Otro","last_name":"Ap","section":"1-2",
        })
        self.assertContains(r, "duplic", status_code=200)  # mensaje de error
        self.assertEqual(Student.objects.filter(id_mep="X123").count(), 1)


class StudentSearchTests(TestCase):
    def setUp(self):
        Student.objects.create(id_mep="111", first_name="Sarah", last_name="Quesada", section="1-1")
        Student.objects.create(id_mep="222", first_name="Ion", last_name="Dolanescu", section="1-1")

    def test_search_by_name(self):
        r = self.client.get(reverse("students:student_list"), {"q":"sarah"})
        self.assertContains(r, "Sarah")
        self.assertNotContains(r, "Ion")

    def test_search_by_id(self):
        r = self.client.get(reverse("students:student_list"), {"q":"222"})
        self.assertContains(r, "Dolanescu")

class StudentEditTests(TestCase):
    def setUp(self):
        self.st = Student.objects.create(id_mep="333", first_name="Ada", last_name="Lovelace", section="1-3")

    def test_edit_student_persists(self):
        url = reverse("students:student_edit", args=[self.st.pk])
        r = self.client.post(url, {"id_mep":"333","first_name":"Ada","last_name":"L.","section":"1-3"}, follow=True)
        self.assertEqual(r.status_code, 200)
        self.st.refresh_from_db()
        self.assertEqual(self.st.last_name, "L.")
