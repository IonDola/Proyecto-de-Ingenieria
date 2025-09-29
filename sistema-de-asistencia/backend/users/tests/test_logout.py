from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()

class LogoutViewTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="test", password="1234", role="VISITOR")
        self.client.login(username="test", password="1234")  # autenticar usuario

    def test_logout_success(self):
        response = self.client.post(reverse("logout"))
        self.assertEqual(response.status_code, 200)
        self.assertIn("Sesión cerrada correctamente", response.json()["message"])

    def test_user_logged_out(self):
        # primero loguear y luego hacer logout
        self.client.post(reverse("logout"))
        response = self.client.post(reverse("logout"))  # segunda llamada también POST
        self.assertEqual(response.status_code, 200)
        # verificar que no hay sesión activa
        self.assertNotIn("_auth_user_id", self.client.session)