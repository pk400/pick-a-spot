from channels import Channel, Group
from channels.sessions import channel_session
from channels.auth import http_session_user, channel_session_user, transfer_user

# Connected to websocket.connect
@http_session_user
@channel_session_user
def ws_add(message):
    # Copy user from HTTP to channel session
    transfer_user(message.http_session, message.channel_session)
    # Add them to the right group
    Group("chat-%s" % "RandomSeedWIP").add(message.reply_channel)

# Connected to websocket.receive
@channel_session_user
def ws_message(message):
    Group("chat-%s" % "RandomSeedWIP").send(message.content)

# Connected to websocket.disconnect
@channel_session_user
def ws_disconnect(message):
    Group("chat-%s" % "RandomSeedWIP").discard(message.reply_channel)