import React, { RefObject } from "react";
import * as AiIcons from "react-icons/ai";
import { Link } from "react-router-dom";
import { SidebarData } from "./SideBarNavItems";
import { IconContext } from "react-icons";

interface SideBarNavProps {
  sidebar: boolean;
  showSidebar: () => void;
  sidebarRef: RefObject<HTMLElement>;
}

function SideBarNav({ sidebar, showSidebar, sidebarRef }: SideBarNavProps) {
  return (
    <>
      <IconContext.Provider value={{ color: "inherit" }}>
        <nav
          className={sidebar ? "nav-menu active" : "nav-menu"}
          ref={sidebarRef as RefObject<HTMLDivElement>}
        >
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
