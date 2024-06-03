import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";

import { useUser } from "../contexts/userContext";

const NavbarTag = styled.nav`
  background-color: #f8f9fa;
  color: #272e3f;
  display: flex;
  justify-content: space-between;
  padding: 1rem 1.5rem;
`;

const NavbarUl = styled.ul`
  display: flex;
  gap: 4rem;
  list-style-type: none;
`;

const Logo = styled.h1`
  font-size: 1.2rem;
  font-weight: 700;
`;

const MenuItem = styled.li`
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
`;

const Navbar = () => {
  const { currentUser, logout } = useUser();
  const isLoggedIn = !!currentUser;

  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <NavbarTag>
      <Logo>
        <Link to="/">PassKeys Auth</Link>
      </Logo>
      <NavbarUl>
        {!isLoggedIn && (
          <>
            <MenuItem>
              <Link to="/login">Login</Link>
            </MenuItem>
            <MenuItem>
              <Link to="/register">Register</Link>
            </MenuItem>
          </>
        )}

        {isLoggedIn && (
          <MenuItem>
            <a to="#" onClick={handleLogout}>
              Logout
            </a>
          </MenuItem>
        )}
      </NavbarUl>
    </NavbarTag>
  );
};

export default Navbar;
