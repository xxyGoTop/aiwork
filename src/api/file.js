import { File as Fetch } from "@/api"

export const TasksQuery = (data) => Fetch({
  url: "/file/task/pageQuery",
  method: "post",
  data,
})

export const TaskDL = (params) => Fetch({
  url: "/file/download",
  params,
  responseType: "blob",
})
