<template>
  <div class="page">
    <!-- 基础数据 -->
    <div class="data-wrap">
      <div class="data-label">基础数据</div>
      <div class="data-card">
        <div
          class="card-item"
          v-for="(item, ky) in baseData"
          :key="ky">
          <div class="card-item-title">{{ item.title }}</div>
          <div class="card-item-ct">
            <span class="card-item-value" :style="{ color: item.color }">
              {{ item.value.toLocaleString() }}
            </span>
            <span class="card-item-unit">{{ item.unit }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="query-wrap">
      <el-form :model="queryForm" ref="queryForm" class="queryForm" inline>
        <el-form-item label="选择店铺">
          <el-select placeholder="选择店铺" v-model="queryForm.partnerId" size="small" @change="getBasicData">
            <el-option 
              v-for="(shop, index) in shops"
              :label="shop.partnerName"
              :value="shop.partnerId"
              :key="index">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="订单号类型" prop="orderNumType">
          <el-select v-model="queryForm.orderNumType" size="small">
            <el-option 
              v-for="(type, ky) in orderTypes"
              :label="type"
              :value="ky"
              :key="ky">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="订单号" prop="orderId">
          <el-input type="text" v-model="queryForm.orderId" placeholder="请输入订单号" size="small"></el-input>
        </el-form-item>
        <el-form-item label="创建时间" prop="creationDate" style="grid-column: 1 / span 2;">
          <el-date-picker
            v-model="creationDate"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="small"
            value-format="yyyy-MM-dd HH:mm:ss"
            clearable
            style="width:350px;">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <el-row type="flex" justify="space-between" style="margin-top:15px">
        <div class="btn-left">
          <el-button type="primary" size="small" @click="handleSearch">筛选</el-button>
          <el-button type="info" size="small" @click="handleReset">重置筛选</el-button>
        </div>
        <el-row type="flex" justify="start">
          <el-button type="primary" size="small" @click="handleOrderBatchQuery">批量查询</el-button>
          <el-button type="primary" size="small" @click="handleOrderExport">导出</el-button>
        </el-row>
      </el-row>
    </div>
    <!-- 订单列表 -->
    <el-table
      :data="orderList"
      v-loading="loading"
      border
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange">
      <el-table-column type="selection" align="center"></el-table-column>
      <el-table-column label="外平台订单号" prop="outerCode" align="center" min-width="120" fixed></el-table-column>
      <el-table-column label="当当订单号" prop="orderId" align="center" min-width="120">
        <template #default="{ row }">
          <a :href="`${orderLink}${row.orderId}`" target="_blank" style="color:#409eff;text-decoration:none">
            {{ row.orderId }}
          </a>
        </template>
      </el-table-column>
      <el-table-column label="商品ID" prop="productId" align="center"></el-table-column>
      <el-table-column align="center" width="100">
        <template #header>
          <DropdownSelect
            label="流入状态"
            :options="inflowState"
            :topOffset="19"
            v-model="queryForm.flowStatus"
            @select="handleSearch">
          </DropdownSelect>
        </template>
        <template #default="{ row }">
          <span>{{ row.flowStatusDesc }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" width="100">
        <template #header>
          <DropdownSelect
            label="订单状态"
            :options="statusMap"
            :topOffset="19"
            v-model="queryForm.orderStatus"
            @select="handleSearch">
          </DropdownSelect>
        </template>
        <template #default="{ row }">
          <span>{{ row.orderStatusDesc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="creationDate" align="center" sortable="custom" min-width="120"></el-table-column>
      <el-table-column label="最晚发货时间" prop="lastSendTime" align="center" sortable="custom" min-width="140"></el-table-column>
      <el-table-column align="center"  width="100">
        <template #header>
          <DropdownSelect
            label="发货状态"
            :options="sendStatusOptions"
            :topOffset="19"
            v-model="queryForm.sendStatus"
            @select="handleSearch">
          </DropdownSelect>
        </template>
        <template #default="{ row }">
          <span>{{ row.sendStatusDesc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="物流公司" prop="sendCompanyName" align="center"></el-table-column>
      <el-table-column label="物流单号" prop="sendPackageCode" align="center"></el-table-column>
      <el-table-column label="备注" prop="remark" align="center" fixed="right" width="130"></el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="100">
        <template #default="{ row }">
          <div v-if="row.flowStatus === 2 && row.remark.indexOf('订单中商品不存在于商品池中') > -1">
            <!-- <template v-if="row.remark.indexOf('商品池为空外平台订单号') > -1">
              <el-popconfirm
                confirm-button-text='商品映射绑定'
                cancel-button-text='取消'
                icon="el-icon-info"
                :title="`店铺名称：${shopMap[queryForm.partnerId]}，SKUID：${row.remark.split(':')[row.remark.split(':').length - 1]}`"
                @confirm="$router.push('/goods/map')">
                <el-button type="text" slot="reference">查看映射问题</el-button>
              </el-popconfirm>
            </template> -->
            <template v-if="row.remark.indexOf('订单中商品不存在于商品池中') > -1">
              <el-popconfirm
                confirm-button-text='商品映射绑定'
                cancel-button-text='取消'
                icon="el-icon-info"
                :title="getRemark(row.remark)"
                @confirm="$router.push('/goods/map')">
                <el-button type="text" slot="reference">查看映射问题</el-button>
              </el-popconfirm>
            </template>
            <el-button type="text" size="small" @click="handleTryTransfer(row)">转单重试</el-button>
          </div>
          <div v-if="row.flowStatus === 0 && row.remark.indexOf('地址映射问题') > -1">
            <el-button type="text" size="small" @click="handleModifyAddress(row)">查看地址问题</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- pagination -->
    <el-row type="flex" justify="end" style="margin:20px 0">
      <el-pagination
        background
        layout="total,prev,pager,next"
        :total="total"
        :page-size="queryForm.pageSize"
        :current-page.sync="queryForm.pageNum"
        @current-change="getList">
      </el-pagination>
    </el-row>
    <!-- 订单批量查询 -->
    <BatchOrderQuery
      :visible.sync="visible"
      :pickShop="currentShop"
      :shops="shops"
      @search="handleEmitQuery">
    </BatchOrderQuery>
    <!-- 地址映射修改 -->
    <AddressMap
      :visible.sync="addressVisible"
      :partnerId="queryForm.partnerId"
      :payload="addressPayload"
      @refresh="handleSearch">
    </AddressMap>
  </div>
</template>

<script>
import {
  GoodsShops,
} from "@/api/goods/list"
import { format } from "date-fns"
import BatchOrderQuery from "./components/BatchOrderQuery.vue"
import AddressMap from "./components/AddressMap.vue"
import {
  QueryOrdersList,
  GetBasicData,
  OrderExport,
  ResetOrderStatus
} from "@/api/orders/list"
import {
  isValid,
  saveFile,
} from "@/util"

export default {
  components: { BatchOrderQuery, AddressMap },
  data() {
    const { VUE_APP_ORDER_LINK } = process.env
    return {
      orderLink: VUE_APP_ORDER_LINK,
      visible: false,
      addressVisible: false,
      addressPayload: "",
      queryForm: {
        partnerId: "",
        orderNumType: "",
        orderId: "",
        creationDateBegin: "",
        creationDateEnd: "",
        pageSize: 10,
        pageNum: 1,
        flowStatus: "",
        orderStatus: "",
        sendStatus: "",
        sort: "",
        sortField: ""
      },
      // sort desc:降序 asc:升序
      // sortField  creationDate:订单创建时间 lastSendTime：最晚发货时间
      creationDate: [],
      shops: [],
      total: 0,
      orderList: [],
      loading: false,
      currentShop: "",
      orderTypes: {
        "": "全部",
        1: "当当订单号",
        0: "外平台订单号"
      },
      inflowState: [
        { value: "", label: "不限" },
        { value: 0, label: "待转单" },
        { value: 1, label: "转单成功" },
        { value: 2, label: "转单失败" },
        { value: 3, label: "已取消" },
      ],
      statusMap: [
        { value: "", label: "不限" },
        { value: 0, label: "未审核" },
        { value: 100, label: "已审核" },
        { value: 200, label: "已配货" },
        { value: 300, label: "已发货" },
        { value: 400, label: "已送达" },
        { value: 1000, label: "交易成功" },
        { value: 1100, label: "交易失败" },
        { value: -100, label: "取消订单" },
      ],
      sendStatusOptions: [
        { value: "", label: "不限" },
        { value: 0, label: "待发货" },
        { value: 1, label: "已发货" },
        { value: 2, label: "即将逾期" },
        { value: 3, label: "逾期发货" },
      ],
      selection: [],
      // 基础数控
      baseData: {
        stayConvertOrderCount: { title: "待转单数", value: "", unit: "单" },
        lastTenMintuesOrderCount: { title: "每十分钟流入订单数量", value: "", unit: "单" },
        todayConvertOrderCount: { title: "今日转单总数", value: "", unit: "单" },
        todaySales: { title: "今日销售额", value: "", unit: "元" },
        nearlyThirtyOrderCount: { title: "近30天转单总数", value: "", unit: "单" },
        nearlyThirtySales: { title: "近30天销售额", value: "", unit: "元" },
        nearlyOverdueOrderCount: { title: "即将逾期订单数", value: "", unit: "单", color: "#fc5757" },
        alreadyOverdueOrderCount: { title: "已逾期订单数", value: "", unit: "单", color: "#fc5757" },
      },
      // 店铺映射
      shopMap: {},
    }
  },
  beforeRouteLeave(_, from , next) {
    this.$store.commit("setPartnerId", this.queryForm.partnerId || "")
    next()
  },
  computed: {
    groupType() {
      const findedShop = this.shops.find(shop => shop.partnerId === this.queryForm.partnerId)
      return findedShop ? findedShop.groupType : ""
    },
  },
  methods: {
    // 处理备注
    getRemark(remark) {
      if (remark) {
        let productName = remark.split(",")[2]
        const shopName = `店铺名称：${this.shopMap[this.queryForm.partnerId]}`
        if (productName.slice(5).length > 10) productName = "商品名称:" + productName.slice(5, 15) + "..."
        return `${shopName}，${remark.split(",")[1]}，${productName}`
      } else return ""
    },
    formatDate(date) {
      return format(date, "yyyy-MM-dd HH:mm:ss")
    },
    getShops() {
      GoodsShops()
        .then(({ data }) => {
          // 去除天猫店铺
          this.shops = data && data.filter(item => item.groupType !== 1) || []
          this.shops.map(item => {
            this.shopMap[item.partnerId] = item.partnerName
          })
          const matchPartner = this.shops.find(item => item.partnerId === this.$store.state.partnerId)
          this.queryForm.partnerId = matchPartner ? matchPartner.partnerId : this.shops[0].partnerId
          this.getList()
          this.getBasicData()
        })
        .catch(console.warn)
    },
    // 基础数据
    getBasicData() {
      GetBasicData({ partnerId: this.queryForm.partnerId })
        .then(({ data }) => {
          if (data) {
            for (const [key, v] of Object.entries(this.baseData)) {
              v.value = data[key]
            }
          }
        })
        .catch(console.warn)
    },
    // 查询
    getList() {
      if (this.loading) return
      this.loading = true
      this.creationDate = this.creationDate || []
      const queryParams = {
        ...this.queryForm,
        creationDateBegin: this.creationDate[0],
        creationDateEnd: this.creationDate[1]
      }
      const params = Object.create(null)
      for (const [key, value] of Object.entries(queryParams)) {
        if (isValid(value)) {
          params[key] = value
        }
      }
      QueryOrdersList(params)
        .then(({ data, total }) => {
          this.orderList = data
          this.total = total
        })
        .catch(console.warn)
        .finally(() => {
          this.loading = false
        })
    },
    handleEmitQuery(v) {
      const {
        orderIds,
        orderNumType,
        partnerId
      } = v
      this.queryForm.partnerId = partnerId
      this.queryForm.orderNumType = orderNumType
      this.queryForm.orderId = orderIds
      this.handleSearch()
    },
    handleSearch() {
      this.queryForm.pageNum = 1
      this.getList()
    },
    handleReset() {
      this.$refs.queryForm.resetFields()
      this.creationDate = []
      this.queryForm.flowStatus = ""
      this.queryForm.orderStatus = ""
      this.queryForm.sendStatus = ""
    },
    // 排序查询
    handleSortChange(column) {
      const { prop, order } = column
      this.queryForm.sort = order === "ascending" ? "asc" : "desc"
      this.queryForm.sortField = prop === "lastSendTime" ? "lastSendTime" : "creationDate"
      this.getList()
    },
    // 选择
    handleSelectionChange(selection) {
      this.selection = selection.map(item => item.id)
    },
    // 导出
    handleOrderExport() {
      if (!this.selection.length) {
        return this.$message.warning("请选择导出订单")
      }
      OrderExport({ param: this.selection.join(",") })
        .then(data => {
          this.$message.success("导出成功")
          saveFile(data, "订单详情数据", "xlsx")
        })
        .catch(console.warn)
    },
    // 批量查询
    handleOrderBatchQuery() {
      this.visible = true
      if (this.queryForm.partnerId) {
        this.currentShop = `${this.queryForm.partnerId}`
      }
    },
    // 转单重试
    handleTryTransfer(row) {
      const data = {
        partnerId: this.queryForm.partnerId,  //平台ID
        orderId: row.outerCode  //外平台订单号
      }
      ResetOrderStatus(data)
        .then(({ message }) => {
          this.$message.success(message)
          this.getList()
        })
        .catch(console.warn)
    },
    // 查看地址问题
    handleModifyAddress(row) {
      this.addressVisible = true
      this.addressPayload = row.remark ? row.remark.slice(7) : ""
    },
  },
  created() {
    this.getShops()
  },
}
</script>

<style lang="scss" scoped>
.page{
  box-sizing: border-box;
  padding: 0 16px 0 0;
  background: none;
}
.query-wrap{
  background: #fff;
  box-sizing: border-box;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  padding: 16px 10px;
  // margin-bottom: 16px;
}
.queryForm{
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
.search {
  position: relative;
  .search-icon {
    position: absolute;
    top: 12px;
    right: 12px;
    color: #999999;
    cursor: pointer;
    font-size: 14px;
  }
}
.data-wrap{
  background: #fff;
  margin-bottom: 16px;
  width: 100%;
  box-sizing: border-box;
  border-radius: 8px;
  padding: 16px 10px;
  .data-label{
    font-size: 18px;
    font-weight: 600;
    padding: 8px 0;
    box-sizing: border-box;
  }
  .data-card{
    display: grid;
    grid-template-columns: repeat(auto-fill, 181px);
    gap: 20px;
    width: 100%;
    box-sizing: border-box;
    .card-item{
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      flex: none;
      box-shadow: 0 0 12px 0px rgb(0 0 0 / 10%);
      height: 80px;
      min-width: 18%;
      border-radius: 8px;
      box-sizing: border-box;
      padding: 8px;
      // filter: contrast(0.5);
      transition: all 0.2s;
      &-title {
        width: 100%;
        height: 50%;
        font-size: 12px;
        color: #141414;
        font-weight: 600;
      }
      &-ct{
        width: 100%;
        height: 50%;
        text-align: center;
        font-size: 16px;
        color: #141414c4;
      }
      &-unit{
        font-size: 12px;
      }
      &:hover {
        box-shadow: 0 0 5px 5px rgb(0 0 0 / 10%);
      }
    }
  }
}
</style>

