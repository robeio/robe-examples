import React from "react";
import ShallowComponent from "robe-react-commons/lib/components/ShallowComponent";
import EventWebSocketStore from "libs/stores/EventWebSocketStore";
import Card from "libs/card/Card";
import AjaxRequest from "robe-react-commons/lib/connections/AjaxRequest";
import Col from "react-bootstrap/lib/Col";
import Badge from "react-bootstrap/lib/Badge";
import Toast from "robe-react-ui/lib/toast/Toast";
import TextInput from "robe-react-ui/lib/inputs/TextInput";
import "./style.css";

export default class Users extends ShallowComponent {

    userGetAll = new AjaxRequest({
        url: "messages/users",
        type: "GET"
    });

    myUserGet = new AjaxRequest({
        url: "authentication/profile",
        type: "GET"
    });

    colorList = [];

    constructor(props) {
        super(props);
        this.state = {
            users: [],
            searchUsers: [],
            myUser: {},
            activeUserId: undefined,
            search: ""
        };
    };

    render():Object {
        return (
            <Card header="Users" style={{width:243,paddingBottom:25}}>
                <TextInput
                    value={this.state.search}
                    name="search"
                    placeholder="Search..."
                    onChange={this.__handleChange}/>
                {this.__renderUserList()}
            </Card>
        );
    }

    __renderUserList() {
        let data = this.state.searchUsers;
        let dataArr = [];
        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            if (item.user.oid == this.state.myUser.oid) {
                continue;
            }
            dataArr.push(
                <Col
                    key={i}
                    className="users"
                    onClick={this.__onClickUser.bind(undefined,item.user)}>
                    <div className="user-active-icon"
                         style={{opacity:this.state.activeUserId==item.user.email?1:0}}>

                    </div>
                    <div
                        className="user-image"
                        style={{background:this.colorList[i]}}>
                        {item.user.name.charAt(0)}
                    </div>
                    <Col style={{float:"left"}}>
                        <h5>
                            <label style={{marginLeft:10,cursor:"pointer"}}>
                                {item.user.name + " " + item.user.surname}
                            </label>
                        </h5>
                    </Col>
                    <Col className="pull-right" style={{marginTop:8}}>
                        <Badge style={{backgroundColor:"#f7881f"}}>
                            {item.count || ""}
                        </Badge>
                    </Col>
                </Col>);
        }
        return dataArr;
    };

    __updatedMessagesByUserId(oid) {
        let request = new AjaxRequest({
            url: "messages/update/users/" + oid,
            type: "POST"
        });

        request.call(undefined, undefined,
            function (res) {
                this.__readAllUser();
            }.bind(this));
    }

    __onClickUser(item) {
        this.setState({activeUserId: item.email, search: ""});
        this.__updatedMessagesByUserId(item.oid);
        window.location.hash = "/chat?user=" + item.email;
    }

    __readAllUser() {
        this.userGetAll.call(undefined, undefined,
            function (res) {
                var state = {users: res, searchUsers: res};

                let hash = window.location.hash.split("?");
                let query = hash[1] ? hash[1].split("=") : ["user", undefined];
                let activeUserId = this.state.activeUserId;
                let userId = query[1];

                if (userId && activeUserId != userId) {
                    let user = this.__findUserByNick(res, userId);
                    if (user) {
                        state["activeUserId"] = userId;
                        this.__updatedMessagesByUserId(user.oid);
                    }
                }
                this.setState(state);
            }.bind(this));
    }


    __handleChange(e) {
        let state = {};
        let value = e.target.parsedValue !== undefined ? e.target.parsedValue : e.target.value;
        state[e.target.name] = value;
        if (!value) {
            state["searchUsers"] = this.state.users;
        }
        else {
            let searchUsers = [];
            let users = this.state.users;
            for (let i in users) {
                let item = users[i].user;
                let name = item.name.toLowerCase();
                let surname = item.surname.toLowerCase();
                if (name.includes(value.toLowerCase()) || surname.includes(value.toLowerCase())) {
                    searchUsers.push(users[i]);
                }
            }
            state["searchUsers"] = searchUsers;

        }
        this.setState(state);
    }

    __findUserByNick(users, ownerNick) {
        for (let index in users) {
            let item = users[index];
            if (item.user.email == ownerNick) {
                return item.user;
            }
        }
        return undefined;
    }

    __randomColor(count) {
        var letters = '34567';
        for (let j = 0; j < count; j++) {
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 5)];
            }
            this.colorList.push(color);
        }
    }

    __incomingMessage(data) {
        let message = data.payload.message;
        let owner = data.payload.owner;
        let receiver = data.receiver;

        let activeUserId = this.state.activeUserId;
        if (activeUserId == owner.email) {
            return;
        }

        let users = this.state.users;
        for (let index in users) {
            let item = users[index];
            if (item.user.oid == message.ownerOid) {
                item.count += 1;
            }
        }
        Toast.success(message.content, owner.name);
        this.setState({users: users});
        this.forceUpdate();
    }


    messagesUniqueRef = new Date().getTime();

    componentDidMount() {

        this.__randomColor(100);
        this.myUserGet.call(undefined, undefined,
            function (res) {
                this.setState({myUser: res});
                this.__readAllUser();
            }.bind(this));


        EventWebSocketStore.register(this.messagesUniqueRef, "MESSAGE", this.__incomingMessage);

    }

    componentWillUnmount() {
        EventWebSocketStore.unRegister(this.messagesUniqueRef);
    };
}
