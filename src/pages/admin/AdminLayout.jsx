import { NavLink, Outlet } from 'react-router-dom';
import '../../styles/Admin.css';

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidenav">
        <h2>Admin</h2>
        <NavLink to="/admin" end>Dashboard</NavLink>
        <NavLink to="/admin/pipelines">Pipelines</NavLink>
        <NavLink to="/admin/companies">Per-company run</NavLink>
        <NavLink to="/admin/links">Per-link run</NavLink>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
