import Maps from "robe-react-commons/lib/utils/Maps";
import jajax from "robe-ajax";

class WebSocketStore {
    webSocket = undefined;
    fallback = undefined;
    props = {
        contentType: "application/json",
        logLevel: "debug",
        transport: "websocket",
        trackMessageLength: true,
        reconnectInterval: 5000,
        fallbackTransport: "long-polling",
        onOpen: function (response) {
            console.log("WebSocket Connected ", response.currentTarget.url);
        },

        onReopen: function (response) {
            console.log("WebSocket ReOpened", response.currentTarget.url);
        },

        onMessage: function (response) {
            console.log("WebSocket Message", response.currentTarget.url);
        },
        onClose: function (response) {
            console.log("WebSocket Closed", response.currentTarget.url);

        },
        onReconnect: function (request, response) {
            console.log("WebSocket ReConnect", response.currentTarget.url);
        },
        onError: function (response) {
            if (this.fallback == undefined) {
                if (!this.isConnected()) {
                    if (this.props.fallback == undefined)
                        console.error("WebSocket Error. No fallback given.", response.currentTarget.url, response);
                    else {
                        console.warn("WebSocket Error. Using fallback.", response.currentTarget.url, response);
                        this.__createFallBack();
                    }
                }
            }
        }.bind(this)
    };

    constructor(props) {
        if (props == undefined)
            this.requiredControl("'props' must be given.", props);

        var url = props.url;
        if (props.url == undefined)
            this.requiredControl("'url' must be defined at 'props'.", props.url);

        this.props = Maps.mergeDeep(props, this.props);

        if (this.isConnected()) {
            return;
        }
        // Create a websocket
        this.__createWebSocket();
        if (props.fallback != undefined) {
            this.requiredControl("'url' must be defined at 'props.fallback'.", props.fallback.url);
            this.requiredControl("'method' must be defined at 'props.fallback'.", props.fallback.method);
        }

        if (!this.isConnected()) {
            if (props.fallback == undefined)
                console.error("Web socket error. No fallback given.");
            else {
                console.warn("Web socket error. Using fallback.");
                this.__createFallBack();
            }
        }
    }


    send = (packet)=> {
        this.webSocket.send(JSON.stringify(packet));
    };

    requiredControl = (message, obj)=> {
        if (obj === undefined) {
            console.error(message);
            throw message;
        }
    };

    close = ()=> {
        this.webSocket.close();
    };

    isConnected = ()=> {
        if (this.webSocket == undefined)
            return false;
        return (this.webSocket.readyState === WebSocket.CONNECTING || this.webSocket.readyState === WebSocket.OPEN );
    };

    __createWebSocket = ()=> {
        try {
            this.webSocket = new WebSocket(this.props.url);
        } catch (error) {
            console.error(error);
            this.webSocket = undefined;
        }
        if (this.isConnected()) {
            this.webSocket.onopen = this.props.onOpen;
            this.webSocket.onmessage = this.props.onMessage;
            this.webSocket.onclose = this.props.onClose;
            this.webSocket.onerror = this.props.onError;
        }
    };

    __createFallBack = ()=> {
        var path = this.props.fallback.url;
        this.fallback = {
            "type": this.props.fallback.method,
            "dataType": "json",
            "error": function (xhr, errorThrown) {
                this.props.onError(xhr);
            }.bind(this),
            beforeSend: function (xhr) {
                xhr.path = path;
            },
            "url": path,
            "contentType": "application/json; charset=utf-8",
            "xhrFields": {
                "withCredentials": true
            },
            crossDomain: true
        };

        this.fallback["success"] = this.props.onMessage;

        jajax.ajax(this.fallback);
    }
}

module.exports = WebSocketStore;