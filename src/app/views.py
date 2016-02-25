from django.shortcuts import render
from .forms import RegistrationForm
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect

mapapikey = ('<script src="https://maps.googleapis.com/maps/api/'
	'js?key=AIzaSyAvDRB7PnQbIVNtRHf3x-MTB5y-3OXD1xg&callback=initMap&libraries=places">async defer> </script>')

def custom_404(request):
	return render(request, '404.html')

def custom_500request):
	return render(request, '500.html')

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

def map(request) :
	context = {
		'title': 'map',
		'mapapi': mapapikey,
	}
	return render(request, 'map.html', context)