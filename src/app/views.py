from django.shortcuts import render
from .models import UserProfile, Friend, RoomInstance
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, HttpResponse
from registration.views import RegistrationView
from django.db.models import Q
from datetime import datetime,timedelta
import json

mapapikey = ('<script src="https://maps.googleapis.com/maps/api/'
	'js?key=AIzaSyAvDRB7PnQbIVNtRHf3x-MTB5y-3OXD1xg&libraries=places">async defer> </script>')

def custom_404(request):
	return render(request, '404.html')

def custom_500(request):
	return render(request, '500.html')



"""
HOME
"""
@login_required(login_url='/splash/')
def home(request):
	context = {
		'title': 'User Hub',
	}
	return render(request, 'home.html', context)



"""
SPLASH
"""
def splash(request):
	context = {
		'title': 'Splash'
	}
	if request.user.is_authenticated():
		print 'hello'
		return HttpResponseRedirect('/')
	else:
		return render(request, 'splash.html', context)



"""
MAP
"""
def map(request):
	value = ""
	if request.user.is_authenticated():
		user = UserProfile.objects.filter(user=request.user)
		value = user[0].preferences
	context = {
		'title': 'Map',
		'mapapi': mapapikey,
		'preferences' : value
	}
	check_expiry()
	getrequest = request.GET.get('room','')

	if getrequest:
		ri = RoomInstance.objects.filter(roomname=getrequest)
		if not ri:
			return HttpResponseRedirect('/')

	if request.method == 'POST':
		result = json.loads(json.dumps(request.POST))
		if result['type'] == "makeroom":
			ri = RoomInstance(roomname=result['roomname'], listofpref=result['listofpref'], owner=result['owner'])
			ri.save()
		elif result['type'] == "grabpref":
			# Returns the list of preferences
			ri = RoomInstance.objects.get(roomname=result['roomname'])
			return HttpResponse(ri.listofpref)
		elif result['type'] == "updatepref":
			# Updates preferences
			ri = RoomInstance.objects.filter(roomname=result['roomname'])
			ri.update(listofpref=result['listofpref'])

	return render(request, 'map.html', context)
"""
Removes old entries
"""
def check_expiry():
	ri = RoomInstance.objects.filter(expirydate__lt = datetime.now() )
	ri.update(isexpired = True)


"""
PREFERENCES
"""
@login_required
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
FRIENDS
"""
@login_required
def friends(request):
	user = User.objects.get(id=request.user.id)
	friendlist = Friend.objects.filter(Q(user1=user) | Q(user2=user)).order_by()

	context = {
		'title': 'Friends',
		'friends': friendlist
	}

	if request.method == 'POST':
		result = json.loads(json.dumps(request.POST))
		if result['addfriend']:
			friend_user = User.objects.get(username=result['addfriend'])
			
			# If there is no relationship between users,
			# create one
			if not Friend.objects.filter(user1=user, user2=friend_user):
				addfriend = Friend(user1=user, user2=friend_user)
				addfriend.save()
		elif result['delfriend']:
			friend_user = User.objects.get(username=result['delfriend'])

			Friend.objects.get(user1=user, user2=friend_user).delete()

	return render(request, 'friends.html', context)



"""
CHAT
"""
def chat(request):
	context = {
		'title': 'Chat',
	}
	return render(request, 'chat.html', context)
