// import axios from 'axios';

// // Axios Instance for API requests
// const api = axios.create({
//     baseURL: process.env.NEXT_PUBLIC_API_URL,
//     headers:{
//         'Content-Type': 'application/json',
//     }
// });

// // Add a request interceptor to include the token in headers
// api.interceptors.request.use(
//   (config) => {
//     // Check if window is defined (i.e., we're in the browser)
//     if (typeof window !== 'undefined') {
//       const token = localStorage.getItem('token');
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export default api;