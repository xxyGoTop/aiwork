<template>
  <section class="page-wrapper">
    <!-- 数据表格 -->
    <div class="page-container">
      <div class="page-table-header">
        <div class="page-table-header-left">
          <span class="normal">登录记录</span>
        </div>
      </div>
      <div class="page-table">
        <!-- 表格 -->
        <div class="page-table-box">
          <el-table stripe :data="list" v-loading="loading" style="width: 100%">
            <el-table-column prop="id" label="序号" width="80" align="center" />
            <el-table-column
              prop="name"
              label="姓名"
              align="center"
              width="110"
            />
            <el-table-column
              prop="account"
              label="账号"
              align="center"
              width="110"
            />
            <el-table-column
              prop="type"
              label="类型"
              align="center"
              width="110"
            />
            <el-table-column prop="updateTime" label="时间" align="center">
            </el-table-column>
            <el-table-column prop="memo" label="备注" align="center">
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
            layout="total, prev, pager, next"
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
import { getUserLog } from "@/api/user";
export default {
  data() {
    return {
      // table相关
      loading: false,
      list: [],
      total: 10,
      page: 1,
      pageSize: 10,
    };
  },
  methods: {
    getUserLog(page = 1) {
      getUserLog({
        pageNum: page,
        pageSize: this.pageSize,
      }).then((data) => {
        this.list = data.data.records || [];
        this.total = +data.data.total || 0;
      });
    },
  },
  created() {
    this.getUserLog();
  },
};
</script>

<style lang="css" scoped></style>
