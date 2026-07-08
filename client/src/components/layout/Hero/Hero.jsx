import "./Hero.css";
import { FaSearch, FaMapMarkerAlt, FaUsers, FaBriefcase } from "react-icons/fa";
import { HiBuildingOffice2 } from "react-icons/hi2";

function Hero() {
  return (
    <section className="hero">

      <div className="container">

        <div className="row align-items-center">

          {/* Left Side */}

          <div className="col-lg-6 hero-left">

            <span className="badge bg-primary mb-3 px-3 py-2">
              Find Part-Time Jobs Near You
            </span>

            <h1>
              Discover Your Next
              <span> Opportunity </span>
              Today
            </h1>

            <p>
              Find verified part-time jobs including Catering,
              Warehouse, Driving, Delivery, Event Staff,
              Housekeeping and more.
            </p>

            <div className="search-container">

              <div className="search-input">

                <FaSearch />

                <input
                  type="text"
                  placeholder="Search jobs..."
                />

              </div>

              <div className="search-input">

                <FaMapMarkerAlt />

                <input
                  type="text"
                  placeholder="Location"
                />

              </div>

              <button className="btn btn-primary search-btn">
                Search
              </button>

            </div>

          </div>

          {/* Right Side */}

          <div className="col-lg-6 hero-right">

            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800"
              alt="Work Team"
            />

          </div>

        </div>

        {/* Statistics */}

        <div className="row mt-5 g-4">

          <div className="col-6 col-md-4">

            <div className="stats-card">

              <FaBriefcase className="stats-icon"/>

              <h3>10K+</h3>

              <p>Jobs</p>

            </div>

          </div>

          <div className="col-6 col-md-4">

            <div className="stats-card">

              <FaUsers className="stats-icon"/>

              <h3>5K+</h3>

              <p>Workers</p>

            </div>

          </div>

          <div className="col-12 col-md-4">

            <div className="stats-card">

              <HiBuildingOffice2 className="stats-icon"/>

              <h3>500+</h3>

              <p>Companies</p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;