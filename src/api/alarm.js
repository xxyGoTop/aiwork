import { Water as Fetch } from "./index";

export const getAlarmList = (params, data = {}) =>
  Fetch({
    url: "/alarm/list/page",
    method: "post",
    params,
    data,
  });

export const getAlarmPageAll = (params) =>
  Fetch({
    url: "/alarm/page/all",
    params,
  });

export const getAlarmType = (params) =>
  Fetch({
    url: "/alarm/alarm/type",
    params,
  });

export const postAddAlarm = (data = {}) =>
  Fetch({
    url: "/alarm/add/rule",
    method: "post",
    data,
  });

export const postEditAlarm = (data = {}) =>
  Fetch({
    url: "/alarm/edit/rule",
    method: "post",
    data,
  });