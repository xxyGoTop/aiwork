<template>
  <div class="page">
    <el-form :model="queryForm" ref="queryForm" inline label-width="82px">
      <el-row type="flex" justify="start" style="margin-bottom:15px">
        <el-col :span="8">
           <el-form-item label="选择店铺">
            <el-select placeholder="选择店铺" v-model="queryForm.partnerId" size="small" style="width:191.6px" class="shop-select" @change="handleSearch">
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
            <el-input type="text" v-model="queryForm.taskNum" placeholder="请输入任务编码" size="small" style="width:191.6px"></el-input>
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
      <div class="btn-right">
        <el-button type="primary" size="small" @click="handleBatchUnBind" v-if="isTmallShop">批量解绑映射</el-button>
        <el-button type="primary" size="small" @click="handleAddGoodsBind">新增映射绑定</el-button>
        <el-button type="primary" size="small" @click="handleAddGoodsQuery">新增映射查询</el-button>
        <!-- <el-button type="primary" @click="handleSKUQuery">SKUID查询</el-button> -->
      </div>
    </el-row>
    <!-- table -->
    <el-table :data="listInfo" v-loading="loading" border style="width:100%;margin-top:15px">
      <!-- <el-table-column type="selection"></el-table-column> -->
      <el-table-column label="任务编号" prop="taskNum" align="center">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handlePublishResult(row.subTaskType === '商品映射解绑' ? 'unbind' : 'other', row)" style="color:#0061D9">{{ row.taskNum }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="类型" prop="subTaskType" align="center"></el-table-column>
      <el-table-column label="映射绑定数" prop="taskCount" align="center"></el-table-column>
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
      <el-table-column label="创建人" prop="creator" align="center"></el-table-column>
      <el-table-column label="创建时间" prop="createDate" align="center" sortable min-width="120">
        <template #default="{ row }">
          {{ row.createDate ? formatDate(new Date(row.createDate)) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handlePublishResult(row.subTaskType === '商品映射解绑' ? 'unbind' : 'other', row)">查看结果</el-button>
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
        :page-size="queryForm.pageSize"
        :current-page="queryForm.page"
        @current-change="handleCurrentChange">
      </el-pagination>
    </el-row>

    <!-- 映射解绑 -->
    <BatchUnbindDrawer
      :visible.sync="unbindVisible"
      :pickShop="queryForm.partnerId"
      :shops="unbindShops"
      @success="handleSearch">
    </BatchUnbindDrawer>
    <!-- 映射绑定 -->
    <BatchBindDrawer
      :visible.sync="bindVisible"
      :pickShop="queryForm.partnerId"
      :shops="shops"
      @success="handleSearch">
    </BatchBindDrawer>
    <!-- 映射查询 -->
    <BatchQueryDrawer
      :visible.sync="queryVisible"
      :pickShop="queryForm.partnerId"
      :shops="shops"
      @success="handleSearch">
    </BatchQueryDrawer>

    <!-- 绑定详情 -->
    <DetailDrawer
      :visible.sync="detailVisible"
      :info="detailInfo"
      :groupType="groupType">
    </DetailDrawer>
    <!-- skuid查询 -->
    <BatchSKUQuery
      :visible.sync="skuQueryVisible"
      :pickShop="queryForm.partnerId"
      :shops="shops"
      @success="handleSearch">
    </BatchSKUQuery>
  </div>
</template>

<script>
import {
  GoodsShops,
} from "@/api/goods/list"
import {
  QueryTaskList,
  TaskStatusList
} from "@/api/goods/task"
import BatchBindDrawer from "./components/BatchBindDrawer"
import BatchUnbindDrawer from "./components/BatchUnbindDrawer"
import BatchQueryDrawer from "./components/BatchQueryDrawer"
import DetailDrawer from "./components/DetailDrawer"
import BatchSKUQuery from "./components/BatchSKUQuery"
import { format } from "date-fns"

export default {
  components: {
    BatchBindDrawer,
    BatchQueryDrawer,
    DetailDrawer,
    BatchSKUQuery,
    BatchUnbindDrawer,
  },
  data() {
    return {
      unbindVisible: false,
      bindVisible: false,
      queryVisible: false,
      detailVisible: false,
      skuQueryVisible: false,
      detailInfo: {},
      queryForm: {
        partnerId: "",
        taskNum: "",
        createDateBegin: "",
        createDateEnd: "",
        pageSize: 10,
        page: 1,
        operator: "",
        status: "",
        taskType: 105
      },
      creationDate: [],
      statusList: [],
      createPerson: [],
      shops: [],
      total: 0,
      listInfo: [],
      loading: false,
      // 解绑店铺
      unbindShops: [],
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
    isTmallShop() {
      return this.groupType === 1
    },
  },
  methods: {
    formatDate(date) {
      return format(date, "yyyy-MM-dd HH:mm:ss")
    },
    // 店铺查询
    getShops() {
      GoodsShops()
        .then(({ data }) => {
          this.shops = data || []
          this.queryForm.partnerId = this.$store.state.partnerId ? this.$store.state.partnerId : this.shops[0].partnerId
          if (this.queryForm.partnerId === -2) this.queryForm.partnerId = this.shops[0].partnerId
          this.getList()
        })
        .catch(console.warn)
    },
    // 任务状态
    getTaskStatus() {
      TaskStatusList({ taskType: 105 })
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
        if (value) {
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
    handleCurrentChange(page) {
      this.queryForm.page = page
      this.getList()
    },
    // 查看结果
    handlePublishResult(ty, row) {
      let curStatus = ""
      this.statusList.map(item => {
        if (item.name === row.status) {
          curStatus = item.status
        }
      })
      this.detailVisible = true
      this.detailInfo = Object.assign(row, {
        partnerId: this.queryForm.partnerId,
        state: curStatus,
        ty,
      })
    },
    // 批量解绑映射
    handleBatchUnBind() {
      this.unbindVisible = true
      this.unbindShops = this.shops.filter(shop => shop.groupType === 1) || []
    },
    // 新增映射绑定
    handleAddGoodsBind() {
      this.bindVisible = true
    },
    handleAddGoodsQuery() {
      this.queryVisible = true
    },
    // sku查询
    handleSKUQuery() {
      this.skuQueryVisible = true
    },
  },
  created() {
    this.getShops()
    this.getTaskStatus()
  },
}
</script>

<style lang="scss" scoped>

</style>
