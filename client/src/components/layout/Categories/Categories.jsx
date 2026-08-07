import { useNavigate } from "react-router-dom";
import "./Categories.css";
import {
  FaUtensils,
  FaTruck,
  FaWarehouse,
  FaCar,
  FaBroom,
  FaPeopleCarry,
  FaEllipsisH,
} from "react-icons/fa";

const categories = [
  {
    id: 1,
    icon: <FaUtensils />,
    title: "Catering",
    jobs: "250+ Jobs",
  },
  {
    id: 2,
    icon: <FaWarehouse />,
    title: "Warehouse",
    jobs: "180+ Jobs",
  },
  {
    id: 3,
    icon: <FaCar />,
    title: "Valet Parking",
    jobs: "80+ Jobs",
  },
  {
    id: 4,
    icon: <FaTruck />,
    title: "Delivery",
    jobs: "210+ Jobs",
  },
  {
    id: 5,
    icon: <FaPeopleCarry />,
    title: "Event Staff",
    jobs: "130+ Jobs",
  },
  {
    id: 6,
    icon: <FaBroom />,
    title: "Housekeeping",
    jobs: "95+ Jobs",
  },
  {
    id: 7,
    icon: <FaEllipsisH />,
    title: "Others",
    jobs: "Explore More",
    isOthers: true,
  },
];

function Categories() {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    if (category.isOthers) {
      navigate("/jobs?others=true");
    } else {
      navigate(`/jobs?category=${encodeURIComponent(category.title)}`);
    }
  };

  return (
    <section className="categories section">

      <div className="container">

        <div className="text-center mb-5">

          <h2 className="title">
            Popular Categories
          </h2>

          <p className="subtitle">
            Choose your preferred part-time job category
          </p>

        </div>

        <div className="row g-4">

          {categories.map((category) => (

            <div
              className="col-12 col-sm-6 col-lg-4"
              key={category.id}
            >

              <div 
                className="category-card" 
                onClick={() => handleCategoryClick(category)}
                style={{ cursor: "pointer" }}
              >

                <div className="category-icon">
                  {category.icon}
                </div>

                <h4>{category.title}</h4>

                <p>{category.jobs}</p>

                <button className="btn btn-primary">
                  View Jobs
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default Categories;
