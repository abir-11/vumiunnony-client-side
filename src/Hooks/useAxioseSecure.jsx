import axios from 'axios';
import React from 'react';

const axiosSecure=axios.create({
    baseURL:'https://vumi-unnoyon-server-side.vercel.app'
});

const useAxiosSecure = () => {
    return axiosSecure;
};

export default useAxiosSecure;