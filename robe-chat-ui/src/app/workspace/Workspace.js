import React from "react";
import ShallowComponent from "robe-react-commons/lib/components/ShallowComponent";
import Header from "app/header/Header";
import Users from "app/users/Users";
import Col from "react-bootstrap/lib/Col";

export default class Workspace extends ShallowComponent {

    constructor(props:Object) {
        super(props);
        this.state = {
            toggled: false
        };
    }


    render():Object {
        let toggled = this.state.toggled == false ? 0 : 250;
        return (
            <div>
                <Header
                    matches={this.state.matches}
                    toggled={this.state.toggled}
                    onToggle={this.__changeMenu}/>
                <Col
                    id="sideMenu"
                    style={{width:toggled}}
                    className="side-menu">
                    <Users/>
                </Col>
                <Col
                    id="content"
                    className="content"
                    style={{ height:window.innerHeight-80,marginLeft:toggled}}
                    onClick={this.__closeMenu}>
                    {this.props.children}
                </Col>
            </div>
        );
    }

    __closeMenu = ()=> {
        if (this.state.matches == true) {
            this.setState({
                toggled: false
            });
        }
    };
    __changeMenu = ()=> {
        if (this.state.matches == true) {
            this.setState({
                toggled: !this.state.toggled
            });
        }
    };

    __mediaQueryChanged = (mql)=> {
        this.setState({
            toggled: !mql.matches,
            matches: mql.matches
        });

    };

    componentWillMount() {
        const mql = window.matchMedia("screen and (max-width: 768px)");
        mql.addListener(this.__mediaQueryChanged);
        this.setState({matches: mql.matches, toggled: !mql.matches});

    }

    componentWillUnmount() {
        this.state.mql.removeListener(this.__mediaQueryChanged);
    }
}
