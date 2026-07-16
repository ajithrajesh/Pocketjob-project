import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const categoriesList = [
    "Catering",
    "Warehouse",
    "Driver",
    "Delivery",
    "Housekeeping",
    "Event Staff",
    "Valet Parking",
  ];

  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(""); // 'user' (seeker) or 'company' (provider)
  const [currentStep, setCurrentStep] = useState(1); // 1, 2, or 3 for seeker

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
    dob: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
    categories: [],
    // Company specific
    companyName: "",
    organisationId: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleCategory = (category) => {
    if (formData.categories.includes(category)) {
      setFormData({
        ...formData,
        categories: formData.categories.filter((c) => c !== category),
      });
    } else {
      setFormData({
        ...formData,
        categories: [...formData.categories, category],
      });
    }
  };

  const validateStep = (step) => {
    const err = {};

    if (step === 1) {
      if (!formData.fullName.trim()) err.fullName = "Full Name is required";
      if (!formData.email.trim()) {
        err.email = "Email is required";
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
        err.email = "Invalid email";
      }
      if (!/^\d{10}$/.test(formData.phone)) err.phone = "Phone must be 10 digits";
      
      const pass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
      if (!formData.password) {
        err.password = "Password is required";
      } else if (!pass.test(formData.password)) {
        err.password = "Min 8 chars with uppercase, lowercase, number & special character";
      }
      if (formData.password !== formData.confirmPassword) {
        err.confirmPassword = "Passwords do not match";
      }
      if (!formData.gender) err.gender = "Select gender";
      if (!formData.dob) err.dob = "Date of Birth required";
    }

    if (step === 2) {
      if (!formData.state.trim()) err.state = "State is required";
      if (!formData.district.trim()) err.district = "District is required";
      if (!formData.city.trim()) err.city = "City is required";
      if (!/^\d{6}$/.test(formData.pincode)) err.pincode = "Pincode must be 6 digits";
    }

    if (step === 3) {
      if (formData.categories.length === 0) {
        err.categories = "Select at least one preferred category";
      }
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const validateCompany = () => {
    const err = {};
    if (!formData.fullName.trim()) err.fullName = "Contact Name is required";
    if (!formData.companyName.trim()) err.companyName = "Organisation Name is required";
    if (!formData.organisationId.trim()) err.organisationId = "Organisation ID is required";
    if (!formData.email.trim()) {
      err.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      err.email = "Invalid email";
    }
    if (!/^\d{10}$/.test(formData.phone)) err.phone = "Phone must be 10 digits";

    const pass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
    if (!formData.password) {
      err.password = "Password is required";
    } else if (!pass.test(formData.password)) {
      err.password = "Min 8 chars with uppercase, lowercase, number & special character";
    }
    if (formData.password !== formData.confirmPassword) {
      err.confirmPassword = "Passwords do not match";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (role === "user") {
      if (!validateStep(3)) return;
    } else if (role === "company") {
      if (!validateCompany()) return;
    } else {
      toast.error("Please select a registration role");
      return;
    }

    try {
      setLoading(true);
      await register({
        ...formData,
        role,
      });
      toast.success("Registration Successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  // Render role selection screen
  if (!role) {
    return (
      <div className="container py-5">
        <div className="card shadow border-0 p-5 mx-auto" style={{ maxWidth: "650px" }}>
          <h2 className="mb-2 text-center fw-bold text-dark">Join pocketJob</h2>
          <p className="text-muted text-center mb-5">Select how you want to use pocketJob to get started</p>
          
          <div className="row g-4">
            <div className="col-md-6">
              <div 
                className="card h-100 p-4 border-2 role-card text-center cursor-pointer"
                onClick={() => setRole("user")}
                style={{ cursor: "pointer", transition: "all 0.2s" }}
              >
                <div className="fs-1 mb-3">👋</div>
                <h4 className="fw-bold">Job Seeker</h4>
                <p className="text-muted small">Find verified part-time jobs nearby, search by location, and get smart recommendations.</p>
              </div>
            </div>
            <div className="col-md-6">
              <div 
                className="card h-100 p-4 border-2 role-card text-center cursor-pointer"
                onClick={() => setRole("company")}
                style={{ cursor: "pointer", transition: "all 0.2s" }}
              >
                <div className="fs-1 mb-3">💼</div>
                <h4 className="fw-bold">Job Provider</h4>
                <p className="text-muted small">Post jobs, find quality candidates, and start with a 1-month free trial subscription.</p>
              </div>
            </div>
          </div>
          
          <p className="text-center mt-5 mb-0 text-muted">
            Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Login</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="card shadow border-0 p-4 mx-auto" style={{ maxWidth: "700px" }}>
        
        {/* Header */}
        <div className="d-flex align-items-center mb-4">
          <button 
            type="button" 
            className="btn btn-link text-decoration-none p-0 me-3 text-dark fs-5"
            onClick={() => {
              if (role === "user" && currentStep > 1) {
                handleBack();
              } else {
                setRole("");
                setCurrentStep(1);
              }
            }}
          >
            ← Back
          </button>
          <h3 className="mb-0 fw-bold">
            {role === "user" ? "Job Seeker Registration" : "Job Provider Registration"}
          </h3>
        </div>

        {/* Step Indicators for Job Seeker */}
        {role === "user" && (
          <div className="step-indicators mb-4 d-flex justify-content-between">
            <div className={`step-item flex-grow-1 text-center pb-2 border-bottom ${currentStep >= 1 ? "border-primary text-primary fw-bold" : "border-light text-muted"}`}>
              1. Personal Details
            </div>
            <div className={`step-item flex-grow-1 text-center pb-2 border-bottom ${currentStep >= 2 ? "border-primary text-primary fw-bold" : "border-light text-muted"}`}>
              2. Location
            </div>
            <div className={`step-item flex-grow-1 text-center pb-2 border-bottom ${currentStep >= 3 ? "border-primary text-primary fw-bold" : "border-light text-muted"}`}>
              3. Job Preferences
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* ==================== ROLE: USER (JOB SEEKER) ==================== */}
          {role === "user" && (
            <>
              {/* Step 1: Personal Details */}
              {currentStep === 1 && (
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                    />
                    {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit number"
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Password"
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Gender</label>
                    <select
                      className={`form-select ${errors.gender ? "is-invalid" : ""}`}
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className={`form-control ${errors.dob ? "is-invalid" : ""}`}
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                    />
                    {errors.dob && <div className="invalid-feedback">{errors.dob}</div>}
                  </div>

                  <div className="col-12 mt-3">
                    <button type="button" className="btn btn-primary w-100 py-2 fw-semibold" onClick={handleNext}>
                      Next: Address Details
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Location */}
              {currentStep === 2 && (
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className={`form-control ${errors.state ? "is-invalid" : ""}`}
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                    />
                    {errors.state && <div className="invalid-feedback">{errors.state}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">District</label>
                    <input
                      type="text"
                      className={`form-control ${errors.district ? "is-invalid" : ""}`}
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      placeholder="District"
                    />
                    {errors.district && <div className="invalid-feedback">{errors.district}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className={`form-control ${errors.city ? "is-invalid" : ""}`}
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                    />
                    {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Pincode</label>
                    <input
                      type="text"
                      className={`form-control ${errors.pincode ? "is-invalid" : ""}`}
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="6-digit pincode"
                    />
                    {errors.pincode && <div className="invalid-feedback">{errors.pincode}</div>}
                  </div>

                  <div className="col-6 mt-3">
                    <button type="button" className="btn btn-outline-secondary w-100 py-2 fw-semibold" onClick={handleBack}>
                      Previous
                    </button>
                  </div>
                  <div className="col-6 mt-3">
                    <button type="button" className="btn btn-primary w-100 py-2 fw-semibold" onClick={handleNext}>
                      Next: Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Preferred Categories */}
              {currentStep === 3 && (
                <div className="row">
                  <div className="col-12 mb-4">
                    <label className="form-label fw-bold d-block mb-3">Select Job Categories You Are Interested In:</label>
                    <div className="row g-3">
                      {categoriesList.map((cat) => {
                        const isChecked = formData.categories.includes(cat);
                        return (
                          <div className="col-md-6" key={cat}>
                            <div 
                              className={`card p-3 border-2 category-select-card cursor-pointer h-100 ${isChecked ? "border-primary bg-light" : "border-light"}`}
                              onClick={() => handleCategory(cat)}
                              style={{ cursor: "pointer" }}
                            >
                              <div className="form-check m-0 pointer-events-none">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={isChecked}
                                  onChange={() => {}} // Controlled by card click
                                />
                                <label className="form-check-label fw-semibold ms-2" style={{ cursor: "pointer" }}>{cat}</label>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {errors.categories && <div className="text-danger mt-2 small">{errors.categories}</div>}
                  </div>

                  <div className="col-6 mt-3">
                    <button type="button" className="btn btn-outline-secondary w-100 py-2 fw-semibold" onClick={handleBack}>
                      Previous
                    </button>
                  </div>
                  <div className="col-6 mt-3">
                    <button type="submit" className="btn btn-success w-100 py-2 fw-semibold" disabled={loading}>
                      {loading ? "Registering..." : "Complete Registration"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ==================== ROLE: COMPANY (JOB PROVIDER) ==================== */}
          {role === "company" && (
            <div className="row">
              <h5 className="fw-bold mb-3 text-secondary border-bottom pb-2">Organisation & Contact Details</h5>

              <div className="col-md-6 mb-3">
                <label className="form-label">Organisation Name</label>
                <input
                  type="text"
                  className={`form-control ${errors.companyName ? "is-invalid" : ""}`}
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="ACME Corp"
                />
                {errors.companyName && <div className="invalid-feedback">{errors.companyName}</div>}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Organisation / Registration ID</label>
                <input
                  type="text"
                  className={`form-control ${errors.organisationId ? "is-invalid" : ""}`}
                  name="organisationId"
                  value={formData.organisationId}
                  onChange={handleChange}
                  placeholder="GSTIN / Org registration no."
                />
                {errors.organisationId && <div className="invalid-feedback">{errors.organisationId}</div>}
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">Contact Person Name</label>
                <input
                  type="text"
                  className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Jane Smith"
                />
                {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hr@acme.com"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit phone"
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 chars"
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                />
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
              </div>

              <h5 className="fw-bold mt-4 mb-3 text-secondary border-bottom pb-2">Select Subscription Option</h5>

              <div className="col-md-12 mb-4">
                <div className="card border-primary bg-light p-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary px-3 py-2 fs-6">1-Month Free Trial Plan</span>
                    <span className="fw-bold text-success fs-5">FREE</span>
                  </div>
                  <p className="text-muted small mb-0">
                    Register today and enjoy unlimited job postings, candidate browsing, and application management free for the first 30 days. No credit card required.
                  </p>
                </div>
              </div>

              <div className="col-12 mt-3">
                <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
                  {loading ? "Registering Organisation..." : "Complete Registration"}
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}

export default Register;
