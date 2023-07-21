// UserContext.js
import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [uid, setUid] = useState('');
  const [token, setToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUid('');
    setToken('');
  };

  const handleToken = (token) => {
    setToken(token);
  };

  const handleUid = (uid) => {
    setUid(uid);
  };

  return (
    <UserContext.Provider
      value={{ uid, setUid, token, setToken, isLoggedIn, handleLogin, handleLogout, handleToken }}
    >
      {children}
    </UserContext.Provider>
  );
};
