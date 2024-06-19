import { useState } from "react";
import { auth } from "../firebase/Firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const translateError = (errorCode) => {
  switch (errorCode) {
    case "auth/user-not-found":
      return "Usuário não encontrado";
    case "auth/wrong-password":
      return "Senha incorreta";
    case "auth/invalid-email":
      return "E-mail inválido";
    case "auth/network-request-failed":
      return "Falha na conexão de rede";
    default:
      return "Ocorreu um erro. Tente novamente mais tarde.";
  }
};

export const useLogin = () => {
  const [loading, setLoading] = useState(false);

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      return true;
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
      return false;
    }
  };

  return { loginUser, loading };
};
