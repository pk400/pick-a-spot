#from django.contrib import admin
#from .models import Contact
#from .forms import ContactForm

# Register your models here.
#class ContactAdmin(admin.ModelAdmin):
#	list_display = ['__unicode__', 'timestamp', 'updated']
#	form = ContactForm
#	class Meta:
#		model = Contact

#admin.site.register(Contact, ContactAdmin)


from django.contrib import admin
from .models import UserProfile, Friend, RoomInstance

class UserProfileAdmin(admin.ModelAdmin):
	list_display = ['__unicode__', 'user', 'preferences']
	class Meta:
		model = UserProfile

class FriendAdmin(admin.ModelAdmin):
	list_display = ['relationship_id', 'user1', 'user2']

class RoomInstanceAdmin(admin.ModelAdmin):
	list_display = ['id', 'owner', 'listofusers', 'roomname', 'expirydate']

admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(Friend, FriendAdmin)
admin.site.register(RoomInstance, RoomInstanceAdmin)