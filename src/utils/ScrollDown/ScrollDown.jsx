import React from 'react';
import { GoArrowDown } from 'react-icons/go';
import "./ScrollDown.scss";

const ScrollDown = () => {
  const scrollToDown = () => {
    window.scrollTo({ top: 750, behavior: "smooth" });
  };

  return (
    <div className="scroll-down" onClick={scrollToDown}>
      <GoArrowDown size={32} color="#fff" />
    </div>
  );
};

export default ScrollDown;
