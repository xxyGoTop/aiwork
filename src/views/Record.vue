<template>
  <section class="page-wrapper">
    <div class="page-container">
      <div class="page-table-header">
        <div class="page-table-header-left">
          <span class="normal">打卡记录</span>
        </div>
        <div class="page-table-header-right">
          <span class="page-table-header-right-export-icon"></span>
          <span>导出</span>
        </div>
      </div>
      <div class="page-table-form">
        <el-form :inline="true" :model="formInline" class="page-form-inline">
          <el-form-item label="人员名称">
            <el-input
              v-model="formInline.name"
              placeholder="人员名称"
            ></el-input>
          </el-form-item>
          <el-form-item label="开始时间">
            <el-date-picker
              v-model="formInline.startDate"
              type="datetime"
              placeholder="选择日期时间"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="结束时间">
            <el-date-picker
              v-model="formInline.endDate"
              type="datetime"
              placeholder="选择日期时间"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="作业类型">
            <el-select v-model="formInline.status" placeholder="作业类型">
              <el-option label="区域一" value="shanghai"></el-option>
              <el-option label="区域二" value="beijing"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="作业状态">
            <el-select v-model="formInline.status" placeholder="作业状态">
              <el-option label="区域一" value="shanghai"></el-option>
              <el-option label="区域二" value="beijing"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-left: 20px">
            <el-button type="primary">查询</el-button>
            <el-button>重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- 数据表格 -->
      <div class="page-table">
        <!-- 表格 -->
        <div class="page-table-box">
          <el-table :data="list" v-loading="loading" style="width: 100%">
            <el-table-column prop="id" label="序号" width="80" align="center" />
            <el-table-column
              prop="userId"
              label="打卡人"
              align="center"
              width="120"
            />
            <el-table-column
              prop="startTime"
              label="开始时间"
              align="center"
              width="150"
            />
            <el-table-column
              prop="endTime"
              label="结束时间"
              align="center"
              width="150"
            />
            <el-table-column prop="location" label="类型" align="center" />
            <el-table-column prop="record" label="状态" align="center">
            </el-table-column>
            <el-table-column
              prop="action"
              label="操作"
              width="180"
              align="center"
            >
              <template>
                <el-row>
                  <el-button type="text">详情</el-button>
                  <el-button type="text" @click="toRouterLink('/user/log')">
                    轨迹
                  </el-button>
                </el-row>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-row style="margin-top: 16px" type="flex" justify="end">
          <el-pagination
            background
            :page-sizes="[10, 20, 30, 40]"
            :current-page="page"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next, total"
          />
        </el-row>
      </div>
      <div class="page-container_top_bottom page-container_top_left"></div>
      <div class="page-container_top_bottom page-container_top_right"></div>
      <div class="page-container_top_bottom page-container_bottom_left"></div>
      <div class="page-container_top_bottom page-container_bottom_right"></div>
    </div>
  </section>
</template>

<script>
import { mapState } from "vuex";
import { getCheckListPage } from "@/api/record";
export default {
  data() {
    return {
      formInline: {
        name: "",
        startDate: "",
        endDate: "",
        status: "",
      },
      // table相关
      loading: false,
      list: [],
      total: 10,
      page: 1,
      pageSize: 10,
    };
  },
  computed: {
    ...mapState(["roles"]),
  },
  methods: {
    getCheckListPage(page = 1) {
      getCheckListPage({
        pageNum: page,
        pageSize: this.pageSize,
      }).then((data) => {
        this.list = data.data.records || [];
        this.total = +data.data.total || 0;
      });
    },
    toRouterLink(path) {
      this.$router.push(path);
    },
  },
  created() {
    this.getCheckListPage();
  },
};
</script>

<style lang="css" scoped></style>
