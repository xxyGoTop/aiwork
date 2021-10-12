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
          <el-table
            stripe
            :data="list"
            size="small"
            v-loading="loading"
            style="width: 100%"
          >
            <el-table-column prop="id" label="序号" width="80" align="center" />
            <el-table-column label="姓名" align="center" width="110">
              <template>
                {{ name }}
              </template> </el-table-column
            >>
            <el-table-column
              prop="tel"
              label="账号"
              align="center"
              width="120"
            />
            <el-table-column
              prop="type"
              label="类型"
              align="center"
              width="130"
            >
              <template #default="{ row }">
                {{ typeMap[row.type] }}
              </template> </el-table-column
            >>
            <el-table-column prop="updateTime" label="时间" align="center">
            </el-table-column>
            <el-table-column prop="memo" label="备注" align="center">
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
            @current-change="getUserLog"
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
      pageSize: 20,
      typeMap: {
        0: "PC用户登录",
        1: "APP用户登录",
        2: "PC用户退出",
        3: "APP用户退出",
      },
    };
  },
  computed: {
    userId() {
      return this.$route.params.userId;
    },
    name() {
      return this.$route.query.name;
    },
    roleName() {
      return this.$route.query.role;
    },
  },
  methods: {
    getUserLog(page = 1) {
      this.loading = true;
      this.page = page;
      getUserLog({
        userId: this.userId,
        pageNum: page,
        pageSize: this.pageSize,
      })
        .then((data) => {
          this.list = data.data.records || [];
          this.total = +data.data.total || 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  created() {
    this.getUserLog();
  },
};
</script>

<style lang="css" scoped></style>
