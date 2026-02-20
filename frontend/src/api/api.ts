import axios from 'axios';

const BASE_URL = "http://localhost:7071/api";
// const BASE_URL = "everything-api-function-app-exb5hnguezfydxhv.canadacentral-01.azurewebsites.net/api"; 

export async function testFunction(method: 'get' | 'post' = 'get') {
    const response = await axios({
        url: `${BASE_URL}/Test`,
        method,
        withCredentials: true,
    });
    return response.data;
}
export async function getEvents(datasetId?: string) {
    const params: Record<string, string> = {};
    if (datasetId) params.dataset = datasetId;
    const response = await axios.get(`${BASE_URL}/GetEvents`, {
        params,
        withCredentials: true,
    });
    return response.data;
}
export async function addEvents(events: any[]) {
    const response = await axios.post(`${BASE_URL}/AddEvent`, events, {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    });
    return response.data;
}
