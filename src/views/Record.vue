<template>
  <section class="page-wrapper">
    <div class="page-container">
      <div class="page-table-header">
        <div class="page-table-header-left">
          <span class="normal">打卡记录</span>
        </div>
        <div class="page-table-header-right" @click="postCheckExport()">
          <span class="page-table-header-right-export-icon"></span>
          <span>导出</span>
        </div>
      </div>
      <div class="page-table-form">
        <el-form
          ref="form"
          :inline="true"
          :model="formInline"
          class="page-form-inline"
        >
          <el-form-item label="用户名" prop="userId">
            <el-select v-model="formInline.userId" placeholder="用户名">
              <el-option label="全部" value=""></el-option>
              <el-option
                v-for="user in users"
                :key="user.id"
                :label="user.name"
                :value="user.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="formInline.startTime"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="datetime"
              placeholder="选择日期时间"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="formInline.endTime"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="datetime"
              placeholder="选择日期时间"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="作业类型" prop="workStatus">
            <el-select v-model="formInline.workType" placeholder="作业状态">
              <el-option label="全部" value=""></el-option>
              <el-option label="值班打卡" :value="0"></el-option>
              <el-option label="巡逻打卡" :value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="作业状态" prop="workType">
            <el-select v-model="formInline.workStatus" placeholder="作业类型">
              <el-option label="全部" value=""></el-option>
              <el-option label="执行中" :value="0"></el-option>
              <el-option label="已结束" :value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-left: 20px">
            <el-button type="primary" @click="getCheckListPage()"
              >查询</el-button
            >
            <el-button @click="handleReset()">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- 数据表格 -->
      <div class="page-table">
        <!-- 表格 -->
        <div class="page-table-box">
          <el-table
            stripe
            :data="list"
            size="small"
            v-loading="loading"
            style="width: 100%"
          >
            <el-table-column prop="id" label="序号" width="80" align="center" />
            <el-table-column
              prop="name"
              label="打卡人"
              align="center"
              width="120"
            />
            <el-table-column prop="startTime" label="开始时间" align="center" />
            <el-table-column prop="endTime" label="结束时间" align="center" />
            <el-table-column
              prop="workType"
              label="类型"
              width="150"
              align="center"
            />
            <el-table-column
              prop="workStatus"
              label="状态"
              width="150"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="action"
              label="操作"
              width="180"
              align="center"
            >
              <template #default="{ row }">
                <el-row>
                  <el-button type="text" @click="handleDetail(row)"
                    >详情</el-button
                  >
                  <el-button
                    type="text"
                    @click="
                      toRouterLink(
                        `/check/way/${row.id}?userId=${row.userId}&start=${row.startTime}&end=${row.endTime}&workType=${row.workTypeId}&workStatus=${row.workStatusId}`
                      )
                    "
                  >
                    轨迹
                  </el-button>
                </el-row>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-row
          class="page-pagt-wrap"
          style="margin-top: 16px"
          type="flex"
          justify="center"
        >
          <el-pagination
            background
            @current-change="getCheckListPage"
            :current-page="page"
            :page-size="pageSize"
            :total="total"
            :hide-on-single-page="true"
            layout="total, prev, pager, next"
          />
        </el-row>
      </div>
      <!-- 背景图 -->
      <div class="page-container-top_bg"></div>
      <div class="page-container-bottom_bg"></div>
      <div class="page-container-left_bg"></div>
    </div>
    <!-- 详情 -->
    <el-dialog
      :visible.sync="visible"
      :append-to-body="true"
      custom-class="page-table-dialog"
      title="打卡详情"
      center
    >
      <el-form status-icon label-width="130px" class="user-form">
        <el-form-item label="打卡人：">
          <el-input v-model="detail.name"></el-input>
        </el-form-item>
        <el-form-item label="开始时间：">
          <el-input v-model="detail.startTime"></el-input>
        </el-form-item>
        <el-form-item label="结束时间：">
          <el-input v-model="detail.endTime"></el-input>
        </el-form-item>
        <el-form-item label="作业类型：">
          <el-input v-model="detail.workType"></el-input>
        </el-form-item>
        <el-form-item label="作业状态：">
          <el-input v-model="detail.workStatus"></el-input>
        </el-form-item>
        <el-form-item label="备注：">
          <el-input v-model="detail.record"></el-input>
        </el-form-item>
      </el-form>
      <div class="page-container_top_bottom page-container_top_left"></div>
      <div class="page-container_top_bottom page-container_top_right"></div>
      <div class="page-container_top_bottom page-container_bottom_left"></div>
      <div class="page-container_top_bottom page-container_bottom_right"></div>
    </el-dialog>
  </section>
</template>

<script>
import { mapState } from "vuex"
import { getCheckListPage, postCheckExport } from "@/api/record"
import { downBlobFile } from "@/util"
export default {
  data() {
    return {
      formInline: {
        userId: "",
        startTime: "",
        endTime: "",
        workStatus: "",
        workType: "",
      },
      detail: {},
      // table相关
      visible: false,
      loading: false,
      list: [],
      total: 10,
      page: 1,
      pageSize: 10,
    }
  },
  computed: {
    ...mapState(["users"]),
  },
  methods: {
    getCheckListPage(page = 1) {
      this.page = page
      this.loading = true
      getCheckListPage(
        {
          pageNum: page,
          pageSize: this.pageSize,
        },
        {
          ...this.formInline,
        }
      )
        .then((data) => {
          this.list = data.data.records || []
          this.total = +data.data.total || 0
        })
        .finally(() => {
          this.loading = false
        })
    },
    postCheckExport() {
      postCheckExport({
        ...this.formInline,
      }).then((data) => {
        downBlobFile(data, "打卡记录.xlsx")
      })
    },
    handleReset() {
      this.$refs.form.resetFields()
    },
    handleDetail(row) {
      this.visible = true
      this.detail = row
    },
    toRouterLink(path) {
      this.$router.push(path)
    },
  },
  created() {
    this.getCheckListPage()
  },
}
</script>

<style lang="css" scoped></style>
