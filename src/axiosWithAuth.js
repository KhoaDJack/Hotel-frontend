import axios from "axios";

const axiosWithAuth = axios.create({
  baseURL: "http://localhost:5290", // your backend
  withCredentials: true,            // IMPORTANT for cookies
});

export default axiosWithAuth;