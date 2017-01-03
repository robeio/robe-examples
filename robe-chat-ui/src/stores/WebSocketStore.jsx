import BaseWebSocketStore from "robe-react-commons/lib/websocket/WebSocketStore";

class WebSocketStore extends BaseWebSocketStore {
    constructor() {
        super({
            url: "ws://127.0.0.1:8082/robe-chat/socket"
        });
    }

}
export default new WebSocketStore();