import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5002", // or your deployed backend URL
});

export default instance;