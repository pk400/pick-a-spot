from app.consumers import ws_message

channel_routing = {
    "websocket.receive": ws_message,
}