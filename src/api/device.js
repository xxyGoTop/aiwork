import { Water as Fetch } from "./index";

export const getDeviceList = (params) =>
  Fetch({
    url: "/device/query",
    params,
  });

export const getDeviceDetail = (params) =>
  Fetch({
    url: `/device/${params.deviceCode}/detail`,
    params,
  });

export const getDevicePage = (params) =>
  Fetch({
    url: "/device/page",
    params,
  });

export const getDeviceRaw = (params) =>
  Fetch({
    url: "/device/raw/page",
    params,
  });

export const getDeviceHisroey = (params, data) =>
  Fetch({
    url: "/device/page/history",
    method: "post",
    params,
    data,
  });

export const postDeveiceExport = (data) =>
  Fetch({
    url: "/device/export/history",
    method: "post",
    responseType: "blob",
    data,
  });

export const postDeviceAdd = (data) =>
  Fetch({
    url: "/device/add",
    method: "post",
    data,
  });

export const postDeviceUpdate = (data) =>
  Fetch({
    url: "/device/update",
    method: "post",
    data,
  });

export const postDeviceDelete = (data) =>
  Fetch({
    url: `/device/delete/${data.deviceCode}`,
    method: "delete",
    data,
  });
