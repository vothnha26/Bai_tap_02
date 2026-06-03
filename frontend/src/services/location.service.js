import api from './api.client';

export const getProvinces = async () => {
  const res = await api.get('/location/provinces');
  return res.data || res;
};

export const getWards = async (provinceCode) => {
  const res = await api.get(`/location/provinces/${provinceCode}/wards`);
  return res.data || res;
};

export default {
  getProvinces,
  getWards
};
