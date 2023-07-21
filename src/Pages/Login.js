import API_ENDPOINTS from '../apiConfig';
import { Button, List, Divider, Typography, message } from 'antd';
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../Components/UserContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const { setUid, handleLogin, handleLogout } = useContext(UserContext); // Use handleLogin from context
  const { setToken, handleToken } = useContext(UserContext); // Use handleToken from context

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_ENDPOINTS.login}`, {
        username: email,
        password: pass,
      });
      if (response.status === 200 || response.status === 'success' || response.statusText === 'OK') {
        setUid(response.data.uid);
        setToken(response.data.token);

        console.log("Login successful");
        handleLogin(); // call handleLogin directly from context
        navigate('/interactions');
      } else {
        console.log(response);
        message.error('Password does not match');
      }
    } catch (error) {
      console.log(error);
      message.error('Failed to authenticate. Please try again later.');
    }
  };

  return (
    <div className="login">
      <div className="auth-form-container">
        <h2>Login</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="youremail@gmail.com"
            id="email"
            name="email"
          />
          <label htmlFor="password">password</label>
          <input
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            type="password"
            placeholder="********"
            id="password"
            name="password"
          />
          <button type="submit" onClick={handleSubmit}>Log In</button>
        </form>
      </div>
    </div>
  );
}