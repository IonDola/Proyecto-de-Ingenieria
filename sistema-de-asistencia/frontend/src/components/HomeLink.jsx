import { Link } from "react-router-dom";

import Tool from "./PageTool";

import "../styles/register-style.css";

import HomeIcon from "../assets/icons/home.svg"

export default function HomeLink() {
    return (
        <Tool key={"HomeTool"}>
            <Link to={"/home"}>
                <img src={HomeIcon} alt="Volver a menu Home" title="Volver a menu Home" className="w-icon" />
            </Link>
        </Tool>

    );
}