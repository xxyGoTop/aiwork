import { Water as Fetch } from "./index";

export const getCheckListPage = (params) =>
  Fetch({
    url: "/checkin/list/page",
    params,
  });
