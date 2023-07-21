import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { UserContext } from './Components/UserContext';
import './styles/styles.css'; 

export default function Navbar() {
  const { handleLogout } = useContext(UserContext);

  return (
    <nav className="menu">
      <nav className="nav">
        <span className="title">Training Ground</span>
        <ul>
          <li>
            <Link to="/collections">Collections</Link>
          </li>
          <li>
            <Link to="/templates">Templates</Link>
          </li>
          <li>
            <Link to="/interactions">Interactions</Link>
          </li>
          <li>
            <Button type="link" onClick={handleLogout}>
              Logout
            </Button>
          </li>
        </ul>
      </nav>
    </nav>
  );
}