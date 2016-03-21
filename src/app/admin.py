from django.contrib import admin
from .models import UserProfile, Friend, RoomInstance

class UserProfileAdmin(admin.ModelAdmin):
	list_display = ['__unicode__', 'user', 'preferences']
	class Meta:
		model = UserProfile

class FriendAdmin(admin.ModelAdmin):
	list_display = ['relationship_id', 'user1', 'user2']

class RoomInstanceAdmin(admin.ModelAdmin):
	list_display = ['id', 'owner','listofpref', 'listofusers', 'roomname', 'expirydate', 'isexpired']

admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(Friend, FriendAdmin)
admin.site.register(RoomInstance, RoomInstanceAdmin)