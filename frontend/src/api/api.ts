import axios from 'axios';
import {
    IDatasetAddRequest,
    IDatasetResponse,
    IEventAddRequest,
    IEventResponse,
    IPeriodResponse,
    IUserResponse
} from "./Interfaces";
import { msalInstance } from './msalInstance';
import { loginRequest } from './authConfig';

const BASE_URL = process.env.REACT_APP_API_URL;

// Resolved once MSAL has finished initialising and processing any redirect on page load.
// Cached so subsequent calls are instant.

//TODO: even if logged in auth headers are not being set?
//TODO: red toast with error message when api call fails
//TODO: Create proper request object for axios

const msalReady: Promise<void> = msalInstance.initialize()
    .then(() => msalInstance.handleRedirectPromise())
    .then((response) => {
        // If a redirect response came back, set the account as active
        if (response?.account) {
            msalInstance.setActiveAccount(response.account);
        } else {
            const accounts = msalInstance.getAllAccounts();
            if (accounts.length > 0 && !msalInstance.getActiveAccount()) {
                msalInstance.setActiveAccount(accounts[0]);
            }
        }
    });

async function getAccessToken(): Promise<string | null> {
    await msalReady;

    const account = msalInstance.getActiveAccount();
    if (!account) return null;

    try {
        const result = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
        return result.accessToken;
    } catch {
        return null;
    }
}

async function authHeaders(): Promise<Record<string, string>> {
    const token = await getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function testFunction(method: 'get' | 'post' = 'get'): Promise<IUserResponse> {
    const token = await getAccessToken();
    if (!token) {
        return { userId: undefined, email: undefined, name: undefined };
    }
    const response = await axios({
        url: `${BASE_URL}/Test`,
        method,
        headers: await authHeaders(),
    });
    return response.data as IUserResponse;
}
export async function getEvents(datasetId?: string) {
    const params: Record<string, string> = {};
    if (datasetId) params.dataset = datasetId;
    const response = await axios.get(`${BASE_URL}/GetEvents`, {
        params,
        headers: await authHeaders(),
    });
    return response.data as IEventResponse[];
}
export async function addEvents(events: IEventAddRequest[]) {
    const response = await axios.post(`${BASE_URL}/AddEvent`, events, {
        headers: {
            'Content-Type': 'application/json',
            ...await authHeaders(),
        },
    });
    return response.data;
}
export async function getPeriods(datasetId?: string) {
    const params: Record<string, string> = {};
    if (datasetId) params.dataset = datasetId;
    const response = await axios.get(`${BASE_URL}/GetPeriods`, {
        params,
        headers: await authHeaders(),
    });
    return response.data as IPeriodResponse[];
}
export async function getDatasets() {
    const response = await axios.get(`${BASE_URL}/GetDatasets`, {
        headers: await authHeaders(),
    });
    return response.data as IDatasetResponse[];
}

export async function addDataset(data: IDatasetAddRequest) {
    const response = await axios.post(`${BASE_URL}/AddDataset`, data, {
        headers: {
            'Content-Type': 'application/json',
            ...await authHeaders(),
        },
    });
    return response.data as IDatasetResponse;
}

