from django.contrib import admin
from .models import Contact
from .forms import ContactForm

# Register your models here.
class ContactAdmin(admin.ModelAdmin):
	list_display = ['__unicode__', 'timestamp', 'updated']
	form = ContactForm
	#class Meta:
	#	model = Contact

admin.site.register(Contact, ContactAdmin)