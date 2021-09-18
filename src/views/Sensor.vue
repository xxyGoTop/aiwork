<template>
  <section class="page-wrapper">
    <!-- 数据表格 -->
    <div class="page-container">
      <div class="page-table-header">
        <div class="page-table-header-left">
          <span class="normal">[{{ deviceName }}] 传感器数据</span>
        </div>
      </div>
      <div class="page-table-chart">
        <div class="page-table-chart-select">
          <el-select
            v-model="sensor"
            @change="handleChangeSensor"
            placeholder="传感器"
          >
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
          <line-chart
            v-if="sensor !== 'WIND_DIRECTION'"
            :key="sensor"
            :line-style="lineStyle"
            :x-data="xData"
            :y-data="yData"
            :color="color"
          >
          </line-chart>
          <wind-chart
            v-else
            :key="sensor"
            :line-style="lineStyle"
            :color="color"
            :chart-wind="chartWind"
            :x-data="xData"
            :y-data="yData"
          >
          </wind-chart>
        </div>
      </div>
      <div class="page-table">
        <!-- 表格 -->
        <h3>近一天数据</h3>
        <div class="page-table-box">
          <el-table stripe :data="list" v-loading="loading" style="width: 100%">
            <el-table-column
              type="index"
              label="序号"
              width="80"
              align="center"
            />
            <el-table-column
              prop="reportTime"
              label="时间"
              align="center"
              width="260"
            />
            <el-table-column prop="data" :label="label" align="center" />
          </el-table>
        </div>
        <el-row style="margin-top: 16px" type="flex" justify="end">
          <el-pagination
            background
            @current-change="getSensorData"
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
import WindChart from "@/components/WindChart";
import { getSensorData } from "@/api/sensor";
export default {
  components: { LineChart, WindChart },
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
      sensor: null,
      // table相关
      loading: false,
      chartWind: [],
      xData: [],
      yData: [],
      color: ["rgba(255, 66, 0, 0.76)", "rgba(255, 66, 0, 0.11)"],
      label: "温度(℃)",
      chartColor: {
        TEMP: {
          label: "温度",
          color: ["rgba(255, 66, 0, 0.76)", "rgba(255, 66, 0, 0.11)"],
          unit: "°C",
        },
        HUMIDITY: {
          label: "湿度",
          color: ["rgba(255, 174, 0, 0.76)", "rgba(255, 174, 0, 0.11)"],
          unit: "%",
          data: [810, 232, 301, 934],
        },
        FLOW_RATE: {
          label: "流速",
          color: ["rgba(0, 255, 132, 0.76)", "rgba(0, 255, 132, 0.11)"],
          unit: "m/s",
        },
        FLOW_VELOCITY: {
          label: "流量",
          color: ["rgba(0, 54, 255, 0.76)", "rgba(0, 54, 255, 0.11)"],
          unit: "m³/s",
        },
        RAINFALL: {
          label: "雨量",
          color: ["rgba(0, 222, 255, 0.76)", "rgba(0, 222, 255, 0.11)"],
          unit: "度",
        },
        WATER_LEVEL: {
          label: "水位",
          color: ["rgba(255, 0, 78, 0.76)", "rgba(255, 0, 78, 0.12)"],
          unit: "度",
        },
        WIND_SPEED: {
          label: "风速",
          color: ["rgba(0, 168, 255, 0.76)", "rgba(0, 168, 255, 0.11)"],
          unit: "m/s",
        },
        WIND_DIRECTION: {
          label: "风向",
          color: ["rgba(186, 0, 255, 0.76)", "rgba(186, 0, 255, 0.11)"],
          unit: "度",
        },
      },
      list: [],
      total: 10,
      page: 1,
      pageSize: 10,
    };
  },
  computed: {
    deviceCode() {
      return this.$route.params.code;
    },
    deviceName() {
      return this.$route.query.name;
    },
  },
  methods: {
    getSensorWind(page) {
      getSensorData({
        deviceCode: this.deviceCode,
        sensorType: "WIND_DIRECTION",
        pageNum: page,
        pageSize: this.pageSize,
      }).then((data) => {
        this.chartWind = data.data.records || [];
      });    
    },
    getSensorData(page = 1) {
      this.page = 1;
      this.loading = true;
      this.getSensorWind(page);
      getSensorData({
        deviceCode: this.deviceCode,
        sensorType: this.sensor || "TEMP",
        pageNum: page,
        pageSize: this.pageSize,
      }).then((data) => {
        this.list = data.data.records || [];
        this.total = +data.data.total || 0;
        this.yData = data.data.records.map((x) => x.data);
        this.xData = data.data.records.map((x) =>
          x.reportTime ? x.reportTime.split(" ")[1] : ""
        );
        if (!this.sensor) {
          this.sensor = "TEMP";
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    handleChangeSensor(key) {
      this.color = this.chartColor[key].color;
      this.label = `(${this.chartColor[key].label}${this.chartColor[key].unit})`;
      this.getSensorData();
    },
  },
  mounted() {
    this.getSensorData();
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
