from django.shortcuts import render
from .models import UserProfile, Friend, RoomInstance
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, HttpResponse
from registration.views import RegistrationView
from django.db.models import Q
from datetime import datetime,timedelta
from django.contrib.gis.geoip2 import GeoIP2
from geopy import geocoders
from registration.views import RegistrationView
from django.core.mail import send_mail
import json
import ast

mapapikey = ('<script src="https://maps.googleapis.com/maps/api/'
	'js?key=AIzaSyAvDRB7PnQbIVNtRHf3x-MTB5y-3OXD1xg&libraries=places">async defer> </script>')

def custom_404(request):
	return render(request, '404.html')

def custom_500(request):
	return render(request, '500.html')



"""
HOME
"""
@login_required(login_url='/')
def home(request):
	context = {
		'title': 'Home',
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
		return HttpResponseRedirect('/home')
	else:
		return render(request, 'splash.html', context)



"""
MAP
"""
def map(request):
	prefval = ""
	friendlist = ""
	if request.user.is_authenticated():
		user = UserProfile.objects.filter(user=request.user)
		prefval = user[0].preferences
		user = User.objects.get(id=request.user.id)
		friendlist = Friend.objects.filter(Q(user1=user) | Q(user2=user)).order_by()

	# Get IP then lat/long
	g = GeoIP2()
	ip = request.META.get('HTTP_X_REAL_IP', None)
	try:
		lonlat = g.lon_lat(ip)
	except Exception as err:
		# Private network
		lonlat = [-79.4163000, 43.7001100]
	context = {
		'title': 'Map',
		'mapapi': mapapikey,
		'preferences' : prefval,
		"lon": lonlat[0], 
		"lat": lonlat[1],
		"friends" : friendlist
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
		elif result['type'] == "getlocation":
			# Grabs lat/lng from address
			value = ""
			try:
				geolocator = geocoders.GoogleV3('AIzaSyB_djldgwM0HGAg7opZpVx5StLQB1KDkQc')
				location = geolocator.geocode(result["address"])
				value = "[" + str(location.longitude) + ", " + str(location.latitude) + "]"
			except Exception as err:
				value = "Error"
			return HttpResponse(value)
		elif result['type'] == 'sendemails' and request.user.is_authenticated():
				# Chosen users to send email to
				chosenfriends = result['friends'].split()[0]
				chosenfriends = ast.literal_eval(chosenfriends)
				user = User.objects.get(id=request.user.id)
				friendlist = Friend.objects.filter(Q(user1=user) | Q(user2=user)).order_by()
				emaillist = []
				for friend in friendlist:
					# Grabs only one person
					# If match exists and it's not the user sending the request
					user = User.objects.get((Q(id=friend.user1_id) | Q(id=friend.user2_id)) & ~Q(id=request.user.id))
					for chosen in chosenfriends:
						# Since all friends are grabbed, only sends email to those picked
						if chosen == user.username and user.email not in emaillist:
							emaillist.append(user.email)
				#TODO: Make this better					
				send_mail('PickASpot Room', 'Hi, join my room!' + result['roomlink'], 'pickaspotmail@gmail.com', emaillist)

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
	friendlist = Friend.objects.filter(Q(user1=user) | Q(user2=user))
	for x in friendlist:
		print x

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
def chat2(request):
	context = {
		'title': 'Chat2',
	}
	return render(request, 'chat2.html', context)



"""
PROFILE
"""
def profile(request):
	context = {
		'title': 'Profile',
	}
	return render(request, 'profile.html', context)
