import client from './client';

export const getBookings    = ()     => client.get('/bookings');
export const createBooking  = (data) => client.post('/bookings', data);
export const previewBooking = (data) => client.get('/bookings/preview', { params: data });
