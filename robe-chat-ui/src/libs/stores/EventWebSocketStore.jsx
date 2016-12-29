import WebSocketStore from "libs/stores/WebSocketStore";

class EventWebSocketStore {

    static webSocket:undefined;
    static registeredComponents = [];


    constructor() {
        this.__connect();
    }

    register = (id, type, callback) => {
        EventWebSocketStore.registeredComponents.push({
            "id": id + EventWebSocketStore.registeredComponents.length,
            "type": type,
            "callback": callback
        });
    };
    unRegister = (id) => {
        for (var i = EventWebSocketStore.registeredComponents.length; i--;) {
            if (EventWebSocketStore.registeredComponents[i]["id"] == id) {
                EventWebSocketStore.registeredComponents.splice(i, 1);
            }
        }
    };

    triggerChange = (registeredComponent, event) => {
        try {
            registeredComponent.callback(event);
        } catch (e) {
            console.warn("WebSocket Trigger change error", e);
        }

    };

    __connect = ()=> {
        if (EventWebSocketStore.webSocket == undefined)
            EventWebSocketStore.webSocket = new WebSocketStore({
                url: "ws://127.0.0.1:8082/robe-chat/chat",
                onMessage: this.__incomingMessage,
                onClose: this.__connect,
                onError: this.__connect
            });
    };

    __incomingMessage = (response)=> {
        var event = JSON.parse(response.data);
        for (var i = 0; i < EventWebSocketStore.registeredComponents.length; i++) {
            if (EventWebSocketStore.registeredComponents[i].type === event.type)
                this.triggerChange(EventWebSocketStore.registeredComponents[i], event);
        }


    };
}
module.exports = new EventWebSocketStore();