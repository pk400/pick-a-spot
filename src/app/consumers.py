from channels import Group
from channels.sessions import channel_session

# Connected to websocket.connect
@channel_session
def ws_add(message):
    # Work out room name from path (ignore slashes) 
    room = message.content['query_string'].split('=')[1]
    room = room.split('%3F%3D')[0]
    # Save room in session and add us to the group
    message.channel_session['room'] = room
    Group("room-" + room).add(message.reply_channel)   
 

# Connected to websocket.receive
@channel_session
def ws_message(message):
    Group("room-" + message.channel_session['room']).send(message.content)

# Connected to websocket.disconnect
@channel_session
def ws_disconnect(message):
    Group("room-" + message.channel_session['room']).discard(message.reply_channel)