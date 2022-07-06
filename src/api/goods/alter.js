import { OM as Fetch } from "@/api"

export const GetAlterList = data => Fetch({
  url: "/product/changeTaskQuery",
  method: "post",
  data
})

export const TaskDetailQuery = data => Fetch({
  url: "/product/changeTaskDetail",
  method:"post",
  data
})

export const TaskDetailDownload = params => Fetch({
  url: "/task/taskResult",
  params,
})