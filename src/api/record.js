import { Water as Fetch } from "./index"

export const getCheckListPage = (params = {}, data) =>
  Fetch({
    url: "/checkin/list/page",
    method: "post",
    params,
    data,
  })

export const getLocationPage = (data) =>
  Fetch({
    url: "/checkin/location/page",
    method: "post",
    data,
  })

export const getTrackRecord = (recordId) =>
  Fetch({
    url: `/checkin/track/${recordId}`,
    method: "get",
  })

export const postCheckExport = (data) =>
  Fetch({
    url: "/checkin/export",
    method: "post",
    responseType: "blob",
    data,
  })
