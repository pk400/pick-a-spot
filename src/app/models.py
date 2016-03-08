from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Contact(models.Model):
	fullname = models.CharField(max_length=120, blank=False, null=True)
	email = models.EmailField()
	timestamp = models.DateTimeField(auto_now_add=True, auto_now=False)
	updated = models.DateTimeField(auto_now_add=False, auto_now=True)

	def __unicode__(self): #Python 3.3 is __str__
		return self.email

class Register(models.Model):
	username 	= models.CharField(max_length=100, blank=False, null=False)
	password	= models.CharField(max_length=100, blank=False, null=False)
	email 		= models.EmailField(max_length=100, blank=False, null=False)
	timestamp 	= models.DateTimeField(auto_now_add=True, auto_now=False)

class UserProfile(models.Model):
    user = models.ForeignKey(User, unique=True)
    url = models.URLField("Website", blank=True)
    company = models.CharField(max_length=50, blank=True)
