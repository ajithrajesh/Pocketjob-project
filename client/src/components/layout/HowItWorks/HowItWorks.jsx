import "./HowItWorks.css";

import {
  FaUserPlus,
  FaIdCard,
  FaClipboardCheck,
  FaBriefcase,
} from "react-icons/fa";

const steps = [
  {
    id: 1,
    icon: <FaUserPlus />,
    title: "Create Account",
    description:
      "Register in a few seconds using your email and phone number.",
  },
  {
    id: 2,
    icon: <FaIdCard />,
    title: "Complete Profile",
    description:
      "Upload your profile photo, Aadhaar, driving licence and personal details.",
  },
  {
    id: 3,
    icon: <FaClipboardCheck />,
    title: "Apply for Jobs",
    description:
      "Search nearby jobs and apply instantly to available slots.",
  },
  {
    id: 4,
    icon: <FaBriefcase />,
    title: "Start Working",
    description:
      "Get approved by the employer and begin earning immediately.",
  },
];

function HowItWorks() {
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

              <div className="step-card">

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