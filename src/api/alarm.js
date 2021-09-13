import { Water as Fetch } from "./index";

export const getAlarmList = (params) =>
  Fetch({
    url: "/alarm/list/page",
    params,
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
