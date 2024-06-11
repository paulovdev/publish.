import React from "react";
import { format } from 'date-fns';

const FormatDate = ({ date }) => {

  const formatDate = (date) => {
    return format(new Date(date), "dd/MM/yyyy");
  };


  return (
    <>
      <p>{formatDate(date)}</p>
    </>
  );
};

export default FormatDate;
