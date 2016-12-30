import React from "react";
import ShallowComponent from "robe-react-commons/lib/components/ShallowComponent";
import Card from "libs/card/Card";

export default class Welcome extends ShallowComponent {
    render():Object {
        return (
            <Card header="Robe Chat Sample">
                <p>Welcome to the Robe-Chat.</p>
                <br/>
                <h4>For More...</h4>
                <p><a href="https://github.com/robeio">Robe</a></p>
                <p><a href="http://robeio.github.io/robe-react-ui/">Robe React Ui</a></p>
            </Card>
        );
    }
}
