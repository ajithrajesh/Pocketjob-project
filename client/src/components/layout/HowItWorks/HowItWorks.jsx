import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./HowItWorks.css";

import {
  FaUserPlus,
  FaIdCard,
  FaClipboardCheck,
  FaBriefcase,
} from "react-icons/fa";

function HowItWorks() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Each step routes somewhere real: logged-out users are sent to
  // register/login first, logged-in users go straight to the relevant page.
  const steps = [
    {
      id: 1,
      icon: <FaUserPlus />,
      title: "Create Account",
      description:
        "Register in a few seconds using your email and phone number.",
      onClick: () =>
        navigate(isAuthenticated ? "/dashboard" : "/register"),
    },
    {
      id: 2,
      icon: <FaIdCard />,
      title: "Complete Profile",
      description:
        "Upload your profile photo, Aadhaar, driving licence and personal details.",
      onClick: () =>
        navigate(isAuthenticated ? "/dashboard?tab=profile" : "/register"),
    },
    {
      id: 3,
      icon: <FaClipboardCheck />,
      title: "Apply for Jobs",
      description:
        "Search nearby jobs and apply instantly to available slots.",
      onClick: () => navigate("/jobs"),
    },
    {
      id: 4,
      icon: <FaBriefcase />,
      title: "Start Working",
      description:
        "Get approved by the employer and begin earning immediately.",
      onClick: () =>
        navigate(isAuthenticated ? "/dashboard?tab=applications" : "/register"),
    },
  ];

  return (
    <section className="how section">

      <div className="container">

        <div className="text-center mb-5">

          <h2 className="title">
            How pocketJob Works
          </h2>

          <p className="subtitle">
            Getting your next part-time job takes only four simple steps.
          </p>

        </div>

        <div className="row g-4">

          {steps.map((step) => (

            <div
              className="col-12 col-md-6 col-lg-3"
              key={step.id}
            >

              <div
                className="step-card"
                onClick={step.onClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") step.onClick();
                }}
              >

                <div className="step-number">
                  {step.id}
                </div>

                <div className="step-icon">
                  {step.icon}
                </div>

                <h4>{step.title}</h4>

                <p>{step.description}</p>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default HowItWorks;