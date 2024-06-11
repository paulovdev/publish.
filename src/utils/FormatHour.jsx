import React from "react";
import { format, formatDistanceToNow } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR'; // Import the Brazilian Portuguese locale

const FormatHour = ({ date }) => {

  const formatHour = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
  }

  return (
    <>
      <p>{formatHour(date)}</p>
    </>
  );
};

export default FormatHour;
