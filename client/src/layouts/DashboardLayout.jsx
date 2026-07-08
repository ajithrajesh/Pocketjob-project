import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className="container-fluid">

      <div className="row">

        <aside className="col-lg-3 bg-dark text-white p-4">
          <h3>User Dashboard</h3>

          <ul className="list-unstyled mt-4">

            <li className="mb-3">Dashboard</li>

            <li className="mb-3">Profile</li>

            <li className="mb-3">Applications</li>

            <li className="mb-3">Saved Jobs</li>

            <li className="mb-3">Notifications</li>

            <li className="mb-3">Chat</li>

          </ul>

        </aside>

        <section className="col-lg-9 p-4">

          <Outlet />

        </section>

      </div>

    </div>
  );
}

export default DashboardLayout;