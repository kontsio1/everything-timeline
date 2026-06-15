import axios from 'axios';
import {
  IDatasetAddRequest,
  IDatasetResponse,
  IEventAddRequest,
  IEventDeleteRequest,
  IEventResponse,
  IEventUpdateRequest,
  IPeriodResponse,
  IUserResponse,
} from './Interfaces';
import { msalInstance, msalReady } from './msalInstance';
import { loginRequest } from './authConfig';

const BASE_URL = import.meta.env.VITE_API_URL;

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

export async function testFunction(
  method: 'get' | 'post' = 'get',
): Promise<IUserResponse> {
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
  const response = await axios.get<{ Events: IEventResponse[] }>(
    `${BASE_URL}/GetEvents`,
    {
      params,
      headers: await authHeaders(),
    },
  );
  return response.data.Events ?? [];
}
export async function addEvents(events: IEventAddRequest[]) {
  const response = await axios.post<{ Events: IEventResponse[] }>(
    `${BASE_URL}/AddEvent`,
    { Events: events },
    {
      headers: {
        'Content-Type': 'application/json',
        ...(await authHeaders()),
      },
    },
  );
  return response.data.Events;
}
export async function updateEvent(request: IEventUpdateRequest) {
  const response = await axios.post<IEventResponse>(
    `${BASE_URL}/UpdateEvent`,
    request,
    {
      headers: {
        'Content-Type': 'application/json',
        ...(await authHeaders()),
      },
    },
  );
  return response.data;
}
export async function deleteEvent(request: IEventDeleteRequest) {
  const response = await axios.post<{ deleted: boolean }>(
    `${BASE_URL}/DeleteEvent`,
    request,
    {
      headers: {
        'Content-Type': 'application/json',
        ...(await authHeaders()),
      },
    },
  );
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
  const response = await axios.get<{ Datasets: IDatasetResponse[] }>(
    `${BASE_URL}/GetDatasets`,
    {
      headers: await authHeaders(),
    },
  );
  return response.data.Datasets;
}

export async function addDataset(data: IDatasetAddRequest) {
  const response = await axios.post(`${BASE_URL}/AddDataset`, data, {
    headers: {
      'Content-Type': 'application/json',
      ...(await authHeaders()),
    },
  });
  return response.data as IDatasetResponse;
}
