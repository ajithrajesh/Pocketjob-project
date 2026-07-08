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
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const validate = () => {
    const err = {};

    if (!formData.fullName.trim()) err.fullName = "Full Name is required";

    if (!formData.email.trim()) {
      err.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      err.email = "Invalid email";
    }

    if (!/^\d{10}$/.test(formData.phone))
      err.phone = "Phone must be 10 digits";

    const pass =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

    if (!pass.test(formData.password))
      err.password =
        "Min 8 chars with uppercase, lowercase, number & special character";

    if (formData.password !== formData.confirmPassword)
      err.confirmPassword = "Passwords do not match";

    if (!formData.gender) err.gender = "Select gender";
    if (!formData.dob) err.dob = "Date of Birth required";

    if (!formData.state) err.state = "State required";
    if (!formData.district) err.district = "District required";
    if (!formData.city) err.city = "City required";

    if (!/^\d{6}$/.test(formData.pincode))
      err.pincode = "Pincode must be 6 digits";

    if (formData.categories.length === 0)
      err.categories = "Select at least one category";

    setErrors(err);

    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      await register(formData);
      toast.success("Registration Successful");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow p-4">
        <h2 className="mb-4 text-center">Create Account</h2>

        <form onSubmit={handleSubmit}>
          <div className="row">
            {[
              ["Full Name","fullName","text"],
              ["Email","email","email"],
              ["Phone","phone","text"],
              ["Password","password","password"],
              ["Confirm Password","confirmPassword","password"],
              ["State","state","text"],
              ["District","district","text"],
              ["City","city","text"],
              ["Pincode","pincode","text"],
            ].map(([label,name,type])=>(
              <div className="col-md-6 mb-3" key={name}>
                <label>{label}</label>
                <input
                  type={type}
                  className="form-control"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                />
                {errors[name] && <small className="text-danger">{errors[name]}</small>}
              </div>
            ))}

            <div className="col-md-6 mb-3">
              <label>Gender</label>
              <select
                className="form-select"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              {errors.gender && <small className="text-danger">{errors.gender}</small>}
            </div>

            <div className="col-md-6 mb-3">
              <label>Date of Birth</label>
              <input
                type="date"
                className="form-control"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
              />
              {errors.dob && <small className="text-danger">{errors.dob}</small>}
            </div>

            <div className="col-12 mb-3">
              <label className="mb-2">Preferred Categories</label>
              <div className="row">
                {categoriesList.map((cat)=>(
                  <div className="col-md-4" key={cat}>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={formData.categories.includes(cat)}
                        onChange={()=>handleCategory(cat)}
                      />
                      <label className="form-check-label">{cat}</label>
                    </div>
                  </div>
                ))}
              </div>
              {errors.categories && <small className="text-danger">{errors.categories}</small>}
            </div>

            <div className="col-12">
              <button className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </div>
        </form>

        <p className="text-center mt-4">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
