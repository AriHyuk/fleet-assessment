import client from './client';

export const getBookings    = ()     => client.get('/bookings');
export const createBooking  = (data: any) => client.post('/bookings', data);
export const previewBooking = (data: any) => client.get('/bookings/preview', { params: data });
