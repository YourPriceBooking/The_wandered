import axios from 'axios'
import { apiUrl } from './url'
const instance = axios.create({
    baseURL: apiUrl,
})
export default instance