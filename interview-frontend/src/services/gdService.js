import axios from "axios";

const API = "http://localhost:5000/api/gd";

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