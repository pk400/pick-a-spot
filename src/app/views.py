from django.shortcuts import render
from .forms import RegistrationForm
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect

# Create your views here.
def home(request) :
	context = {
		'title': 'Home'
	}
	return render(request, 'home.html', context)

def browse(request) :
	context = {
		'title': 'Browse',
		'data': [
			'McDonalds',
			'Tim Hortons',
			'Starbucks',
		]
	}
	return render(request, 'browse.html', context)

def login(request) :
	context = {
		'title': 'Login',
	}
	return render(request, 'login.html', context)

def register(request) :
	if request.method == 'POST':
		form = RegistrationForm(request.POST)
		if form.is_valid():
			users = User.objects.filter()
			return HttpResponseRedirect('/')
	else:
		form = RegistrationForm()

	context = {
		'title': 'Register',
		'form': form,
	}

	return render(request, 'register.html', context)