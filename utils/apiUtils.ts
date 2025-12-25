import axios from 'axios';

const requestUtil = axios.create({
    baseURL: process.env.EXPO_PUBLIC_SERVER_URL
});

export const getDecisions = async () => {
    try {
        const response = await requestUtil.get("/api/decisions");
        return response.data;
    } catch (e) {
        console.error('Error fetching response', e);
    }
}