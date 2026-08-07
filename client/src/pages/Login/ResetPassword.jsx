import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaBriefcase } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { resetPassword } from "../../services/authService";
import "./Login.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      setErrorOccurred(false);
      const data = await resetPassword(token, formData);

      toast.success("Password reset successful!");

      // Log in user immediately
      loginWithToken(data);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Password reset failed"
      );
      setErrorOccurred(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="login-page">
        <div className="container">
          <div className="row login-wrapper">
            
            <div className="col-lg-6 login-left">
              <div>
                <FaBriefcase className="login-logo" />
                <h1>pocketJobs</h1>
                <h2>
                  Find Verified Part-Time Jobs Near You
                </h2>
                <p>
                  Catering • Warehouse • Driver • Delivery •
                  Housekeeping • Event Staff
                </p>
              </div>
            </div>

            <div className="col-lg-6 login-right">
              <div className="login-card">
                <h2>Reset Password</h2>
                <p>
                  Enter and confirm your new password below.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label>New Password</label>
                    <div className="password-box">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="form-control"
                        placeholder="Enter new password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label>Confirm Password</label>
                    <div className="password-box">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        className="form-control"
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary w-100 mt-4"
                    disabled={loading}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>

                {errorOccurred && (
                  <div className="register-link text-danger mt-3">
                    Link expired or invalid?{" "}
                    <Link to="/forgot-password" style={{ color: "#2563eb", fontWeight: "700" }}>
                      Request a new link
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
      <ToastContainer position="top-right" />
    </>
  );
}

export default ResetPassword;
