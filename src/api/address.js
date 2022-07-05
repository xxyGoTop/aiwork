import {
  Addr,
} from './index';

export const getPartners = () => Addr({
  url: '/addressMap/getPartner',
});

export const getAddressList = (data) => Addr({
  url:'/addressMap/getByCondition',
  method: 'POST',
  data,
});

export const getDangAddress = (data) => Addr({
  url:'/addressMap/selectDangAddress',
  data,
  method: 'POST'
});

export const getOuterAddress = (data) => Addr({
  url:'/addressMap/selectOuterAddress',
  data,
  method: 'POST'
});

export const addOuterAddress = (data) => Addr({
  url:'/addressMap/addAddressMap',
  data,
  method: 'POST',
});

export const updateDangAddress = (params) => Addr({
  url:'/addressMap/updateDangAddress',
  params,
  method: 'POST',
});

export const updateStatusById = (params) => Addr({
  url:'/addressMap/updateStatusById',
  params,
  method: 'POST',
});
