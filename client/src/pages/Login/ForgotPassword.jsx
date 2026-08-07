import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBriefcase } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { forgotPassword } from "../../services/authService";
import "./Login.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const data = await forgotPassword(email);
      setMessage(data.message);
      setSubmitted(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send reset link"
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
                <h2>Forgot Password?</h2>
                
                {submitted ? (
                  <div className="text-center mt-3">
                    <p className="mb-4 text-start" style={{ color: "#4b5563", lineHeight: "1.6", fontSize: "16px" }}>
                      {message}
                    </p>
                    <Link to="/login" className="btn btn-primary w-100 d-flex align-items-center justify-content-center">
                      Back to Login
                    </Link>
                  </div>
                ) : (
                  <>
                    <p>
                      Enter your email address and we'll send you a link to reset your password.
                    </p>

                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label>Email</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Enter email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <button
                        className="btn btn-primary w-100 mt-4"
                        disabled={loading}
                      >
                        {loading ? "Sending..." : "Send Reset Link"}
                      </button>
                    </form>

                    <div className="register-link">
                      Remember your password?
                      <Link to="/login">Login</Link>
                    </div>
                  </>
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

export default ForgotPassword;
