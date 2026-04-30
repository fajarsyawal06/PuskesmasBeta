import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function UserLayout() {
    return (
        <div>
            <Navbar />
            <div className="pt-20 md:pt-30">
                <Outlet />
            </div>
        </div>
    )
}