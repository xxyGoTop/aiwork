<template>
  <section class="page-wrapper">
    <!-- 数据表格 -->
    <div class="page-container">
      <div class="page-table-header">
        <div class="page-table-header-left">
          <span class="normal"
            >[拉萨河闸站光理所3号闸水流量检测站] 传感器数据</span
          >
        </div>
      </div>
      <div class="page-table-chart">
        <div class="page-table-chart-select">
          <el-select v-model="sensor" placeholder="传感器">
            <el-option
              v-for="sensor in sensorsForm"
              :key="sensor.value"
              :label="sensor.key"
              :value="sensor.value"
            >
            </el-option>
          </el-select>
        </div>
        <div class="page-table-chart-content">
          <line-chart :line-style="lineStyle"></line-chart>
        </div>
      </div>
      <div class="page-table">
        <!-- 表格 -->
        <h3>近一天数据</h3>
        <div class="page-table-box">
          <el-table stripe :data="list" v-loading="loading" style="width: 100%">
            <el-table-column prop="id" label="序号" width="80" align="center" />
            <el-table-column
              prop="name"
              label="时间"
              align="center"
              width="110"
            />
            <el-table-column prop="account" label="温度(℃)" align="center" />
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
import LineChart from "@/components/LineChart";
import { getUserLog } from "@/api/user";
export default {
  components: { LineChart },
  data() {
    return {
      lineStyle: { width: "100%", height: "300px" },
      sensorsForm: [
        {
          key: "温度",
          value: "TEMP",
        },
        {
          key: "湿度",
          value: "HUMIDITY",
        },
        {
          key: "风速",
          value: "WIND_SPEED",
        },
        {
          key: "风向",
          value: "WIND_DIRECTION",
        },
        {
          key: "雨量",
          value: "RAINFALL",
        },
        {
          key: "水位",
          value: "WATER_LEVEL",
        },
        {
          key: "流速",
          value: "FLOW_RATE",
        },
        {
          key: "流量",
          value: "FLOW_VELOCITY",
        },
      ],
      sensor: "TEMP",
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

<style lang="scss" scoped>
.page-table {
  h3 {
    font-size: 18px;
    font-family: OPPOSans;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 28px;
  }
  &-chart-content {
    width: 100%;
  }
}
</style>
