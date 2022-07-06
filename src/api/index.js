import axios from "axios"

// Water
export const Water = axios.create({
  baseURL: process.env.VUE_APP_API,
})

export default axios
