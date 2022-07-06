import { OM as Fetch } from "@/api"

//订单重新转单
export const orderConvert = (data) => Fetch({
  url: "/order/convert",
  data,
  method: "post",
})