from django.shortcuts import render
from .forms import RegistrationForm
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect
from registration.views import RegistrationView

mapapikey = ('<script src="https://maps.googleapis.com/maps/api/'
	'js?key=AIzaSyAvDRB7PnQbIVNtRHf3x-MTB5y-3OXD1xg&callback=initMap&libraries=places">async defer> </script>')

def custom_404(request):
	return render(request, '404.html')

def custom_500(request):
	return render(request, '500.html')

# Create your views here.
def home(request) :
	if request.user.is_authenticated():
		return HttpResponseRedirect('/preferences')

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


def map(request) :
	context = {
		'title': 'Map',
		'mapapi': mapapikey,
	}
	return render(request, 'map.html', context)

def preferences(request):
	if request.user.is_active:
		context = {
			'title': 'Preferences',
		}
		return render(request, 'preferences.html', context)
	else:
		return HttpResponseRedirect('/')