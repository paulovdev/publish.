import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import './SearchInput.scss';

const SearchInput = () => {
    const [search, setSearch] = useState("");
    const [showButton, setShowButton] = useState(true);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (search) {
            navigate(`/search?q=${search}`);
            setSearch("");
        }
    };

    const handleShowButton = () => {
        setShowButton(!showButton)
    }

    return (
        <form onSubmit={handleSubmit} className={!showButton ? "active" : ""}>
            <div className="search-input">

                <button onClick={handleShowButton}  className="bt1">
                    <IoIosSearch size={22} />
                </button>

                {!handleShowButton &&
                    <button type="submit" className="bt2">
                        <IoIosSearch size={22} />
                    </button>
                }

                <input
                    type="text"
                    placeholder="Pesquisar"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </form >
    );
};

export default SearchInput;
