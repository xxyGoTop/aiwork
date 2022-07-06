<template>
  <div class="page">
    <el-form :model="queryForm" ref="queryForm" inline label-width="82px">
      <el-row type="flex" justify="space-between" style="margin-bottom:15px">
        <el-col :span="8">
          <el-form-item label="选择店铺">
            <el-select placeholder="选择店铺" v-model="queryForm.partnerId" size="small" style="width:191.6px" class="shop-select">
              <el-option 
                v-for="(shop, index) in shops"
                :label="shop.partnerName"
                :value="shop.partnerId"
                :key="index">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="任务编码" prop="taskNum">
            <el-input v-model="queryForm.taskNum" placeholder="请输入任务编码" type="text" size="small" style="width:191.6px"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="创建人" prop="operator">
            <el-input type="text" v-model="queryForm.operator" placeholder="请输入任务创建人" size="small" style="width:191.6px"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row type="flex" justify="start" align="middle" style="margin-bottom:16px">
        <el-form-item label="创建时间" prop="creationDate">
          <el-date-picker
            v-model="creationDate"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="small"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width:350px;">
          </el-date-picker>
        </el-form-item>
      </el-row>
    </el-form>
    <el-row type="flex" justify="space-between">
      <div class="btn-left">
        <el-button type="primary" size="small" @click="handleSearch">筛选</el-button>
        <el-button type="info" size="small" @click="handleReset">清空筛选</el-button>
      </div>
      <el-button type="primary" size="small" @click="handleAddPrice">新增商品改价</el-button>
    </el-row>
    <!-- table -->
    <el-table :data="listInfo" v-loading="loading" border style="width:100%;margin-top:15px">
      <!-- <el-table-column type="selection"></el-table-column> -->
      <el-table-column label="任务编号" prop="taskNum" align="center">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handlePriceResult(row)" style="color:#0061D9">{{ row.taskNum }}</el-button>
        </template>
      </el-table-column>
      <!-- <el-table-column label="是否可被覆盖" prop="ext" align="center"></el-table-column> -->
      <el-table-column label="开始时间" prop="startTime" align="center"></el-table-column>
      <el-table-column label="结束时间" prop="endTime" align="center"></el-table-column>
      <el-table-column label="改价商品数" prop="changeNum" align="center"></el-table-column>
      <el-table-column label="任务状态" prop="status" align="center">
        <template #header>
          <DropdownSelect
            label="任务状态"
            :options="statusList"
            labelKey="name"
            valueKey="status"
            :topOffset="19"
            v-model="queryForm.status"
            @select="handleSearch">
          </DropdownSelect>
        </template>
        <template #default="{ row }">
          <div
            v-for="(item, key) in statusList"
            :key="key">
            <span v-if="row.status === item.status">{{ item.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="改价成功商品数" prop="successNum" align="center"></el-table-column>
      <el-table-column label="创建人" prop="operator" align="center" width="100"></el-table-column>
      <el-table-column label="创建时间" prop="creationDate" align="center">
        <template #default="{ row }">
          {{ row.creationDate ? formatDate(new Date(row.creationDate)) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="120">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handleStopUpdatePrice(row)" v-if="row.status === 3">停止</el-button>
          <el-button type="text" size="small" @click="handleDelPrice(row)" v-if="row.status === 0 || row.status === 1 || row.status === 2">删除</el-button>
          <el-button type="text" size="small" @click="handlePriceResult(row)">查看改价结果</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- pagination -->
    <el-row type="flex" justify="end" style="margin:20px 0">
      <el-pagination
        background
        hide-on-single-page
        layout="total,prev,pager,next"
        :total="total"
        :page-sizes="[10]"
        :page-size="queryForm.pageSize"
        :current-page.sync="queryForm.curPage"
        @current-change="getList">
      </el-pagination>
    </el-row>
    <!-- 改价 -->
    <BatchDrawer :visible.sync="visible" :pickShop="currentShop" :shops="shops" @success="handleSearch"></BatchDrawer>
    <!-- 改价详情 -->
    <DetailDrawer :visible.sync="detailVisible" :info="detailInfo" :groupType="groupType"></DetailDrawer>
  </div>
</template>

<script>
import {
  GoodsShops,
} from "@/api/goods/list"
import {
  QueryTaskList,
  StopPriceTask,
  DelPriceTask,
} from "@/api/goods/price"
import BatchDrawer from "./components/BatchDrawer"
import DetailDrawer from "./components/DetailDrawer"
import { format } from "date-fns"
import { hasValue } from "@/util"

export default {
  components: {
    BatchDrawer,
    DetailDrawer,
  },
  data() {
    return {
      visible: false,
      detailVisible: false,
      detailInfo: {},
      queryForm: {
        partnerId: "",
        taskNum: "",
        createDateBegin: "",
        createDateEnd: "",
        pageSize: 10,
        curPage: 1,
        operator: "",
        status: "",
        // taskType: 103
      },
      creationDate: [],
      // 任务状态
      statusList: [
        { status: "", name: "不限" },
        { status: 0, name: "初始化" },
        { status: 1, name: "处理中" },
        { status: 2, name: "解析进行中" },
        { status: 3, name: "待处理" },
        { status: 10, name: "部分成功" },
        { status: 11, name: "全部成功" },
        { status: 12, name: "解析完成" },
        { status: 20, name: "部分失败" },
        { status: 21, name: "全部失败" },
        { status: 22, name: "解析失败" },
        { status: 30, name: "系统异常" },
        { status: 25, name: "已过期" },
        //商品改价任务才会使用
        { status: 40, name: "恢复中" },
      ],
      createPerson: [],
      shops: [],
      total: 0,
      listInfo: [],
      loading: false,
      currentShop: ""
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
    formatDate(date) {
      return format(date, "yyyy-MM-dd HH:mm:ss")
    },
    getShops() {
      GoodsShops()
        .then(({ data }) => {
          if (data?.length) {
            this.shops = data.filter(item => (item.groupType === 1 || item.groupType === 2 || item.groupType === 3))
            this.shops.push({
              groupType: 2,
              partnerId: -2,
              partnerName: "拼多多_全平台"
            })
            const matchPartner = this.shops.find(item => item.partnerId === this.$store.state.partnerId)
            this.queryForm.partnerId = matchPartner ? matchPartner.partnerId : this.shops[0].partnerId
            this.getList()
          } else {
            this.shops = []
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
        createDateBegin: this.creationDate[0],
        createDateEnd: this.creationDate[1]
      }
      const params = Object.create(null)
      for (const [key, value] of Object.entries(queryParams)) {
        if (hasValue(value)) {
          params[key] = value
        }
      }
      QueryTaskList(params)
        .then(({ data, total }) => {
          this.listInfo = data
          this.total = total
        })
        .catch(console.warn)
        .finally(() => {
          this.loading = false
        })
    },
    handleSearch() {
      this.queryForm.curPage = 1
      this.getList()
    },
    handleReset() {
      this.$refs.queryForm.resetFields()
      this.creationDate = []
    },
    handleAddPrice() {
      this.visible = true
      if (this.queryForm.partnerId) {
        this.currentShop = `${this.queryForm.partnerId}`
      }
    },
    // 停止改价
    handleStopUpdatePrice(row) {
      const data = {
        taskNum: row.taskNum,
        partnerId: this.queryForm.partnerId
      }
      StopPriceTask(data)
        .then(() => {
          this.$message.success("停止改价成功")
          this.getList()
        })
        .catch(console.warn)
    },
    // 删除
    handleDelPrice(row) {
      const data = {
        taskNum: row.taskNum,
        partnerId: this.queryForm.partnerId
      }
      DelPriceTask(data)
        .then(() => {
          this.$message.success("改价任务删除成功")
          this.getList()
        })
        .catch(console.warn)
    },
    // 查看结果
    handlePriceResult(row) {
      this.detailVisible = true
      this.detailInfo = Object.assign(row, { partnerId: this.queryForm.partnerId })
    },
  },
  created() {
    this.getShops()
  },
}
</script>

<style lang="scss" scoped>

</style>
