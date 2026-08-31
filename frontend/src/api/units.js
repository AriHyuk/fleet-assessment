import client from './client';

export const getUnits    = (params) => client.get('/units', { params });
export const getUnit     = (id)     => client.get(`/units/${id}`);
export const createUnit  = (data)   => client.post('/units', data);
export const updateUnit  = (id, data) => client.put(`/units/${id}`, data);
export const deleteUnit  = (id)     => client.delete(`/units/${id}`);
