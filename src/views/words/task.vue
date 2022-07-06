<template>
  <div class="page">
    <el-form :model="queryForm" ref="queryForm" inline label-width="82px">
      <el-row type="flex" justify="start" style="margin-bottom:15px">
        <el-col :span="8">
           <el-form-item label="选择平台">
            <el-select placeholder="选择平台" v-model="queryForm.platForm" size="small" style="width:191.6px" class="shop-select" @change="handleSearch">
              <el-option 
                v-for="(shop, ky) in shops"
                :label="shop"
                :value="ky"
                :key="ky">
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
        <!-- <el-button type="primary" size="small" @click="handleAddWords">新增敏感词</el-button> -->
      </div>
    </el-row>
    <!-- table -->
    <el-table :data="listInfo" v-loading="loading" border style="width:100%;margin-top:15px">
      <el-table-column label="任务编号" prop="taskNum" align="center">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handleTaskResult(row)" style="color:#0061D9">{{ row.taskNum }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="平台" prop="platForm" align="center"></el-table-column>
      <el-table-column label="任务类型" prop="taskType" align="center"></el-table-column>
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
          <div v-for="(status, index) in statusList" :key="index">
            <span v-if="+row.status === status.status">{{ status.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="预计完成时间" prop="expectTime" align="center"></el-table-column>
      <el-table-column label="实际完成时间" prop="endTime" align="center"></el-table-column>
      <el-table-column label="已处理商品" prop="successTaskCount" align="center"></el-table-column>
      <el-table-column label="创建人" prop="creator" align="center"></el-table-column>
      <el-table-column label="创建时间" prop="createDate" align="center" width="120">
        <template #default="{ row }">
          {{ row.createDate ? formatDate(new Date(row.createDate)) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <div v-if="row.taskType !== '特例品'">
            <el-button type="text" size="small" @click="handleTaskResult(row)">查看结果</el-button>
            <el-button type="text" size="small" @click="handleCancelTask(row)" v-if="(+row.status <= 3) || (+row.status === 12) ">取消任务</el-button>
          </div>
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

    <!-- 绑定详情 -->
    <DetailDrawer :visible.sync="detailVisible" :info="detailInfo"></DetailDrawer>
  </div>
</template>

<script>
import {
  QueryTaskList,
  CancelTask
} from "@/api/words/task"
import DetailDrawer from "./components/DetailDrawer"
import { format } from "date-fns"
import { hasValue } from "@/util"

export default {
  components: {
    DetailDrawer, 
  },
  data() {
    return {
      detailVisible: false,
      detailInfo: {},
      queryForm: {
        platForm: "1",
        taskNum: "",
        createDateBegin: "",
        createDateEnd: "",
        pageSize: 10,
        page: 1,
        operator: "",
        status: "",
        taskType: 109
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
        { status: 40, name: "恢复中" },
        { status: 50, name: "恢复中" },
      ],
      shops: {
        1: "天猫",
        2: "拼多多",
        3: "抖音",
        4: "快手",
        5: "小红书"
      },
      total: 0,
      listInfo: [],
      loading: false,
    }
  },
  methods: {
    formatDate(date) {
      return format(date, "yyyy-MM-dd HH:mm:ss")
    },
    // 查询
    getList() {
      if (this.loading) return
      this.loading = true
      this.creationDate = this.creationDate || []
      const queryParams = {
        ...this.queryForm,
        platForm: +this.queryForm.platForm,
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
    handleTaskResult(row) {
      this.detailVisible = true
      this.detailInfo = Object.assign({ platForm: this.queryForm.platForm }, row)
    },
    // 取消任务
    handleCancelTask(row) {
      CancelTask({ taskNum: row.taskNum })
        .then(() => {
          this.$message.success("取消任务成功")
          this.getList()
        })
        .catch(console.warn)
    },
    handleAddWords() {
      this.queryVisible = true
    },
  },
  created() {
    this.getList()
  },
}
</script>

<style lang="scss" scoped>

</style>
