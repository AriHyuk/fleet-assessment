import client from './client';

export const getUnits    = (params?: Record<string, string>) => client.get('/units', { params });
export const getUnit     = (id: string | number)     => client.get(`/units/${id}`);
export const createUnit  = (data: any)   => client.post('/units', data);
export const updateUnit  = (id: string | number, data: any) => client.put(`/units/${id}`, data);
export const deleteUnit  = (id: string | number)     => client.delete(`/units/${id}`);
