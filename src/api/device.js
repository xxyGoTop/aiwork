import { Water as Fetch } from "./index";

export const getDeviceList = (params) =>
  Fetch({
    url: "/device/query",
    params,
  });

export const getDeviceRaw = (params) =>
  Fetch({
    url: "/device/raw/page",
    params,
  });

export const getDeviceHisroey = (params) =>
  Fetch({
    url: "/device/page/history",
    params,
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
