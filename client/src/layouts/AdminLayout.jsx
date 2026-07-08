import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div className="container-fluid">

      <div className="row">

        <aside className="col-lg-3 bg-primary text-white p-4">

          <h3>Admin Panel</h3>

          <ul className="list-unstyled mt-4">

            <li className="mb-3">Dashboard</li>

            <li className="mb-3">Users</li>

            <li className="mb-3">Jobs</li>

            <li className="mb-3">Applications</li>

            <li className="mb-3">Analytics</li>

            <li className="mb-3">Reports</li>

          </ul>

        </aside>

        <section className="col-lg-9 p-4">

          <Outlet />

        </section>

      </div>

    </div>
  );
}

export default AdminLayout;