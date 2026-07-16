import "./Footer.css";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">

      <div className="container">

        <div className="row gy-5">


          <div className="col-12 col-md-6 col-lg-4">

            <h3 className="footer-logo">
              WorkConnect
            </h3>

            <p>
              WorkConnect helps workers find verified
              part-time jobs nearby while enabling
              companies to hire trusted workers quickly.
            </p>

            <div className="social-icons">

              <a href="#">
                <FaFacebookF />
              </a>

              <a href="#">
                <FaInstagram />
              </a>

              <a href="#">
                <FaLinkedinIn />
              </a>

              <a href="#">
                <FaTwitter />
              </a>

            </div>

          </div>

         

          <div className="col-6 col-lg-2">

            <h5>Quick Links</h5>

            <ul>

              <li>Home</li>

              <li>Jobs</li>

              <li>Categories</li>

              <li>About</li>

              <li>Contact</li>

            </ul>

          </div>

          {/* Categories */}

          <div className="col-6 col-lg-3">

            <h5>Job Categories</h5>

            <ul>

              <li>Catering</li>

              <li>Warehouse</li>

              <li>Driver</li>

              <li>Delivery</li>

              <li>Housekeeping</li>

            </ul>

          </div>

          {/* Contact */}

          <div className="col-12 col-lg-3">

            <h5>Contact</h5>

            <p>

              <FaMapMarkerAlt />

              Kochi, Kerala

            </p>

            <p>

              <FaPhone />

              +91 9876543210

            </p>

            <p>

              <FaEnvelope />

              support@workconnect.com

            </p>

          </div>

        </div>

        <hr />

        <div className="copyright">

          © 2026 WorkConnect. All Rights Reserved.

        </div>

      </div>

    </footer>
  );
}

export default Footer;