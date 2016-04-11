from django.shortcuts import render
from .models import UserProfile, Friend, RoomInstance
from django.contrib.auth.models import User, Group
from django.contrib.sessions.models import Session
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, HttpResponse
from registration.views import RegistrationView
from django.db.models import Q
from datetime import datetime,timedelta
from django.contrib.gis.geoip2 import GeoIP2
from geopy import geocoders
from registration.views import RegistrationView
from django.core.mail import send_mail
from lazysignup.utils import is_lazy_user
from lazysignup.decorators import allow_lazy_user
from django.template import RequestContext
from django.shortcuts import render_to_response
import json
import ast
import random
import string
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



def rename_lazyaccount(request):
	user = request.user
	username = user.username
	# Makes random username
	if is_lazy_user(user) and len(username) >= 30:
		user = User.objects.get(username = username)
		user.username = "Guest - " + ''.join(random.SystemRandom().choice(string.ascii_letters + string.digits) for _ in range(7))

		group = Group.objects.get(name="Guest")
		group.user_set.add(user)

		user.save()
		request.user = user

"""
SPLASH
"""
def splash(request):
	#rename_lazyaccount(request)
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

@allow_lazy_user
def map(request):
	rename_lazyaccount(request)
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
		"friends" : friendlist,
		"listofusers" : []
	}

	check_expiry()
	getrequest = request.GET.get('room','')
	if getrequest:
		ri = RoomInstance.objects.filter(roomname=getrequest)
		if not ri:
			return HttpResponseRedirect('/')
		else:
			ri = RoomInstance.objects.get(roomname=getrequest)
			users = json.loads(ri.listofusers)
			listofusers = []
			for user in users:
				listofusers.append(user['username'])
			context['listofusers'] = listofusers
	if request.method == 'POST':
		result = json.loads(json.dumps(request.POST))
		if result['type'] == "makeroom":
			ri = RoomInstance(
				roomname=result['roomname'], 
				listofpref=result['listofpref'], 
				owner=result['owner'],
				expirydate=datetime.today() + timedelta(days=1))
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
		elif result['type'] == 'sendinvites' and request.user.is_authenticated():
			"""
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
					if chosen.lower() == user.username.lower() and user.email.lower() not in emaillist:
						emaillist.append(user.email.lower())
			#TODO: Make this better					
			send_mail('PickASpot Room', 'Hi, join my room!' + result['roomlink'], 'pickaspotmail@gmail.com', emaillist)
			"""
			ri = RoomInstance.objects.get(roomname=result['roomname'])
			listofusers = json.loads(ri.listofusers)
			listofpref = json.loads(ri.listofpref)
			friends = json.loads(result['friends'])
			for friend in friends:
				newuserinroom = {"username": friend, "online" : "false"}
				listofusers.append(newuserinroom)
				userid = User.objects.get(username__iexact=friend)
				user = UserProfile.objects.get(user=userid.id)
				try:
					newuserpref = {"user" : friend, "preferences" : json.loads(user.preferences)}
				except Exception as err:
					newuserpref = {"user" : friend, "preferences" : "[]"}
				listofpref.append(newuserpref)

				# Includes into notification
				pendingnotifications = json.loads(user.pendingnotifications)
				message = {
					'message' : "You have been added into room " + str(result['roomname']) + " by your friend " + str(request.user),
					"reason": "NewRoom",
					"notificationid": ''.join(random.SystemRandom().choice(string.ascii_letters + string.digits) for _ in range(7))}		
				pendingnotifications.insert(0,message)
				user.pendingnotifications = json.dumps(pendingnotifications)
				user.save()
			ri.listofusers = json.dumps(listofusers)
			ri.listofpref = json.dumps(listofpref)
			ri.save()
		elif result['type'] == 'savechathistory':
			# Saves all data to db
			data = result['chathistory']
			ri = RoomInstance.objects.filter(roomname=result['roomname'])
			ri.update(chathistory=result['chathistory'])
		elif result['type']	== 'grabchathistory':
			# grabs and returns history
			ri = RoomInstance.objects.get(roomname=result['roomname'])
			return HttpResponse(ri.chathistory)
		elif result['type'] == 'listofusers':
			ri = RoomInstance.objects.get(roomname=result['roomname'])
			return HttpResponse(ri.listofusers)
		elif result['type'] == 'grabroomsettings':
			ri = RoomInstance.objects.get(roomname=result['roomname'])
			return HttpResponse(ri.roomsetting)
		elif result['type'] == 'saveroomsettings':
			onlineonly = result['onlineonly']
			randomrslt = result['random']
			setting = [onlineonly, randomrslt]
			ri = RoomInstance.objects.filter(roomname=result['roomname'])
			ri.update(roomsetting=json.dumps(setting))
		elif result['type'] == 'savelastresult':
			lastresults = result['results']
			ri = RoomInstance.objects.filter(roomname=result['roomname'])
			ri.update(lastresult=lastresults)
		elif result['type'] == 'getlastresult':
			ri = RoomInstance.objects.get(roomname=result['roomname'])
			return HttpResponse(ri.lastresult)
		elif result['type'] == 'updateuserpref':
			user = UserProfile.objects.filter(user=request.user)
			update = user.update(preferences=result['preferences'])
	
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
		if result['type'] == "sendinvite":
			usernametext = result['newfriend']
			originaluser = request.user.username
			# Grabs needed user
			try:
				senttousername = User.objects.get(username__iexact=usernametext)
				senttouser = UserProfile.objects.get(user=senttousername.id)
				pendingfriendslist = json.loads(senttouser.pendingfriends)
			except Exception as err:
				senttouser = None
			if not senttouser:
				servermessage = {
				"message" : "The user " + str(usernametext) + " does not exist.", 
				"reason": "Wrong"}
			elif senttousername == request.user:
				servermessage = {
				"message" : "You can not be friends with yourself. Sorry!", 
				"reason": "Self"}
			elif Friend.objects.filter(user1=senttousername, user2=request.user) or Friend.objects.filter(user1=request.user, user2=senttousername):
				# check if already friends
				servermessage = {
				"message" : "Already a friend of " + str(senttousername) +"!", 
				"reason": "Exists"}
			else:
				# checks if in list already
				inlist = False
				for friend in pendingfriendslist:
					if friend['username'].lower() == originaluser.lower():
						inlist = True
						break
				if inlist:
					servermessage = {
					"message" : "Invite already sent to " + str(senttousername) +"!", 
					"reason": "Already"}
				else:
					# Grabs the json, appens to it
					pendingfriend = {}
					pendingfriend["username"] = originaluser
					pendingfriendslist.append(pendingfriend)
					newfriend = UserProfile.objects.filter(user=senttousername.id)	
					# Updates the list with the new user object
					newfriend.update(pendingfriends=json.dumps(pendingfriendslist))
					servermessage = {
					"message" : "You have sent a invite to " + str(senttousername), 
					"reason": "Added"}
			return HttpResponse(json.dumps(servermessage))


		elif result['type'] == "deletefriend":
			friend_user = User.objects.get(username=result['delfriend'])
			try:
				Friend.objects.get(user1=user, user2=friend_user).delete()
			except Exception as err:
				try:
					Friend.objects.get(user1=friend_user, user2=user).delete()
				except Exception as err:
					pass

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


def resetpassword(request):
	return render(request, 'resetpassword.html', {})

def confirmreset(request):
	return render(request, 'confirmreset.html', {})