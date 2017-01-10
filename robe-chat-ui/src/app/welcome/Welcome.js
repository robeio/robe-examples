import React from "react";
import ShallowComponent from "robe-react-commons/lib/components/ShallowComponent";
import Application from "robe-react-commons/lib/application/Application";
import Card from "app/card/Card";

export default class Welcome extends ShallowComponent {
    render():Object {
        return (
            <Card header={Application.i18n("welcome").header}>
                <p>{Application.i18n("welcome").description}</p>
                <br/>
            </Card>
        );
    }
}
