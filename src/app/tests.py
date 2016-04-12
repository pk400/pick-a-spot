from django.test import TestCase
from django.contrib.auth.models import User

class User1(TestCase):
	def setUp(self):
		User.objects.create(username="Jack")
	
	def test(self):
		user = User.objects.get(username="joelaro")

