<template>
  <div :style="lineStyle">
    <v-chart class="chart" :option="option" />
  </div>
</template>

<script>
import { use, graphic } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
} from "echarts/components";
import VChart from "vue-echarts";

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  DataZoomComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

export default {
  name: "LineChart",
  components: {
    VChart,
  },
  props: {
    color: {
      type: Array,
      default: () => ["rgba(255, 66, 0, 0.76)", "rgba(255, 66, 0, 0.11)"],
    },
    xData: {
      type: Array,
      default: () => ["Mon", "Tue", "Wed", "Thu"],
    },
    yData: {
      type: Array,
      default: () => [820, 632, 301, 934],
    },
    lineStyle: {
      type: Object,
      default: () => ({ width: "370px", height: "235px" }),
    },
  },
  computed: {
    color1: function () {
      return this.color[0];
    },
    color2: function () {
      return this.color[1];
    },
  },
  data() {
    return {
      option: null,
    };
  },
  methods: {
    loadChart() {
      this.option = {
        backgroudColor: "",
        grid: {
          left: "35",
          right: "20",
          top: "8%",
          bottom: 40,
        },
        tooltip: {
          trigger: 'axis',
          backgroudColor: "rgba(5, 23, 45, 0.95)",
          borderColor: "#0B315F",
          color: "#fff",
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: this.xData,
        },
        yAxis: {
          type: "value",
          splitLine: {
            show: false,
          },
        },
        series: [
          {
            type: "line",
            data: this.yData,
            smooth: true,
            showSymbol: false,
            lineStyle: {
              width: 0,
            },
            areaStyle: {
              opacity: 0.8,
              color: new graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: this.color1,
                },
                {
                  offset: 1,
                  color: this.color2,
                },
              ]),
            },
          },
        ],
      };
    },
  },
  mounted() {
    this.loadChart();
  },
};
</script>

<style lang="scss" scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style>
