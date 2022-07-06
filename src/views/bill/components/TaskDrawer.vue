<template>
  <div class="task-wrap">
    <el-drawer
      title="任务列表"
      size="900px"
      :visible="visible"
      @close="handleClose">
      <el-table :data="result.data" ref="taskList" border v-loading="loading">
        <el-table-column label="任务ID" prop="taskNum" align="center"></el-table-column>
        <el-table-column label="任务名称" prop="taskTame" align="center"></el-table-column>
        <el-table-column label="文件名称" prop="fileName" min-width="120" align="center"></el-table-column>
        <el-table-column label="状态" width="70" align="center">
          <template #default="{ row }">
            <span v-if="row.status === 0">处理中</span>
            <span v-else>完成</span>
          </template>
        </el-table-column>
        <el-table-column label="结果" prop="result" align="center">
          <template #default="{ row }">
            <span style="color:#67C23A;">成功数：</span><span>{{ row.result && row.result.successNum || 0 }}</span>,
            <span style="color:#fc5757;">失败数：</span><span>{{ row.result && row.result.errorNum || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="上传人" prop="operator" align="center"></el-table-column>
        <el-table-column label="创建时间" prop="creationDate" min-width="100" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <div class="dlbtn">
              <el-button type="text" size="small" @click="handleDownloadSourceFile(row)">下载源文件</el-button>
              <el-button style="margin:0px" type="text" size="small" v-if="row.result && row.result.errorNum && row.status === 1" @click="handleDownloadFailFile(row)">下载失败数据</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-row type="flex" justify="end">
        <el-pagination
          style="margin-top:16px"
          background
          hide-on-single-page
          layout="total, prev, pager, next"
          :total="result.total"
          :sizes="[10]"
          :current-page.sync="taskForm.page"
          :page-size="taskForm.pageSize"
          @current-change="handleTaskChange">
        </el-pagination>
      </el-row>
    </el-drawer>
  </div>
</template>

<script>
import { saveFile } from "@/util.js"
import {
  QueryTaskList,
  DownloadTaskResult,
} from "@/api/bill.js"

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    result: {
      type: Object,
      default: () => ({
        data: [],
        total: 0
      })
    }
  },
  data() {
    return {
      loading: false,
      taskForm: {
        page: 1,
        pageSize: 10, 
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit("update:visible", false)
    },
    getTaskList() {
      if (this.loading) return
      this.loading = true
      const data = {
        ...this.taskForm
      }
      QueryTaskList(data)
        .then(data => {
          this.result = data
        })
        .catch(console.warn)
        .finally(() => {
          this.loading = false
        })
    },
    handleTaskChange(pageNum) {
      this.taskForm.page = pageNum
      this.getTaskList()
    },
    handleDownloadSourceFile(row) {
      DownloadTaskResult({ key: row.uploadFile })
        .then(data => {
          const fileName = row.fileName.slice(0, row.fileName.length - 5)
          saveFile(data, fileName, "xlsx")
          this.$message.success("下载成功")
        })
        .catch(console.warn)
    },
    handleDownloadFailFile(row) {
      DownloadTaskResult({ key: row.errorFile })
        .then(data => {
          const fileName = row.fileName.slice(0, row.fileName.length - 5)
          saveFile(data, fileName + "失败数据", "xlsx")
          this.$message.success("下载成功")
        })
        .catch(console.warn)
    },
  },
}
</script>

<style lang="scss">
.task-wrap{
  .el-drawer__body{
    padding: 16px;
  }
}
</style>

<style lang="scss" scoped>
.dlbtn{
  display: flex;
  flex-direction: column;
}
</style>