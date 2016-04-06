from channels import Group
from channels.sessions import channel_session
from .models import RoomInstance
import json
import ast
# Connected to websocket.connect
@channel_session
def ws_add(message):
    # Work out room name from path (ignore slashes) 
    parse = message.content['query_string'].split('=')[1]
    room = parse.split('%3F')[0]
    # Changes all strings from + to space, then removes leading and ending spaces
    # Spaces kept in middle for guests and such
    username = parse.split('user%3D')[1].replace("+", " ").lstrip().rstrip()
    message.channel_session['room'] = room
    message.channel_session['username'] = username
    Group(room).add(message.reply_channel)

    ri = RoomInstance.objects.get(roomname=room)
    if ri.listofusers == None:
        # Make new list
        listofusers = [{"username": username, "online" : "true"}]
        ri = RoomInstance.objects.filter(roomname=room)
        ri.update(listofusers=json.dumps(listofusers))
    else:
        # Grab list and change string into list
        listofusers = json.loads(ri.listofusers)
        inlist = False
        # Check if user dict is in the list
        for user in listofusers:
            if user['username'] == username:
                inlist = True
                break        
        if inlist == False:
            # append new useritem
            useritem = {"username": username, "online" : "true"}
            listofusers.append(useritem)
            # save
            ri = RoomInstance.objects.filter(roomname=room)
            ri.update(listofusers=json.dumps(listofusers))
        else:
            useritem = {"username": username, "online" : "true"}
            # Find the user
            for n,i in enumerate(listofusers):
                # Replace
                if listofusers[n]['username'] == username:
                    listofusers[n] = useritem
                    break
            # save
            ri = RoomInstance.objects.filter(roomname=room)
            ri.update(listofusers=json.dumps(listofusers))

# Connected to websocket.receive
def ws_message(message):
    data =  json.loads(message.content['text'])
    room = data['room']

    if data['typesent'] == "stillexists":
        username = data['username']
        useritem = {"username": username, "online" : "true"}
        # User is still connected in other tab, don't disconnect in DB
        ri = RoomInstance.objects.get(roomname=room)
        listofusers = json.loads(ri.listofusers)
        for n,i in enumerate(listofusers):
            # Replace
            if listofusers[n]['username'] == username:
                listofusers[n] = useritem
                break

        ri = RoomInstance.objects.filter(roomname=room)
        ri.update(listofusers=json.dumps(listofusers))

    Group(room).send(message.content)

# Connected to websocket.disconnect
@channel_session
def ws_disconnect(message):
    room = message.channel_session['room']
    username = message.channel_session['username']
    # Grab the list
    ri = RoomInstance.objects.get(roomname=room)
    listofusers = json.loads(ri.listofusers)
    # Make new user dict
    useritem = {"username": username, "online" : "false"}
    # Find the user
    for n,i in enumerate(listofusers):
        # Replace
        if listofusers[n]['username'] == username:
            listofusers[n] = useritem
            break

    ri = RoomInstance.objects.filter(roomname=room)
    ri.update(listofusers=json.dumps(listofusers))

    # Sends who left
    data = '{"username": "' + username + '","typesent": "userleft"}'
    Group(room).send({"text": data},)

    # Leaves connection
    Group(room).discard(message.reply_channel)