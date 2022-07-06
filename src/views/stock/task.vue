<template>
  <div class="page">
    <el-form :model="queryForm" ref="queryForm" inline label-width="82px">
      <el-row type="flex" justify="start" style="margin-bottom:15px">
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
          <el-form-item label="任务编号" prop="taskNum">
            <el-input v-model="queryForm.taskNum" placeholder="请输入任务编号" type="text" size="small" style="width:191.6px"></el-input>
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
      <el-button type="primary" size="small" @click="handleAddStock">新增锁库存</el-button>
    </el-row>

    <!-- table -->
    <el-table :data="listInfo" v-loading="loading" border style="width:100%;margin-top:15px">
      <el-table-column label="任务编号" prop="taskNum" align="center">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handlePublishResult(row)" style="color: #0061D9;">{{ row.taskNum }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="锁库存类型" prop="subTaskType" align="center" v-if="groupType === 1">
        <!-- <template #default="{ row }">
          <span v-if="row.subTaskType">
            {{  (+row.subTaskType === 2022) ? '自动锁库存' : '单次锁库存' }}
          </span>
        </template> -->
      </el-table-column>
      <el-table-column label="锁库存商品数" prop="taskCount" align="center" min-width="80"></el-table-column>
      <el-table-column label="任务状态" prop="status" align="center" min-width="100">
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
          <span>{{ row.status }}</span>
        </template>
      </el-table-column>
      <el-table-column label="锁库存时间段" prop="createDate" align="center" min-width="220">
        <template #default="{ row }">
          {{ row.startTime }} ~ {{ row.endTime }}
        </template>        
      </el-table-column>
      <el-table-column label="创建人" prop="creator" align="center"></el-table-column>
      <el-table-column label="创建时间" prop="createDate" align="center" min-width="120">
        <template #default="{ row }">
          {{ row.createDate ? formatDate(new Date(row.createDate)) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150">
        <template #default="{ row }">
          <el-row type="flex" align="middle">
            <span class="button-ctrl-danger" @click="handlePublishResult(row)">查看结果</span>
            <el-popconfirm title="确定全部解锁吗？" @confirm="handleRemoveLock(row)">
              <template #reference>
                <div class="button-ctrl-danger">全部解锁</div>
              </template>
            </el-popconfirm>
            <!-- <span class="button-ctrl-danger" @click="handleLockUp(row)">补锁</span> -->
            <!-- <span class="button-ctrl-danger" @click="handleLockEdit(row)" v-if="row.status === '初始化'">编辑</span> -->
          </el-row>
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
        :page-sizes="[10, 20, 30]"
        :page-size="queryForm.pageSize"
        :current-page="queryForm.page"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange">
      </el-pagination>
    </el-row>
    <!-- 锁库存 -->
    <lock-stock-drawer
      :shops="shops"
      :title="title"
      :row="rows"
      :products="products"
      :stock-title="stockTitle"
      :lock-form="lockForm"
      :visible.sync="visible"
      :disabled="disabled"
      :edit-status="editStatus"
      :edited="edited"
      :lock-type="lockType"
      :doading="stockLoading"
      @refresh="getList">
    </lock-stock-drawer>
    <!-- 发布详情 -->
    <detail-drawer
      :visible.sync="detailVisible"
      :info="detailInfo">
    </detail-drawer>
  </div>
</template>

<script>
import {
  releaseStockLockTask,
  queryStockByTaskId,
  QueryTaskList,
} from "@/api/stock"
import {
  TaskStatusList,
} from "@/api/goods/task"
import {
  GoodsShops,
} from "@/api/goods/list"
import { format } from "date-fns"
import DetailDrawer from "./components/DetailDrawer"
import LockStockDrawer from "./components/LockStockDrawer"
import {
  hasValue,
  isValid,
} from "@/util"

export default {
  components: { LockStockDrawer, DetailDrawer },
  data() {
    return {
      queryForm: {
        partnerId: "",
        taskNum: "",
        createDateBegin: "",
        createDateEnd: "",
        pageSize: 10,
        page: 1,
        operator: "",
        status: "",
        taskType: 202
      },
      lockForm: {
        partnerId: null,
        stockDate: "",
      },
      creationDate: [],
      shops: [],
      statusList: [],
      total: 0,
      listInfo: [],
      visible: false,
      loading: false,
      title: "新增锁库存",
      stockTitle: "首次锁库存",
      disabled: false,
      detailInfo: {},
      detailVisible: false,
      editStatus: 1,
      edited: 0,
      lockType: {},
      stockLoading: false,
      products: [],
      rows: null,
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
    hasValue,
    formatDate(date) {
      return format(date, "yyyy-MM-dd HH:mm:ss")
    },
    getShops() {
      GoodsShops()
        .then(({ data }) => {
          this.shops = data || []
          this.queryForm.partnerId = this.$store.state.partnerId ? this.$store.state.partnerId : this.shops[0].partnerId
          this.getList()
        })
        .catch(console.warn)
    },
    // 任务状态
    getTaskStatus() {
      TaskStatusList({ taskType: 202 })
        .then(({ data }) => {
          this.statusList = [
            { status: "", name: "不限" },
            ...data,
          ]
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
        if (isValid(value)) {
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
      this.queryForm.page = 1
      this.getList()
    },
    handleReset() {
      this.$refs.queryForm.resetFields()
      this.creationDate = []
    },
    handleSizeChange(pagesize) {
      this.queryForm.pageSize = pagesize
      this.getList()
    },
    handleCurrentChange(page) {
      this.queryForm.page = page
      this.getList()
    },
    // 查看任务结果
    handleTaskResult(row) {
      const routeData = this.$router.resolve({
        path: "/stock/list",
        query: {
          taskNum: row.taskNum,
        },
      })
      window.open(routeData.href, "_blank")
    },
    handleAddStock() {
      const { partnerId } = this.queryForm
      this.lockForm = {
        partnerId,
        stockDate: "",
      }
      this.title = "新增锁库存"
      this.stockTitle = "首次锁库存"
      this.disabled = false
      this.visible = true
      this.editStatus = 1
      this.lockType = {}
    },
    handleLockUp(row) {
      const { partnerId } = this.queryForm
      this.lockForm = {
        partnerId,
        stockDate: [row.startTime, row.endTime],
      }
      this.title = "补锁库存"
      this.stockTitle = "补锁锁库存"
      this.disabled = true
      this.visible = true
      this.editStatus = row.uploadFile ? 3 : 1
      this.lockType = {}
      this.edited = 0
      this.rows = [{...row}]
      if (!row.uploadFile) {
        this.queryStockByTaskId(row, 0)
      }
    },
    handleLockEdit(row) {
      const { partnerId } = this.queryForm
      this.lockForm = {
        partnerId,
        stockDate: [row.startTime, row.endTime],
      }
      this.title = "编辑锁库存"
      this.stockTitle = "补锁锁库存"
      this.disabled = true
      this.visible = true
      this.editStatus = row.uploadFile ? 3 : 1
      this.lockType = {}
      this.edited = 1
      this.rows = [{...row}]
      if (!row.uploadFile) {
        this.queryStockByTaskId(row, 1)
      }
    },
    handleRemoveLock({ taskNum }) {
      const { partnerId } = this.queryForm
      releaseStockLockTask({
        partnerId,
        taskNum,
      }).then(() => {
        this.$message.success("提交成功")
        this.getList()
      })
    },
    // 查看发布结果
    handlePublishResult(row) {
      this.detailInfo = Object.assign(row, { partnerId: this.queryForm.partnerId })
      this.detailVisible = !this.detailVisible
    },
    // 任务
    queryStockByTaskId({ id }, edited = 0) {
      const { partnerId } = this.queryForm
      this.stockLoading = true
      queryStockByTaskId({
        partnerId,
        taskId: id,
      }).then(data => {
        const products = []
        data.data.forEach(good => {
          let stocks = []
          if (good.productName) {
            good.stocks.forEach(stock => {
              if (stock.stockLockFlag && edited === 0) {
                stocks.push({
                  ...stock,
                  lockType: 2,
                })
              } else if (!stock.stockLockFlag && edited === 1) {
                stocks.push({
                  ...stock,
                  lockType: 1,
                })
              }
            })
          }
          if (stocks.length) {
            products.push({
              ...good,
              stocks,
            })
          }
        })
        this.products = products
      }).finally(() => {
        this.stockLoading = false
      })
    },
  },
  created() {
    this.getShops()
    this.getTaskStatus()
  },
}
</script>

<style lang="scss" scoped>
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
.shop-select {
  width: 195px;
  margin-right: 15px;
}
.sotck-action {
  margin: 8px 0px;
}
</style>
