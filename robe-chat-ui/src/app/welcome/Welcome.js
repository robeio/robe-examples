import React from "react";
import ShallowComponent from "robe-react-commons/lib/components/ShallowComponent";
import Card from "libs/card/Card";

export default class Welcome extends ShallowComponent {
    render():Object {
        return (
            < Card
        header = "Robe Chat Sample" >
            < p > Welcome
        to
        chat. < / p >
        < / Card >
    )
        ;
    }
}
