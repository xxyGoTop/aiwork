<template>
  <div class="page">
    <el-form :model="queryForm" ref="queryForm" inline label-width="82px" style="margin-bottom: 16px;">
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
      <el-form-item label="任务编码" prop="taskNum">
        <el-input type="text" v-model="queryForm.taskNum" placeholder="请输入任务编码" size="small" style="width:191.6px"></el-input>
      </el-form-item>
      <el-form-item label="创建人" prop="operator" style="height:38px;">
        <el-input type="text" v-model="queryForm.operator" placeholder="请输入任务创建人" size="small" style="width:191.6px;margin-bottom:18px"></el-input>
      </el-form-item>
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
      <el-form-item label="任务状态" prop="status">
        <el-select v-model="queryForm.status" size="small" style="width:191.6px;">
          <el-option 
            v-for="(status, ky) in statusList"
            :label="status"
            :value="ky"
            :key="ky">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-row type="flex" justify="space-between">
      <div class="btn-left">
        <el-button type="primary" size="small" @click="handleSearch">筛选</el-button>
        <el-button type="info" size="small" @click="handleReset">清空筛选</el-button>
      </div>
      <el-button type="primary" size="small" @click="handleAddBlack">新增黑名单</el-button>
    </el-row>
    <!-- table -->
    <el-table :data="listInfo" v-loading="loading" border style="width:100%;margin-top:15px">
      <el-table-column label="任务编号" prop="taskNum" align="center">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handleViewResult(row)" style="color:#0061D9">{{ row.taskNum }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="黑名单商品数" prop="taskCount" align="center"></el-table-column>
      <el-table-column label="任务类型" prop="subTaskType" align="center">
        <!-- <template #default="{ row }">
          <span>{{ subTaskType[row.subTaskType] }}</span>
        </template> -->
      </el-table-column>
      <el-table-column label="任务状态" prop="status" align="center" width="80">
        <!-- <template #default="{ row }">
          <span>{{ statusList[row.status] }}</span>
        </template> -->
      </el-table-column>
      <el-table-column label="黑名单时间段" align="center" min-width="130">
        <template #default="{ row }">
          {{ row.startTime && row.endTime ? formatDate(new Date(row.startTime)) + ' ~ ' + formatDate(new Date(row.endTime)) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="创建人" prop="creator" align="center"></el-table-column>
      <el-table-column label="创建时间" align="center" min-width="120">
        <template #default="{ row }">
          {{ row.createDate ? formatDate(new Date(row.createDate)) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
        <el-button type="text" size="small" @click="handleViewResult(row)">查看结果</el-button>
        <el-button type="text" size="small" @click="handleCancelTask(row)" v-if="row.status === '执行中'">取消任务</el-button>
        <el-button type="text" size="small" @click="handleAllRemove(row)" v-if="row.status === '已完成'">全部移除</el-button>
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
        :current-page.sync="queryForm.page"
        @current-change="getList">
      </el-pagination>
    </el-row>
    <!-- 新增黑名单 -->
    <black-drawer :visible.sync="visible" :isAdd="isAdd" :pickShop="currentShop" :shops="shops" @success="getList"></black-drawer>

    <DetailDrawer :visible.sync="detailVisible" :payload="payload" :groupType="groupType"></DetailDrawer>
  </div>
</template>

<script>
import {
  GoodsShops,
} from "@/api/goods/list"
import {
  GetBlackTaskList,
  TaskCancel,
  TaskDetach,
} from "@/api/goods/black"
import DetailDrawer from "./components/DetailDrawer.vue"
import BlackDrawer from "./components/BlackDrawer.vue"
import { format } from "date-fns"

// 黑名单任务类型taskType 108
export default {
  components: { DetailDrawer, BlackDrawer },
  data() {
    return {
      visible: false,
      detailVisible: false,
      payload: {},
      queryForm: {
        partnerId: "",
        taskNum: "",
        createDateBegin: "",
        createDateEnd: "",
        pageSize: 20,
        page: 1,
        operator: "",
        status: "",
        taskType: 108
      },
      creationDate: [],
      statusList: {
        "": "不限",
        1: "执行中",
        2: "已完成",
        3: "已过期",
      },
      subTaskType: {
        1081: "商品黑名单",
        1082: "上架黑名单",
        1083: "库存黑名单",
        1084: "价格同步黑名单",
        1087: "改价黑名单",
        1086: "上架黑名单",
      },
      shops: [],
      total: 0,
      listInfo: [],
      loading: false,
      currentShop: "",
      isAdd: true,
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
          this.shops = data || []
          this.shops.push({
            groupType: 2,
            partnerId: -2,
            partnerName: "拼多多_全平台"
          })
          this.queryForm.partnerId = this.$store.state.partnerId ? this.$store.state.partnerId : this.shops[0].partnerId
          data.length && this.getList()
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
        if (value !== "" && value !== undefined) params[key] = value
      }
      GetBlackTaskList(params)
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
      this.queryForm.page = 1
      this.getList()
    },
    handleReset() {
      this.$refs.queryForm.resetFields()
      this.creationDate = []
    },
    // 查看结果
    handleViewResult(row) {
      this.detailVisible = true
      this.payload = {
        taskId: row.id,
        taskNum: row.taskNum,
        partnerId: this.queryForm.partnerId
      }
    },
    // 新增黑名单
    handleAddBlack() {
      this.visible = true
      this.currentShop = this.queryForm.partnerId
    },
    // 取消任务
    handleCancelTask(row) {
      const params = {
        id: row.id,
      }
      for (const [key, value] of Object.entries(this.subTaskType)) {
        if (row.subTaskType === value) {
          params.taskSubType = key
        }
      }
      TaskCancel(params)
        .then(() => {
          this.$message.success("任务取消成功")
          this.getList()
        })
        .catch(console.warn)
    },
    // 全部移除
    handleAllRemove(row) {
      const params = {
        id: row.id,
      }
      for (const [key, value] of Object.entries(this.subTaskType)) {
        if (row.subTaskType === value) {
          params.taskSubType = key
        }
      }
      TaskDetach(params)
        .then(() => {
          this.$message.success("移除成功")
          this.getList()
        })
        .catch(console.warn)
    }
  },
  created() {
    this.getShops()
  },
}
</script>

<style lang="scss" scoped>

</style>
