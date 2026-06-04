import Cookies from "universal-cookie";

const cookies = new Cookies();

export const getToken = (): string => cookies.get("@hexavara"); // Change with your token name

export const setToken = (token: string) => {
  cookies.set("@hexavara", token, { path: "/" }); // Change with your token name
};

export const removeToken = () => cookies.remove("@hexavara", { path: "/" }); // Change with your token name
