from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save

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
    user = models.OneToOneField(User)
    preferences = models.CharField(max_length=500, blank=False, null=False)
    def create_user_profile(sender, instance, created, **kwargs):
        if created:
            UserProfile.objects.create(user=instance)
    post_save.connect(create_user_profile, sender=User)