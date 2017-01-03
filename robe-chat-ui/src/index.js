import React from "react";
import {render} from "react-dom";
import Switch from "app/Switch";
import Application from "robe-react-commons/lib/application/Application";

const app = document.getElementById("app");

Application.setBaseUrlPath("http://127.0.0.1:8082/robe-chat");

render((<Switch />), app);
