import io
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def make_image():
    buffer = io.BytesIO()
    Image.new("RGB", (64, 64), (30, 90, 70)).save(buffer, format="PNG")
    return buffer.getvalue()


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ProfileImageSmokeTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(phone="09120000000", first_name="تست", last_name="کاربر")
        token = RefreshToken.for_user(self.user)
        self.auth = {"HTTP_AUTHORIZATION": f"Bearer {token.access_token}"}

    def test_upload_get_delete_profile_image(self):
        payload = SimpleUploadedFile("avatar.png", make_image(), content_type="image/png")
        response = self.client.post("/api/auth/profile/image/", {"image": payload}, **self.auth)
        self.assertEqual(response.status_code, 200, response.content)
        self.assertIn("profile_image", response.json())
        self.assertTrue(response.json()["profile_image"])

        response = self.client.get("/api/auth/profile/", **self.auth)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["profile_image"])

        response = self.client.delete("/api/auth/profile/image/", **self.auth)
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json()["profile_image"])
        self.user.refresh_from_db()
        self.assertFalse(self.user.profile_image)

    def test_upload_rejects_non_image(self):
        payload = SimpleUploadedFile("file.txt", b"not an image", content_type="text/plain")
        response = self.client.post("/api/auth/profile/image/", {"image": payload}, **self.auth)
        self.assertEqual(response.status_code, 400)

    def test_upload_requires_file(self):
        response = self.client.post("/api/auth/profile/image/", {}, **self.auth)
        self.assertEqual(response.status_code, 400)
