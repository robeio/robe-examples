import React from "react";
import ShallowComponent from "robe-react-commons/lib/components/ShallowComponent";
import Application from "robe-react-commons/lib/application/Application";
import AjaxRequest from "robe-react-commons/lib/connections/AjaxRequest";
import WebSocketStore from "stores/WebSocketStore";
import TextInput from "robe-react-ui/lib/inputs/TextInput";
import FaIcon from "robe-react-ui/lib/faicon/FaIcon";
import InputGroup from "react-bootstrap/lib/InputGroup";
import Button from "react-bootstrap/lib/Button";
import Collapse from "react-bootstrap/lib/Collapse";
import Card from "app/card/Card";
import ReactDOM from "react-dom";
import "./style.css";
import moment from "moment";

export default class Chat extends ShallowComponent {

    constructor(props) {
        super(props);
        this.state = {
            activeUser: {},
            myUser: undefined,
            messages: [],
            loading: undefined,
            message: ""
        };
        this.componentWillReceiveProps(props);
    }

    _limit = 20;

    render():Object {
        return (
            <Card >
                <div
                    ref="scrollbar"
                    id="scrollbar"
                    className="scrollbar"
                    onScroll={this.__onScroll}>
                    <div className="show-more-loading"
                         style={{height:this.state.loading?25:0,opacity:this.state.loading?0.7:0}}>
                        <img src="loading.gif" height="14" width="50"/>
                    </div>
                    {this.__renderMessages(this.state.messages)}
                </div>
                <TextInput
                    value={this.state.message}
                    style={{borderTopLeftRadius:0,borderTopRightRadius:0,background:"#fafafa"}}
                    name="message"
                    placeholder={Application.i18n("chat").placeHolder}
                    onKeyPress={this.__onKeyPress}
                    inputGroupRight={
                        <InputGroup.Button style={{borderTopRightRadius:0}}>
                             <Button style={{borderTopRightRadius:0}} onClick={this.__sendMessage}>
                                 <FaIcon
                                    code="fa-paper-plane"
                                    style={{color:"#f7881f"}}/>
                             </Button>
                        </InputGroup.Button>}
                    onChange={this.__handleChange}/>
            </Card>
        );
    }

    __renderMessages(messages) {
        var ownerUser = this.state.myUser;
        var messageArr = [];

        if (!ownerUser) {
            return messageArr;
        }
        for (let i = messages.length - 1; i >= 0; i--) {
            let message = messages[i];
            if (!message || !message["creationDate"])
                continue;
            var float = message["receiverOid"] == ownerUser["oid"];
            var mergeMessages = this.__mergeMessages(message, messages, i);

            messageArr.push(
                <div key={i} className={float ? "left-message" : "right-message"}>
                    <div>
                        {mergeMessages["messages"]}
                    </div>
                </div>);
            i -= mergeMessages["count"];
        }
        return messageArr;
    };

    __mergeMessages(key, data, index) {
        var arr = [];
        var count = -1;
        for (let i = index; i >= 0; i--) {
            var item = data[i];
            if (key["receiverOid"] != item["receiverOid"] || key["ownerOid"] != item["ownerOid"]) {
                break;
            }
            arr.push(
                <div key={i} style={{padding:"5px 0px"}}>
                    <span
                        id={item.oid}
                        style={{cursor:"pointer"}}
                        onClick={ (e)=>{ this.setState({ openDateId:e.target.id });}}>{item["content"]}</span>
                    <Collapse in={this.state.openDateId==item["oid"]}>
                        <div style={{
                            fontSize:"smaller",
                            paddingTop:5,
                            transition:"height .5s",
                            color:"#f7881f",
                            whiteSpace: "nowrap"}}>
                            {moment(new Date(item["creationDate"])).format("HH:mm DD.MM.YYYY")}
                        </div>
                    </Collapse>
                </div>);
            count += 1;

        }
        return {"count": count, "messages": arr};

    };

    __sendMessage() {
        let message = this.state.message;

        if (!message)
            return;

        let request = new AjaxRequest({
            url: "messages",
            type: "POST"
        });

        let data = {
            ownerOid: this.state.myUser.oid,
            receiverOid: this.state.activeUser.oid,
            content: message
        };

        request.call(data, undefined,
            function (res) {
                this._limit += 1;
                var messages = this.state.messages || [];
                messages.unshift(res);
                this.setState({
                    messages: messages,
                    message: "",
                    loading: undefined,
                    openDateId: undefined
                });
                this.__changeScroll(this.refs.scrollbar);
            }.bind(this));

    }

    __readMessagesByUserId(oid, scrollHeight) {
        let request = new AjaxRequest({
            url: "messages/users/" + oid + "?_limit=" + this._limit,
            type: "GET"
        });

        request.call(undefined, undefined,
            function (res) {
                this.setState({messages: res, loading: false});
                this.__changeScroll(this.refs.scrollbar, scrollHeight);
            }.bind(this));
    }

    __getUserById(nick) {
        let request = new AjaxRequest({
            url: "users?_filter=email=" + nick,
            type: "GET"
        });

        request.call(undefined, undefined,
            function (res) {
                if (res.length <= 0) {
                    window.location.hash = "#/"
                } else {
                    this.setState({activeUser: res[0]});
                    this.__readMessagesByUserId(res[0].oid);
                }
            }.bind(this),
            function (res) {
                window.location.hash = "#/"
            }.bind(this));
    }

    __updatedMessagesByUserId(oid) {
        let request = new AjaxRequest({
            url: "messages/update/users/" + oid,
            type: "POST"
        });

        request.call(undefined, undefined,
            function (res) {
                // this.__readAllUser();
            }.bind(this));
    }

    __handleChange(e) {
        let state = {};
        let value = e.target.parsedValue !== undefined ? e.target.parsedValue : e.target.value;
        state[e.target.name] = value;
        this.setState(state);
    }

    __onKeyPress(e) {
        if (e.key == "Enter")
            this.__sendMessage();
    }

    __changeScroll(ref, height) {
        var node = ReactDOM.findDOMNode(ref);
        node.scrollTop = height ? node.scrollHeight - height : node.scrollHeight;
    }

    __onScroll(e) {
        var node = ReactDOM.findDOMNode(e.target);
        let oldHeight = node.scrollHeight;
        if (node.scrollTop == 0 && this.state.loading == false) {

            this._limit += 20;
            this.setState({loading: true});
            this.__readMessagesByUserId(this.state.activeUser.oid, oldHeight);

        } else if (this.state.loading == undefined) {
            this.state.loading = false;
        }
    }

    __incomingMessage(data) {
        let message = data.payload.message;
        let owner = data.payload.owner;
        let receiver = data.receiver;

        let activeUser = this.state.activeUser;

        if (activeUser.oid == message.ownerOid) {
            var messages = this.state.messages || [];
            messages.unshift(message);
            this.setState({
                messages: messages,
                openDateId: undefined
            });
            this._limit += 1;
            this.__updatedMessagesByUserId(activeUser.oid);
        }

        this.forceUpdate();
        this.__changeScroll(this.refs.scrollbar);

    }

    messagesUniqueRef = new Date().getTime();

    componentDidMount() {
        let request = new AjaxRequest({
            url: "authentication/profile",
            type: "GET"
        });

        request.call(undefined, undefined,
            function (res) {
                this.setState({myUser: res});
            }.bind(this),
            function (res) {
                window.location.hash = "#/"
            }.bind(this));

        WebSocketStore.register(this.messagesUniqueRef, "MESSAGE", this.__incomingMessage);
    }

    componentWillUnmount() {
        WebSocketStore.unRegister(this.messagesUniqueRef);
    };

    componentWillReceiveProps(nextProps) {
        let userId = nextProps.location.query.user;
        if (userId && this.state.activeUser.email != userId) {
            this.__getUserById(userId);
        }
        else {
            window.location.hash = "#/";
        }
    }
}
