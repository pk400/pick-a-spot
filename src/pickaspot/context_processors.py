from datetime import datetime
from django.conf import settings
from app.models import RoomInstance, UserProfile, User, Friend
from django.contrib.auth.decorators import login_required
from datetime import datetime, timedelta
from lazysignup.utils import is_lazy_user
import json
import random
import string
def default(request):
    contextdict = {}

    if request.user.is_anonymous():
        return contextdict
    else:
        rooms = []
        user = request.user
        ri = RoomInstance.objects.filter(listofusers__icontains = user, expirydate__gt = datetime.now())

        for room in ri:
            timeleft = int(timedelta.total_seconds(room.expirydate - datetime.today()))
            roomdict = {
                'roomname' : room.roomname,
                'expirydate' : timeleft,
            }
            rooms.append(roomdict)
        contextdict['rooms'] = rooms

        if is_lazy_user(user) == False and request.user.is_authenticated():
            userprofile = UserProfile.objects.get(user=user.id)
            pendingfriends = json.loads(userprofile.pendingfriends)
            friendinvites = []

            for friend in pendingfriends:
                friendinvitedict = {
                    'username' : friend['username']
                }
                friendinvites.append(friendinvitedict)

            contextdict['friendinvites'] = friendinvites
            pendingnotifications = json.loads(userprofile.pendingnotifications)
            
            pending = []
            for notification in pendingnotifications:
                notificationdict = {
                    'message' : notification['message'],
                    'notificationid' : notification['notificationid']
                }
                pending.append(notificationdict)

            contextdict['pendingnotifications'] = pending

            contextdict['notificationslength'] = len(contextdict['friendinvites']) + len(contextdict['pendingnotifications'])
    if request.method == 'POST':
        result = json.loads(json.dumps(request.POST))
        if 'type' in result:
            if  result['type'] == "addfriend":
                friend_user = User.objects.get(username=result['sender'])
                # If there is no relationship between users,
                # create one
                if not Friend.objects.filter(user1=user, user2=friend_user) and not Friend.objects.filter(user1=friend_user, user2=user):
                    addfriend = Friend(user1=user, user2=friend_user)
                    addfriend.save()

                    user = UserProfile.objects.get(user=request.user)
                    removepending(user, result['sender'], request.user)
                    friendprofile = UserProfile.objects.get(user=friend_user.id)
                    pendingnotifications = json.loads(friendprofile.pendingnotifications)
                    message = {
                        "message" : "You are now friends with " + str(request.user), 
                        "reason": "Accepted",
                        "notificationid": ''.join(random.SystemRandom().choice(string.ascii_letters + string.digits) for _ in range(7))}
                    pendingnotifications.insert(0,message)
                    friendprofile.pendingnotifications = json.dumps(pendingnotifications)
                    friendprofile.save()
            elif result['type'] == "declinefriend":
                user = UserProfile.objects.get(user=request.user)
                removepending(user, result['sender'], request.user)
            elif result['type'] == "removenotification":

                user = UserProfile.objects.get(user=request.user)
                pendingnotifications = json.loads(user.pendingnotifications)
                savednotificaitons = []
                for notification in pendingnotifications:
                    if result['notificationid'] != notification['notificationid']:
                        savednotificaitons.append(notification)
                userupdate = UserProfile.objects.filter(user=request.user)
                userupdate.update(pendingnotifications=json.dumps(savednotificaitons))
    return contextdict

def removepending(user, sender, UserInstance):
    pendingfriendslist = json.loads(user.pendingfriends)
    stillpending = []
    for friend in pendingfriendslist:
        if sender.lower() != friend['username'].lower():
            stillpending.append(friend)
    userupdate = UserProfile.objects.filter(user=UserInstance)
    userupdate.update(pendingfriends=json.dumps(stillpending))