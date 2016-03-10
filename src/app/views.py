from django.shortcuts import render
from .forms import RegistrationForm
from .models import UserProfile
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect, HttpResponse
from registration.views import RegistrationView
import json

mapapikey = ('<script src="https://maps.googleapis.com/maps/api/'
	'js?key=AIzaSyAvDRB7PnQbIVNtRHf3x-MTB5y-3OXD1xg&callback=initMap&libraries=places">async defer> </script>')

def custom_404(request):
	return render(request, '404.html')

def custom_500(request):
	return render(request, '500.html')



"""
SPLASH
"""
def home(request):
	if request.user.is_authenticated():
		return HttpResponseRedirect('preferences/')

	context = {
		'title': 'Home'
	}
	return render(request, 'home.html', context)



"""
MAP
"""
def map(request):
	context = {
		'title': 'Map',
		'mapapi': mapapikey,
	}
	return render(request, 'map.html', context)



"""
PREFERENCES
"""
def preferences(request):
	user = UserProfile.objects.filter(user=request.user)
	
	if request.method == 'POST':
		# UPDATE users in database
		jsonsave = json.dumps(request.POST).replace("\\", "")
		jsonsave = jsonsave.replace(' "{','{')
		jsonsave = jsonsave.replace('"}','}')
		update = user.update(preferences=jsonsave)

		context = {
			'title': 'Preferences',
			'postjson': 'null',
		}
	else:
		jsonval = user[0].preferences

		context = {
			'title': 'Preferences',
			'postjson': jsonval,
		}

	return render(request, 'preferences.html', context)



"""
CHAT
"""
def chat(request):
	context = {
		'title': 'Chat',
	}
	return render(request, 'chat.html', context)


