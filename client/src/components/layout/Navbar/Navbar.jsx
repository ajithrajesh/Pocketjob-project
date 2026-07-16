import { Link } from "react-router-dom";
import { FaBriefcase } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand logo" to="/">
          <FaBriefcase className="logo-icon" />
          <span>pocketJob</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMenu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarMenu">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/jobs">
                Jobs
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/categories">
                Categories
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/about">
                About
              </Link>
            </li>

            {isAuthenticated ? (
              <li className="nav-item ms-lg-2">
                <Link
                  className="btn btn-primary"
                  to="/dashboard"
                >
                  Dashboard
                </Link>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    className="btn btn-outline-primary login-btn"
                    to="/login"
                  >
                    Login
                  </Link>
                </li>

                <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                  <Link
                    className="btn btn-primary register-btn"
                    to="/register"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;