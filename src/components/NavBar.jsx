import { logout } from "../utils/auth";
import { Link } from "react-router-dom";
import "./SidebarNavBar.css"; // Sidebar-specific styles

import {
  FaHome,
  FaUserFriends,
  FaBed,
  FaClipboardList,
  FaMoneyCheckAlt,
  FaConciergeBell,
  FaUserTie,
  FaServicestack,
  FaSignOutAlt,
} from "react-icons/fa";

export default function NavBar() {
  return (
    <div className="sidebar">
      <Link to="/" className="sidebar-link"><FaHome className="sidebar-icon" /> Home</Link>
      <Link to="/guests" className="sidebar-link"><FaUserFriends className="sidebar-icon" /> Guests</Link>
      <Link to="/rooms" className="sidebar-link"><FaBed className="sidebar-icon" /> Rooms</Link>
      <Link to="/bookings" className="sidebar-link"><FaClipboardList className="sidebar-icon" /> Bookings</Link>
      <Link to="/payments" className="sidebar-link"><FaMoneyCheckAlt className="sidebar-icon" /> Payments</Link>
      <Link to="/services" className="sidebar-link"><FaConciergeBell className="sidebar-icon" /> Services</Link>
      <Link to="/staff" className="sidebar-link"><FaUserTie className="sidebar-icon" /> Staff</Link>
      <Link to="/guestservices" className="sidebar-link"><FaServicestack className="sidebar-icon" /> Guest Services</Link>
      <button className="sidebar-link logout" onClick={logout}>
        <FaSignOutAlt className="sidebar-icon" /> Logout
      </button>
    </div>
  );
}