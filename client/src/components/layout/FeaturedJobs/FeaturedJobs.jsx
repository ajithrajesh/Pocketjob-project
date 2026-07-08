import "./FeaturedJobs.css";
import {
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaClock,
  FaUsers,
} from "react-icons/fa";

const jobs = [
  {
    id: 1,
    title: "Warehouse Helper",
    company: "ABC Logistics",
    location: "Kochi",
    salary: "₹900 / Day",
    time: "9 AM - 6 PM",
    slots: 12,
  },
  {
    id: 2,
    title: "Catering Staff",
    company: "Royal Caterers",
    location: "Thrissur",
    salary: "₹1200 / Day",
    time: "8 AM - 5 PM",
    slots: 8,
  },
  {
    id: 3,
    title: "Delivery Executive",
    company: "Quick Express",
    location: "Palakkad",
    salary: "₹1000 / Day",
    time: "Flexible",
    slots: 20,
  },
  {
    id: 4,
    title: "Valet Parking",
    company: "City Mall",
    location: "Kochi",
    salary: "₹1100 / Day",
    time: "10 AM - 7 PM",
    slots: 6,
  },
];

function FeaturedJobs() {
  return (
    <section className="featured-jobs section">

      <div className="container">

        <div className="text-center mb-5">
          <h2 className="title">Featured Jobs</h2>
          <p className="subtitle">
            Apply for verified part-time jobs near you
          </p>
        </div>

        <div className="row g-4">

          {jobs.map((job) => (

            <div
              className="col-12 col-md-6 col-xl-3"
              key={job.id}
            >

              <div className="job-card">

                <span className="badge bg-success mb-3">
                  Verified
                </span>

                <h4>{job.title}</h4>

                <h6>{job.company}</h6>

                <div className="job-info">

                  <p>
                    <FaMapMarkerAlt />
                    {job.location}
                  </p>

                  <p>
                    <FaMoneyBillWave />
                    {job.salary}
                  </p>

                  <p>
                    <FaClock />
                    {job.time}
                  </p>

                  <p>
                    <FaUsers />
                    {job.slots} Slots Left
                  </p>

                </div>

                <button className="btn btn-primary w-100">
                  Apply Now
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default FeaturedJobs;