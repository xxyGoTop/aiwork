import { Water as Fetch } from "./index";

export const getUserGroup = (params) =>
  Fetch({
    url: "/user-group/page",
    params,
  });

export const getUserRole = (params) =>
  Fetch({
    url: "/user-role/page",
    params,
  });

export const postAddUserGroup = (data) =>
  Fetch({
    url: "/user-group/add",
    method: "post",
    data,
  });

export const postDeleteUserGroup = (data) =>
  Fetch({
    url: `/user-group/delete/${data.groupId}`,
    method: "delete",
    data,
  });

export const postUpdateUserGroup = (data) =>
  Fetch({
    url: `/user-group/update/${data.groupId}`,
    method: "post",
    data,
  });

export const getUserPage = (params = {}, data = {}) =>
  Fetch({
    url: "/user/page",
    method: "post",
    params,
    data,
  });

export const getUserLog = (params) =>
  Fetch({
    url: `/user-login-log/page/${params.userId}`,
    params,
  });

export const postAddUser = (data) =>
  Fetch({
    url: "/user/add",
    method: "post",
    data,
  });

export const postUpdateUser = (data) =>
  Fetch({
    url: `/user/update/${data.userId}`,
    method: "post",
    data,
  });

export const postDeleteUser = (data) =>
  Fetch({
    url: `/user/delete/${data.userId}`,
    method: "delete",
    data,
  });

export const postAuthLogin = (data) =>
  Fetch({
    url: "/auth/login",
    method: "post",
    data,
  });

export const postAuthLogout = (data) =>
  Fetch({
    url: "/auth/logout",
    method: "post",
    data,
  });
