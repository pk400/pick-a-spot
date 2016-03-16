from channels import Group
from channels.sessions import channel_session

# Connected to websocket.connect
@channel_session
def ws_add(message):
    # Work out room name from path (ignore slashes)
    room = "chat-%s" % "RandomSeedWIP"
    # Save room in session and add us to the group
    message.channel_session['room'] = room
    Group(room).add(message.reply_channel)    

# Connected to websocket.receive
@channel_session
def ws_message(message):
    Group("chat-%s" % "RandomSeedWIP").send(message.content)

# Connected to websocket.disconnect
@channel_session
def ws_disconnect(message):
    Group("chat-%s" % "RandomSeedWIP").discard(message.reply_channel)