import { Link } from "react-router-dom";
import { FaBriefcase, FaUsers, FaHandshake, FaBolt } from "react-icons/fa";
import "./About.css";

function About() {
  return (
    <>
      <section className="about-banner">
        <div className="container text-center">
          <h1>About pocketJob</h1>
          <p>Connecting part-time job seekers with trusted local employers</p>
        </div>
      </section>

      <section className="about-mission section">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <h2 className="title">Our Mission</h2>
              <p>
                pocketJob makes it simple for people to find flexible,
                part-time work near them, and for businesses to quickly hire
                reliable staff for catering, delivery, warehouse, events, and
                more. No long applications, no waiting weeks for a reply —
                just fast, direct connections between job seekers and
                companies.
              </p>
              <Link to="/jobs" className="btn btn-primary">
                Browse Jobs
              </Link>
            </div>

            <div className="col-lg-6">
              <div className="row g-3">
                <div className="col-6">
                  <div className="about-stat-card">
                    <h3>1,000+</h3>
                    <p>Jobs Posted</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="about-stat-card">
                    <h3>500+</h3>
                    <p>Companies</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="about-stat-card">
                    <h3>10,000+</h3>
                    <p>Job Seekers</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="about-stat-card">
                    <h3>6+</h3>
                    <p>Job Categories</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-values section">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="title">Why pocketJob</h2>
            <p className="subtitle">What makes us different</p>
          </div>

          <div className="row g-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="about-value-card">
                <div className="about-value-icon">
                  <FaBolt />
                </div>
                <h4>Fast Hiring</h4>
                <p>Apply and get hired in days, not weeks.</p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="about-value-card">
                <div className="about-value-icon">
                  <FaBriefcase />
                </div>
                <h4>Real Jobs</h4>
                <p>Verified companies posting genuine openings.</p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="about-value-card">
                <div className="about-value-icon">
                  <FaUsers />
                </div>
                <h4>For Everyone</h4>
                <p>Flexible roles across catering, delivery, events & more.</p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="about-value-card">
                <div className="about-value-icon">
                  <FaHandshake />
                </div>
                <h4>Trusted Platform</h4>
                <p>Built to keep both seekers and employers safe.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default About;