import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';

import { ConfigProvider } from 'antd';
import axios from 'axios';
import Navbar from './Navbar';
import Login from './Pages/Login';
import Collections from './Pages/Collections';
import Templates from './Pages/Templates';
import Interactions from './Pages/Interactions';
import Reports from './Pages/Reports';

import { UserContext } from './Components/UserContext';
import { UserProvider } from './Components/UserContext';

function App() {
  const { isLoggedIn, handleLogout } = useContext(UserContext);
  const { token } = useContext(UserContext);

  useEffect(() => {
    // Create an Axios instance with default configuration
    const axiosInstance = axios.create();

    // Add a request interceptor
    axiosInstance.interceptors.request.use(
      (config) => {
        // Modify the config object to add headers
        config.headers['Authorization'] = `Bearer ${token}`;
        // Add any other headers you need to include

        return config;
      },
      (error) => {
        // Handle request error
        return Promise.reject(error);
      }
    );

    // Cleanup the interceptor on component unmount
    return () => {
      axiosInstance.interceptors.request.eject();
    };
  }, []); // Run the effect only once on component mount

  return (
    <div className="App">
      <ConfigProvider notificationPlacement="center">
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={isLoggedIn ? <Reports /> : <Navigate to="/login" />} />
            <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/interactions" />} />
            <Route path="/collections" element={isLoggedIn ? <Collections /> : <Navigate to="/login" />} />
            <Route path="/templates" element={isLoggedIn ? <Templates /> : <Navigate to="/login" />} />
            <Route path="/interactions" element={isLoggedIn ? <Interactions /> : <Navigate to="/login" />} />
          </Routes>
        </Router>
      </ConfigProvider>
    </div>
  );
}

export default () => (
  <UserProvider>
    <App />
  </UserProvider>
);