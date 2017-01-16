import React from "react";
import {ShallowComponent, AjaxRequest} from "robe-react-commons";
import HasAuthorization from "./HasAuthorization";
import NoAuthorization from "./NoAuthorization";
import Toast from "robe-react-ui/lib/toast/Toast";
import cookie from "react-cookie";
import ajax from "robe-ajax";

export default class Switch extends ShallowComponent {

    constructor(props:Object) {
        super(props);

        let username = cookie.load("username");
        let exit = this.__onExit;
        ajax.ajaxSetup({
            complete: function (jqXHR, textStatus, errorThrown) {
                switch (jqXHR.status) {
                    case 401:
                        exit();
                        break;
                    case 403:
                        Toast.error("Yeki Hatası !");
                        break;
                    case 404 :
                        // Toast.error("Sayfa bulunamadı ! ");
                        break;
                        break;
                    case 422 :
                        Toast.error("Verilerinizi kontrol ediniz.");
                        break;
                    case 500:
                        Toast.error("Sistem Hatası");
                        break;

                }
            }
        });

        this.state = {
            hasAuth: (username != undefined)
        };
    }

    render():Object {
        let content;
        if (!this.state.hasAuth) {
            content = <NoAuthorization />;
        } else {
            content = <HasAuthorization/>;
        }

        return (
            <div>
                {content}
            </div>
        );

    }


    __onExit() {
        cookie.remove('domain');
        cookie.remove('username');
        location.reload();
    };
}
