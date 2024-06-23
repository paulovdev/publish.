import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import { RiPencilFill } from "react-icons/ri";

import { IoMdCube } from "react-icons/io";
import { Tooltip } from "react-tooltip";
import "./SideBar.scss";

const SideBar = () => {
  const location = useLocation();
  const [isInFeed, setIsInFeed] = useState(false);

  useEffect(() => {
    setIsInFeed(location.pathname.startsWith("/feed"));
  }, [location]);

  return (
    <aside id="sidebar">
      <ul>
        <li data-tooltip-id="my-tooltip" data-tooltip-content="Página Inicial">
          <NavLink
            to="/"
            className={isInFeed ? "active side-container" : "side-container"}
          >
            <div className="side-icon">
              <GoHomeFill size={22} />
            </div>
          </NavLink>
        </li>
        <li data-tooltip-id="my-tooltip" data-tooltip-content="Publicar">
          <NavLink
            to="/create-post"
            className={({ isActive }) =>
              isActive ? "active side-container" : "side-container"
            }
          >
            <div className="side-icon">
              <RiPencilFill size={22} />
            </div>
          </NavLink>
        </li>
        <li data-tooltip-id="my-tooltip" data-tooltip-content="Dashboard">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "active side-container" : "side-container"
            }
          >
            <div className="side-icon">
              <IoMdCube size={22} />
            </div>
          </NavLink>
        </li>
      </ul>
      <Tooltip id="my-tooltip" />
    </aside>
  );
};

export default SideBar;
