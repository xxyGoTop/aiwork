<template>
  <div class="page">
    <el-form :model="queryForm" ref="queryForm" inline label-width="82px">
      <el-form-item label="选择店铺">
        <el-select placeholder="选择店铺" v-model="queryForm.partnerId" @change="handleSearch" style="width:191.6px">
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
      <el-form-item label="创建人" prop="operator">
        <el-input type="text" v-model="queryForm.operator" placeholder="请输入任务创建人" size="small" style="width:191.6px"></el-input>
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
        <el-select v-model="queryForm.status" size="small" style="width:191.6px;margin-bottom:18px">
          <el-option 
            v-for="(v, ky) in statusList"
            :label="v.label"
            :value="v.value"
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
      <el-button type="primary" size="small" @click="handleAddEarlyWarn">新增价格预警</el-button>
    </el-row>
    <!-- table -->
    <el-table :data="listInfo" v-loading="loading" border style="width:100%;margin-top:15px">
      <el-table-column label="任务编号" align="center">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handleView(row)" style="color:#0061D9">
            {{ row.taskNum }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="任务名称" prop="taskName" align="center"></el-table-column>
      <el-table-column label="价格预警商品数" prop="monitorNum" align="center"></el-table-column>
      <el-table-column prop="status" align="center" min-width="100">
        <template #header>
          <DropdownSelect
            label="任务状态"
            :options="statusList"
            :topOffset="19"
            v-model="queryForm.status"
            @select="handleSearch">
          </DropdownSelect>
        </template>
        <template #default="{ row }">
          <div v-for="(v, i) in statusList" :key="i">
            <span v-if="v.value === row.status">{{ v.label }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="预警时间段" prop="timeZone" align="center" min-width="150"></el-table-column>
      <el-table-column label="创建人" prop="operator" align="center"></el-table-column>
      <el-table-column label="创建时间" prop="creationDate" align="center" min-width="120"></el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handleStop(row)" v-if="row.status === 32 || row.status === 33">停止</el-button>
          <el-button type="text" size="small" @click="handleEdit(row)" v-if="row.status === 33 || row.status === 32">编辑</el-button>
          <el-button type="text" size="small" @click="handleView(row)" v-if="row.status === 33">查看预警结果</el-button>
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
    <!-- 新增、编辑 -->
    <PriceWarn
      :visible.sync="priceVisible"
      :isAdd="isAdd"
      :pickShop="currentShop"
      :shops="shops"
      :payload="payload"
      @success="getList">
    </PriceWarn>
    <!-- 任务详情 -->
    <TaskDetail
      :visible.sync="taskVisible"
      :info="detailInfo"
      :groupType="groupType">
    </TaskDetail>
  </div>
</template>

<script>
import {
  GoodsShops,
} from "@/api/goods/list"
import {
  GetTaskList,
  StopTask,
} from "@/api/goods/warning"
import PriceWarn from "./components/PriceWarn.vue"
import TaskDetail from "./components/TaskDetail.vue"
import {
  isValid,
} from "@/util"

export default {
  components: {
    PriceWarn,
    TaskDetail,
  },
  data() {
    return {
      priceVisible: false,
      taskVisible: false,
      payload: {},
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
      },
      creationDate: [],
      statusList: [
        { value: "", label: "不限" },
        { value: 34, label: "待开始" },
        { value: 33, label: "进行中" },
        { value: 25, label: "已过期" },
        { value: 31, label: "任务终止" },
      ],
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
    getShops() {
      GoodsShops()
        .then(({ data }) => {
          this.shops = data.filter(shop => shop.groupType === 1) || []
          const isExist = this.shops.find(item => item.partnerId === this.$store.state.partnerId)
          this.queryForm.partnerId = isExist ? this.$store.state.partnerId : this.shops[0].partnerId
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
        createDateEnd: this.creationDate[1],
      }
      const params = Object.create(null)
      for (const [key, value] of Object.entries(queryParams)) {
        if (isValid(value)) params[key] = value
      }
      GetTaskList(params)
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
    // 停止
    handleStop(row) {
      const params = {
        partnerId: this.queryForm.partnerId,
        taskNum: row.taskNum,
      }
      StopTask(params)
        .then(() => {
          this.$message.success("停止任务成功")
          this.getList()
        })
        .catch(console.warn)
    },
    // 编辑
    handleEdit(row) {
      this.payload = {
        ...row,
        partnerId: +this.queryForm.partnerId,
      }
      this.priceVisible = true
      this.isAdd = false
    },
    // 新增预警
    handleAddEarlyWarn() {
      this.priceVisible = true
      this.isAdd = true
      if (this.queryForm.partnerId) {
        this.currentShop = `${this.queryForm.partnerId}`
      }
    },
    // 预警结果
    handleView(row) {
      this.detailInfo = {
        ...row,
        partnerId: this.queryForm.partnerId
      }
      this.taskVisible = true
    }
  },
  created() {
    this.getShops()
  },
}
</script>
