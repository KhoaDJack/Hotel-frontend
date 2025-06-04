import './HomePage.css';
import { FaHotel } from 'react-icons/fa';

export default function HomePage() {
  return (
    <div className="home-background">
      <div className="home-container">
        <h1 className="home-title">
          <FaHotel style={{ marginRight: '10px', color: '#007bff' }} />
          Welcome to the Hotel Management System</h1>
        <p className="home-description">Select a menu item to get started.</p>
      </div>
    </div>
  );
}