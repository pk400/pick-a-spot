from app.consumers import ws_add, ws_message, ws_disconnect

channel_routing = {
    "websocket.connect": ws_add,
    "websocket.receive": ws_message,
    "websocket.disconnect": ws_disconnect,
}