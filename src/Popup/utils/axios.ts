import axios from 'axios';

export async function get<T>(path: string): Promise<T> {
  const { data } = await axios.get<T>(path);
  return data;
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await axios.post<T>(path, body);
  return data;
}
