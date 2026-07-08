import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaBriefcase } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await login(formData);

      toast.success("Login Successful");

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="login-page">

        <div className="container">

          <div className="row login-wrapper">

            {/* LEFT */}

            <div className="col-lg-6 login-left">

              <div>

                <FaBriefcase className="login-logo" />

                <h1>WorkConnect</h1>

                <h2>
                  Find Verified Part-Time Jobs Near You
                </h2>

                <p>
                  Catering • Warehouse • Driver • Delivery •
                  Housekeeping • Event Staff
                </p>

              </div>

            </div>

            {/* RIGHT */}

            <div className="col-lg-6 login-right">

              <div className="login-card">

                <h2>Welcome Back 👋</h2>

                <p>
                  Login to continue your journey.
                </p>

                <form onSubmit={handleSubmit}>

                  <div className="mb-3">

                    <label>Email</label>

                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="mb-3">

                    <label>Password</label>

                    <div className="password-box">

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="password"
                        className="form-control"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={handleChange}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                      >
                        {showPassword ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}
                      </button>

                    </div>

                  </div>

                  <div className="login-options">

                    <label>

                      <input type="checkbox" />

                      Remember Me

                    </label>

                    <Link to="/forgot-password">
                      Forgot Password?
                    </Link>

                  </div>

                  <button
                    className="btn btn-primary w-100 mt-4"
                    disabled={loading}
                  >
                    {loading
                      ? "Logging In..."
                      : "Login"}
                  </button>

                </form>

                <div className="register-link">

                  Don't have an account?

                  <Link to="/register">
                    Register
                  </Link>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      <ToastContainer position="top-right" />
    </>
  );
}

export default Login;