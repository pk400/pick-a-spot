from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from datetime import datetime, timedelta

# Create your models here.
class UserProfile(models.Model):
    user = models.OneToOneField(User)
    preferences = models.CharField(max_length=500, blank=False, null=False)

    def __unicode__(self):
    	#return str(self.user)
    	return "{0}".format(self.user.id)

    def create_user_profile(sender, instance, created, **kwargs):
        if created:
            UserProfile.objects.create(user=instance)
    post_save.connect(create_user_profile, sender=User)

# Contains relationships between two users
# Ex. UserA is a friend of UserB, which also assumes UserB is a friend of UserA
class Friend(models.Model):
	relationship_id = models.AutoField(primary_key=True)
	user1 = models.ForeignKey(User, related_name='user1')
	user2 = models.ForeignKey(User, related_name='user2')

	def __unicode__(self):
		return str(self.relationship_id)

class RoomInstance(models.Model):
    id = models.AutoField(primary_key=True)
    owner = models.ForeignKey(User, null=True)
    listofusers = models.CharField(max_length=500, blank=True, null=True)
    roomname = models.CharField(max_length=25, blank=True, null=True)
    expirydate = models.DateTimeField(default=datetime.today() + timedelta(days=1), blank=True)

    def __unicode__(self):
        return str(self.id)