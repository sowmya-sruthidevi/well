import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API = `${API_URL}/api/gd`;

export const startGD = async (token)=>{

 return axios.post(
   `${API}/start`,
   {},
   {headers:{Authorization:`Bearer ${token}`}}
 );

};

export const nextTurn = async (sessionId,message,token)=>{

 return axios.post(
   `${API}/next-turn`,
   {sessionId,message},
   {headers:{Authorization:`Bearer ${token}`}}
 );

};