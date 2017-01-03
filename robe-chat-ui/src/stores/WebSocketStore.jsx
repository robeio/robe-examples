import WebSocket from "robe-react-commons/lib/websocket/WebSocketStore";

class WebSocketStore extends WebSocket {
    constructor() {
        super({
            url: "ws://192.168.1.72:8082/robe-chat/socket"
        });
    }

}
export default new WebSocketStore();