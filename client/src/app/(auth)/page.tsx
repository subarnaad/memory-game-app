"use client";

import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";

const page = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isLogin, setIsLogin] = useState(true);
  const setLogin = () => {
    setIsLogin(!isLogin);
  };
  return (
    <div className="flex justify-center items-center min-h-screen min-w-full">
      {isLogin ? (
        <LoginForm setLogin={setLogin} />
      ) : (
        <RegisterForm setLogin={setLogin} />
      )}
    </div>
  );
};

export default page;
