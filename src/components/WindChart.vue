<template>
  <div :style="lineStyle">
    <v-chart class="chart" :option="option" />
  </div>
</template>

<script>
import { use, graphic } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, CustomChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  GridComponent,
  DataZoomComponent,
} from "echarts/components";
import VChart from "vue-echarts";

use([
  CanvasRenderer,
  LineChart,
  CustomChart,
  GridComponent,
  DataZoomComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
]);

export default {
  name: "WindChart",
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
      default: () => [],
    },
    yData: {
      type: Array,
      default: () => [],
    },
    lineStyle: {
      type: Object,
      default: () => ({ width: "370px", height: "235px" }),
    },
    chartWind: {
      type: Array,
      default: () => [],
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
      const data = this.chartWind.map((wind, index) => {
        const [, time] = wind.reportTime.split(" ");
        return [time, wind.data, this.yData[index]];
      });
      const directionMap = {};
      [
        "W",
        "WSW",
        "SW",
        "SSW",
        "S",
        "SSE",
        "SE",
        "ESE",
        "E",
        "ENE",
        "NE",
        "NNE",
        "N",
        "NNW",
        "NW",
        "WNW",
      ].forEach(function (name, index) {
        directionMap[name] = (Math.PI / 8) * index;
      });
      const dims = {
        time: 0,
        windSpeed: 1,
        R: 2,
      };
      const arrowSize = 18;

      function renderArrow(_, api) {
        const point = api.coord([
          api.value(dims.time),
          api.value(dims.windSpeed),
        ]);
        return {
          type: "path",
          shape: {
            pathData: "M31 16l-15-15v9h-26v12h26v9z",
            x: -arrowSize / 2,
            y: -arrowSize / 2,
            width: arrowSize,
            height: arrowSize,
          },
          rotation: (api.value(dims.R) * Math.PI) / 180,
          position: point,
          style: api.style({
            stroke: "#555",
            lineWidth: 1,
          }),
        };
      }

      this.option = {
        backgroudColor: "",
        grid: {
          left: "35",
          right: "20",
          top: "8%",
          bottom: 40,
        },
        tooltip: {
          trigger: "axis",
          backgroudColor: "rgba(5, 23, 45, 0.95)",
          borderColor: "#0B315F",
          color: "#fff",
          formatter: function (params) {
            return [
              params[0].value[dims.time],
              "风速：" + params[0].value[dims.windSpeed],
              "风向：" + params[0].value[dims.R],
            ].join("<br>");
          },
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
        },
        yAxis: [
          {
            nameLocation: "middle",
            splitLine: {
              show: false,
            },
          },
          {
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
            splitLine: {
              show: false,
            },
          },
        ],
        visualMap: {
          type: "piecewise",
          show: false,
          orient: "horizontal",
          left: "center",
          bottom: 10,
          pieces: [
            {
              gte: 17,
              color: "#18BF12",
              label: "大风（>=17节）",
            },
            {
              gte: 11,
              lt: 17,
              color: "#f4e9a3",
              label: "中风（11  ~ 17 节）",
            },
            {
              lt: 11,
              color: "#D33C3E",
              label: "微风（小于 11 节）",
            },
          ],
          seriesIndex: 1,
          dimension: 1,
        },
        series: [
          {
            type: "line",
            yAxisIndex: 1,
            showSymbol: false,
            hoverAnimation: false,
            symbolSize: 10,
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
            lineStyle: {
              width: 0,
            },
            itemStyle: {
              normal: {
                color: "rgba(88,160,253,1)",
              },
            },
            data: data,
            z: 2,
          },
          {
            type: "custom",
            renderItem: renderArrow,
            encode: {
              x: dims.time,
              y: dims.windSpeed,
            },
            data: data,
            z: 10,
          },
          {
            type: "line",
            symbol: "none",
            encode: {
              x: dims.time,
              y: dims.windSpeed,
            },
            lineStyle: {
              normal: {
                color: "#aaa",
                type: "dotted",
              },
            },
            data: data,
            z: 1,
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
