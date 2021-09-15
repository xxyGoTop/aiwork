import { Water as Fetch } from "./index";

export const getAlarmList = (params, data = {}) =>
  Fetch({
    url: "/alarm/list/page",
    method: "post",
    params,
    data,
  });

export const getAlarmRulePage = (params, data = {}) =>
  Fetch({
    url: "/alarm/rule/page",
    method: "post",
    params,
    data,
  });

export const getAlarmType = (params) =>
  Fetch({
    url: "/alarm/alarm/type",
    params,
  });

export const postAlarmExport = (data) =>
  Fetch({
    url: "/alarm/export",
    method: "post",
    responseType: "blob",
    data,
  });

export const postDeleteAlarm = (data = {}) =>
  Fetch({
    url: `/alarm/delete/${data.ruleId}`,
    method: "delete",
    data,
  });

export const postAddAlarm = (data = {}) =>
  Fetch({
    url: "/alarm/add/rule",
    method: "post",
    data,
  });

export const postEditAlarm = (data = {}) =>
  Fetch({
    url: "/alarm/update",
    method: "post",
    data,
  });