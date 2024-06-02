import { Link } from "react-router-dom";
import styled from "styled-components";

import { useUser } from "../contexts/userContext";
import Cookies from "js-cookie";

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
  const { currentUser } = useUser();
  const isLoggedIn = !!currentUser;

  function handleLogout() {
    Cookies.remove("token");
    window.location.replace("/login");
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
            <Link onClick={handleLogout}>Logout</Link>
          </MenuItem>
        )}
      </NavbarUl>
    </NavbarTag>
  );
};

export default Navbar;
