<template>
  <div class="page">
    <el-form :model="queryForm" ref="queryForm" inline label-width="82px">
      <el-row type="flex" justify="start" style="margin-bottom:15px">
        <el-form-item label="选择店铺">
          <el-select placeholder="选择店铺" v-model="queryForm.partnerId" size="small" style="width:260px" class="shop-select">
            <el-option
              v-for="(shop, index) in shops"
              :label="shop.partnerName"
              :value="shop.partnerId"
              :key="index">
            </el-option>
          </el-select>
        </el-form-item>
      </el-row>
      <el-row type="flex" align="middle" style="margin-bottom:16px">
        <el-form-item label="当当订单号" prop="orderIds">
          <el-input
            v-model="queryForm.orderIds"
            placeholder="请输入当当订单号，多个请用逗号隔开，最多支持50个订单重新转单"
            type="textarea"
            rows="5"
            style="width:600px">
          </el-input>
        </el-form-item>
      </el-row>
    </el-form>
    <div class="btn-left">
      <el-button
        type="primary"
        size="small"
        @click="orderConvertHandle"
        :loading="loading">
        重新转单
      </el-button>
    </div>
  </div>
</template>

<script>
import {
  orderConvert,
} from "@/api/orders/convert"
import {
  GoodsShops,
} from "@/api/goods/list"

export default {
  data() {
    return {
      queryForm: {
        partnerId: "",
        orderIds: "",
      },
      shops: [],
      loading: false,
    }
  },
  methods: {
    getShops() {
      GoodsShops()
        .then(({ data }) => {
          this.shops = data || []
          this.queryForm.partnerId = data && data.length ? data[0].partnerId : ""
        })
        .catch(console.warn)
    },
    // 订单转单
    orderConvertHandle() {
      if (!this.queryForm.orderIds) return
      if (!/^[\d,\s]*$/.test(this.queryForm.orderIds)) {
        return this.$message.warning("请输入正确格式的订单号，多个用英文逗号隔开")
      }
      const orderIds = this.queryForm.orderIds.split(",").filter(i => i)
      if (orderIds.length > 50) {
        return this.$message.warning("最多支持50个订单重新转单")
      }
      if (this.loading) return
      this.loading = true
      const queryParams = {
        partnerId: this.queryForm.partnerId,
        orderIds: this.queryForm.orderIds
      }
      orderConvert(queryParams)
        .then(({ data, code, message }) => {
          if (code == 200) {
            this.$message.success(data)
          } else {
            this.$message.error(message)
          }
        })
        .catch(console.warn)
        .finally(() => {
          this.loading = false
        })
    },
  },
  created() {
    this.getShops()
  },
}
</script>

<style lang="scss" scoped>
.btn-left{
  margin-left: 82px;
}
</style>