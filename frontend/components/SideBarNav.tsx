import React from "react";
import * as AiIcons from "react-icons/ai";
import { Link } from "react-router-dom";
import { SidebarData } from "./SideBarNavItems";
import { IconContext } from "react-icons";

interface SideBarNavProps {
  sidebar: boolean;
  showSidebar: () => void;
}

function SideBarNav({ sidebar, showSidebar }: SideBarNavProps) {
  return (
    <>
      <IconContext.Provider value={{ color: "undefined" }}>
        <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
          <ul className="nav-menu-items" onClick={showSidebar}>
            <li className="navbar-toggle">
              <Link to="#" className="menu-bars">
                <AiIcons.AiOutlineClose />
              </Link>
            </li>
            {SidebarData.map((item, index) => {
              return (
                <li key={index} className={item.cName}>
                  <Link to={item.path}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </IconContext.Provider>
    </>
  );
}

export default SideBarNav;
