import { Water as Fetch } from "./index";

export const getSensorType = (params) =>
  Fetch({
    url: `/device/${params.deviceCode}/sensorType/query`,
    params,
  });

export const getSensorData = (params) =>
  Fetch({
    url: `/device/${params.deviceCode}/sensor/${params.sensorType}/query`,
    params,
  });

export const setSensorChart = (data) =>
  Fetch({
    url: "/device/chart/sensorType",
    method: "post",
    data,
  });
