from django.test import SimpleTestCase
from django.urls import reverse
from rest_framework.response import Response
from rest_framework.test import APIClient, APIRequestFactory
from rest_framework.views import APIView


class HealthTests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()

    def test_public_health_returns_json(self):
        response = self.client.get(reverse('health'), HTTP_AUTHORIZATION='Bearer invalid')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'status': 'ok'})
        self.assertEqual(response['Content-Type'], 'application/json')

    def test_write_method_is_rejected(self):
        self.assertEqual(self.client.post(reverse('health')).status_code, 405)

    def test_frontend_preflight_allows_authorization(self):
        response = self.client.options(
            reverse('health'),
            HTTP_ORIGIN='http://localhost:3000',
            HTTP_ACCESS_CONTROL_REQUEST_METHOD='GET',
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS='authorization',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Access-Control-Allow-Origin'], 'http://localhost:3000')
        self.assertIn('authorization', response['Access-Control-Allow-Headers'])

    def test_unknown_origin_is_not_allowed(self):
        response = self.client.get(reverse('health'), HTTP_ORIGIN='https://untrusted.example')
        self.assertNotIn('Access-Control-Allow-Origin', response)

    def test_default_api_requires_bearer_authentication(self):
        class ProtectedView(APIView):
            def get(self, request):
                return Response({'private': True})

        factory = APIRequestFactory()
        for headers in ({}, {'HTTP_AUTHORIZATION': 'Bearer invalid'}):
            with self.subTest(headers=headers):
                response = ProtectedView.as_view()(factory.get('/private/', **headers))
                self.assertEqual(response.status_code, 401)
                self.assertTrue(response['WWW-Authenticate'].startswith('Bearer'))
