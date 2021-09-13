<template>
  <section class="page-form-wrapper">
    <div class="page-form-wrap">
      <div class="page-form-content">
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
          <el-form-item style="margin-left: 8px">
            <el-button type="primary">查询</el-button>
            <el-button>重置</el-button>
          </el-form-item>
        </el-form>
        <div class="page-container_top_bottom page-container_top_left"></div>
        <div class="page-container_top_bottom page-container_top_right"></div>
        <div class="page-container_top_bottom page-container_bottom_left"></div>
        <div
          class="page-container_top_bottom page-container_bottom_right"
        ></div>
      </div>
    </div>
    <div id="container" class="map"></div>
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

<style lang="scss" scoped>
.page-form-wrapper,
.map {
  width: 100%;
  min-height: 100%;
}
.page-form-wrapper {
  position: relative;
}
.page-form-wrap {
  position: absolute;
  top: 100px;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 0px 24px;
  .page-form-content {
    position: relative;
    background: rgba(5, 23, 45, 0.65);
    border: 1px solid #003b7a;
    padding: 31px 26px 9px;
  }
}
</style>
