import { Link, NavLink } from "react-router-dom";
import { Blog } from "../../../context/Context";
import "./Navbar.scss";

import UserModal from "../UserModal/UserModal";
import SearchInput from './SearchInput/SearchInput';

const Navbar = () => {
  const { currentUser } = Blog();

  return (
    <>
      <header>
        {!currentUser &&
          <Link to="/">
            <img src="/logo-publish.png" alt="" />
          </Link>
        }

        {currentUser &&
          <SearchInput />
        }

        <nav>
          {!currentUser && (<>
            <li>
              <NavLink to="/login">Entrar</NavLink>
            </li>
            <li>
              <NavLink to="/register">Cadastrar</NavLink>
            </li>
            <li>
              <NavLink to="/about">Sobre</NavLink>
            </li>
          </>
          )}
        </nav>


        {currentUser && <UserModal />}

      </header >

    </>
  );
};

export default Navbar;
