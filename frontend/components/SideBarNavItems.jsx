import React from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";
import { FaRegListAlt } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";

export const SidebarData = [
  {
    title: "Create New",
    path: "/analysis?new=true",
    icon: <FaPlus />,
    cName: "nav-text",
  },
  {
    title: "Your Analyses",
    path: "/analyses",
    icon: <FaRegListAlt />,
    cName: "nav-text",
  },
  // {
  //   title: "Products",
  //   path: "/products",
  //   icon: <FaIcons.FaCartPlus />,
  //   cName: "nav-text",
  // },
  // {
  //   title: "Team",
  //   path: "/team",
  //   icon: <IoIcons.IoMdPeople />,
  //   cName: "nav-text",
  // },
  // {
  //   title: "Messages",
  //   path: "/messages",
  //   icon: <FaIcons.FaEnvelopeOpenText />,
  //   cName: "nav-text",
  // },
  // {
  //   title: "Support",
  //   path: "/support",
  //   icon: <IoIcons.IoMdHelpCircle />,
  //   cName: "nav-text",
  // },
];
