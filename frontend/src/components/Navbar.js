import React from "react";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <NavLink className="navbar-brand" to="/">
          TestMonk
        </NavLink>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <NavLink
                to="/testSuite"
                className={({ isActive }) =>
                  "nav-link " + (isActive ? "active fw-bold text-primary" : "")
                }
              >
                Test Suite
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/testCase"
                className={({ isActive }) =>
                  "nav-link " + (isActive ? "active fw-bold text-primary" : "")
                }
              >
                Test Case
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/testScript"
                className={({ isActive }) =>
                  "nav-link " + (isActive ? "active fw-bold text-primary" : "")
                }
              >
                Test Script
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/scriptModel"
                className={({ isActive }) =>
                  "nav-link " + (isActive ? "active fw-bold text-primary" : "")
                }
              >
                Script Model
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/appModel"
                className={({ isActive }) =>
                  "nav-link " + (isActive ? "active fw-bold text-primary" : "")
                }
              >
                App Model
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/resourceModel"
                className={({ isActive }) =>
                  "nav-link " + (isActive ? "active fw-bold text-primary" : "")
                }
              >
                Resource Model
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/expectedResults"
                className={({ isActive }) =>
                  "nav-link " + (isActive ? "active fw-bold text-primary" : "")
                }
              >
                Expected Results
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
