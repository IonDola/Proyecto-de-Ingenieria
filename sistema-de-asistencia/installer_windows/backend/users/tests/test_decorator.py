from django.contrib.auth.models import AnonymousUser
from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from django.http import HttpResponse
from .decorators import roles_required

User = get_user_model()


class UserModelTestCase(TestCase):
    def setUp(self):
        self.dev_user = User.objects.create_user(username="dev", password="1234", role="DEV")
        self.admin_user = User.objects.create_user(username="admin", password="1234", role="ADMIN")
        self.visitor_user = User.objects.create_user(username="visitor", password="1234", role="VISITOR")

    def test_roles_assigned_correctly(self):
        self.assertEqual(self.dev_user.role, "DEV")
        self.assertEqual(self.admin_user.role, "ADMIN")
        self.assertEqual(self.visitor_user.role, "VISITOR")

    def test_user_str(self):
        self.assertEqual(str(self.dev_user), "dev")


class RolesDecoratorTestCase(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.dev_user = User.objects.create_user(username="dev", password="1234", role="DEV")
        self.admin_user = User.objects.create_user(username="admin", password="1234", role="ADMIN")
        self.visitor_user = User.objects.create_user(username="visitor", password="1234", role="VISITOR")

        # Vista de prueba
        @roles_required("DEV", "ADMIN")
        def protected_view(request):
            return HttpResponse("Acceso concedido")

        self.protected_view = protected_view

    def test_access_dev_allowed(self):
        request = self.factory.get("/fake-url/")
        request.user = self.dev_user
        response = self.protected_view(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content.decode(), "Acceso concedido")

    def test_access_admin_allowed(self):
        request = self.factory.get("/fake-url/")
        request.user = self.admin_user
        response = self.protected_view(request)
        self.assertEqual(response.status_code, 200)

    def test_access_visitor_denied(self):
        request = self.factory.get("/fake-url/")
        request.user = self.visitor_user
        response = self.protected_view(request)
        self.assertEqual(response.status_code, 403)
        self.assertIn("Acceso denegado", response.content.decode())

    def test_access_unauthenticated_denied(self):
        request = self.factory.get("/fake-url/")
        request.user = AnonymousUser()  # <- cambia None por AnonymousUser
        response = self.protected_view(request)
        self.assertEqual(response.status_code, 403)
        self.assertIn("No autenticado", response.content.decode())