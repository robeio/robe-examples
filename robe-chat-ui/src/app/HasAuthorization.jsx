import React from "react";
import ShallowComponent from "robe-react-commons/lib/components/ShallowComponent";
import Router from "react-router/lib/Router";
import Route from "react-router/lib/Route";
import IndexRoute from "react-router/lib/IndexRoute";
import Workspace from "app/workspace/Workspace";
import Welcome from "app/welcome/Welcome";
import Chat from "app/chat/Chat";
import useRouterHistory from "react-router/lib/useRouterHistory";
import createHashHistory from "history/lib/createHashHistory";
const history = useRouterHistory(createHashHistory)({queryKey: true});

export default class HasAuthorization extends ShallowComponent {

    constructor(props:Object) {
        super(props);
    }

    render():Object {

        return (
            <Workspace>
                <Router
                    key="root"
                    history={history}
                    onUpdate={HasAuthorization.scrollTop}>
                    <Route path="/">
                        <IndexRoute component={Welcome}/>
                        <Route path="chat" component={Chat}/>
                    </Route>
                </Router>
            </Workspace>
        );
    }

    static scrollTop() {
        window.scrollTo(0, 0);
    }

}
