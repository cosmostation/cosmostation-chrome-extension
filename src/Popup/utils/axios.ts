import axios from 'axios';

export async function get<T>(path: string): Promise<T> {
  const { data } = await axios.get<T>(path);
  return data;
}
