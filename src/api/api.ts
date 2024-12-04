import axios from "axios";
import { API_CONFIG } from "@/constants/api-constants";
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: API_CONFIG.HEADERS,
});

export default apiClient;
