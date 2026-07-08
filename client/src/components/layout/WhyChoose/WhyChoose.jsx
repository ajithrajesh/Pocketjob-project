import "./WhyChoose.css";

import {
  FaUserCheck,
  FaMapMarkedAlt,
  FaClock,
  FaShieldAlt,
} from "react-icons/fa";

const features = [
  {
    id: 1,
    icon: <FaUserCheck />,
    title: "Verified Workers",
    description:
      "Every worker completes profile verification using Aadhaar, profile photo and required documents.",
  },
  {
    id: 2,
    icon: <FaMapMarkedAlt />,
    title: "Location Based Jobs",
    description:
      "Find nearby jobs using your current location with distance-based search.",
  },
  {
    id: 3,
    icon: <FaClock />,
    title: "Instant Applications",
    description:
      "Apply to available job slots in just one click and track your application status.",
  },
  {
    id: 4,
    icon: <FaShieldAlt />,
    title: "Secure Platform",
    description:
      "Safe authentication, document verification and trusted employers.",
  },
];

function WhyChoose() {
  return (
    <section className="why section">

      <div className="container">

        <div className="text-center mb-5">

          <h2 className="title">
            Why Choose WorkConnect?
          </h2>

          <p className="subtitle">
            Everything you need to find trusted part-time jobs.
          </p>

        </div>

        <div className="row g-4">

          {features.map((item) => (

            <div
              className="col-12 col-sm-6 col-lg-3"
              key={item.id}
            >

              <div className="feature-card">

                <div className="feature-icon">
                  {item.icon}
                </div>

                <h4>{item.title}</h4>

                <p>{item.description}</p>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default WhyChoose;