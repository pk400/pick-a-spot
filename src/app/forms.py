from django import forms
from django.forms import Textarea
from .models import Contact, Register

class ContactForm(forms.ModelForm):
	class Meta:
		model = Contact
		fields = ['fullname', 'email']

class RegistrationForm(forms.ModelForm):
	class Meta:
		model = Register
		fields = ['username', 'password', 'email']
		labels = {
			'username': 'Username',
		}
		help_texts = {'',}
		widgets = {
			'password': forms.PasswordInput(),
		}