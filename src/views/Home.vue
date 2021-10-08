<template>
  <div class="home" v-loading="loading">
    <div class="home-header">
      <div class="home-row">
        <div class="home-header-left">
          <div class="home-header-left-l_bg"></div>
          <div class="home-header-left-r_bg"></div>
          <div class="home-header-left-c">
            <div
              class="home-left-button"
              @click="toLinkRouter('/device/alarm')"
            >
              报警记录
            </div>
            <div
              class="home-left-button"
              @click="toLinkRouter('/check/record')"
            >
              打卡记录
            </div>
            <div class="home-left-button" @click="toLinkRouter('/check/way')">
              人员定位
            </div>
            <div
              class="home-left-button"
              @click="toLinkRouter('/device/history')"
            >
              历史记录
            </div>
          </div>
        </div>
        <div class="home-header-middle">
          <div class="home-middle-name-wrap">
            <div class="home-middle-name">拉萨智慧水利管理系统</div>
          </div>
          <div class="home-middle-datetime">
            {{ time }} 星期{{ wwkMap[week] }}
          </div>
        </div>
        <div class="home-header-right">
          <div class="home-header-right-l_bg"></div>
          <div class="home-header-right-r_bg"></div>
          <div class="home-header-right-c">
            <div class="home-right-button">
              水利要闻
              <div class="home-right-lasa-wrap">
                <div
                  class="home-right-lasa"
                  @click="toLink('http://www.mwr.gov.cn/xw/slyw/')"
                >
                  中国水利
                </div>
                <div
                  class="home-right-lasa"
                  @click="toLink('http://slt.xizang.gov.cn/slxw/slyw/')"
                >
                  西藏水利
                </div>
                <div
                  class="home-right-lasa"
                  @click="
                    toLink(
                      'http://slj.lasa.gov.cn/lsslj/xxyw/common_list.shtml'
                    )
                  "
                >
                  拉萨水利
                </div>
              </div>
            </div>
            <div class="home-right-button" @click="toLinkRouter('/user')">
              用户管理
            </div>
            <div class="home-right-button" @click="toLinkRouter('/device')">
              设备管理
            </div>
            <div class="home-right-user">
              <span class="home-user-icon"></span>
              <span class="home-user-name" :title="userInfo.name">{{
                userInfo.name
              }}</span>
              <span class="home-user-arrow"></span>
              <div class="home-user-logout" @click="handleOut()">退出登录</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 背景色 -->
    <div class="home-left-bg"></div>
    <div class="home-right-bg"></div>
    <div class="home-bottom-bg">
      <div class="home-bottom-left"></div>
      <div class="home-bottom-mid">藏ICP备2021000258号</div>
      <div class="home-bottom-right"></div>
    </div>
    <!-- 警告 -->
    <div class="home-warn-wrap">
      <div class="home-warn-header">
        <div class="home-warn-header-left">
          <span class="warn-left-icon"></span>
          <span class="warn-left-title">报警通知</span>
        </div>
        <div
          class="home-warn-header-right"
          @click="toLinkRouter('/device/alarm')"
        ></div>
      </div>
      <div class="home-warn-container">
        <div class="home-warn-item" v-for="alarm in alarms" :key="alarm.id">
          <div class="home-warn-item-left">
            <span :title="alarm.deviceName">{{ alarm.deviceName }}</span>
            <span :title="alarm.alarmReason">{{ alarm.alarmReason }}</span>
          </div>
          <div class="home-warn-item-right">
            <span
              class="home-warn-item-tag"
              :style="{ backgroundColor: sensorColor[alarm.type] }"
            >
              {{ alarm.sensorType }}报警
            </span>
            <span class="home-warn-item-time">{{ alarm.triggerTime }}</span>
          </div>
        </div>
        <el-empty v-if="alarms.length === 0" :image="emptyIcon"></el-empty>
      </div>
    </div>
    <!-- 设备数据 -->
    <div class="home-chart-wrap" :class="{ explan: !isShow }">
      <div
        class="home-chart-wrap-container"
        v-loading="chartLoading"
        element-loading-text="拼命加载中..."
        v-if="isShow"
      >
        <div class="home-chart-header">
          <div class="home-chart-header-left">
            <span class="chart-left-icon"></span>
            <span class="chart-left-title">{{ deviceName }}</span>
          </div>
          <div class="home-chart-header-right" @click="visible = true"></div>
        </div>
        <div class="home-chart-container">
          <div class="chart-wrap" v-for="chart in chartData" :key="chart.icon">
            <el-row
              type="flex"
              align="middle"
              justify="space-between"
              class="chart-header"
            >
              <div class="chart-header-left" :class="chart.icon">
                {{ chart.label }}
              </div>
              <div class="chart-header-right">{{ chart.unit }}</div>
            </el-row>
            <wind-chart
              v-if="chart.icon === 'windir'"
              :key="chart.icon"
              :color="chart.color"
              :chart-wind="chartWind"
              :x-data="chart.xdata"
              :y-data="chart.ydata"
            >
            </wind-chart>
            <line-chart
              v-else
              :key="chart.icon"
              :x-data="chart.xdata"
              :y-data="chart.ydata"
              :color="chart.color"
            >
            </line-chart>
          </div>
        </div>
        <el-empty v-if="chartData.length === 0" :image="emptyIcon"></el-empty>
      </div>
      <div
        v-if="isShow"
        class="home-chart-buoy"
        @click="isShow = !isShow"
      ></div>
      <div
        v-if="!isShow"
        class="home-chart-buoy explan"
        @click="isShow = !isShow"
      ></div>
    </div>
    <!-- 地图切换 -->
    <div class="home-map-control">
      <span
        :class="{ active: mapType === 'BMAP_NORMAL_MAP' }"
        @click="handleChangeMap('BMAP_NORMAL_MAP')"
        >地图</span
      >
      <span
        :class="{ active: mapType === 'BMAP_EARTH_MAP' }"
        @click="handleChangeMap('BMAP_EARTH_MAP')"
        >卫星</span
      >
    </div>
    <div id="container" class="map"></div>
    <!-- 传感器设置 -->
    <el-dialog
      :visible.sync="visible"
      custom-class="page-table-dialog"
      title="传感器数据显示设置"
      center
    >
      <el-form
        status-icon
        ref="fromSensor"
        label-width="75px"
        class="home-form-sensor box-grid"
        style="margin: 0"
      >
        <el-form-item
          :label="sensor.key"
          v-for="sensor in sensorsForm"
          :key="sensor.value"
        >
          <el-select v-model="sensor.sensor" :placeholder="sensor.key">
            <el-option label="展示" :value="sensor.value"></el-option>
            <el-option label="不展示" value=""></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="page-container_top_bottom page-container_top_left"></div>
      <div class="page-container_top_bottom page-container_top_right"></div>
      <div class="page-container_top_bottom page-container_bottom_left"></div>
      <div class="page-container_top_bottom page-container_bottom_right"></div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="setSensorChart()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from "dayjs";
import { mapState, mapMutations } from "vuex";
import { postAuthLogout } from "@/api/user";
import { getAlarmList } from "@/api/alarm";
import { getDeviceList } from "@/api/device";
import { getSensorChart, getSensorData, setSensorChart } from "@/api/sensor";
import LineChart from "@/components/LineChart";
import WindChart from "@/components/WindChart";
import { mpStyle } from "@/assets/js/mpStyle";
import mapIcon from "@/assets/imgs/map_ico_location_nor.png";
import mapIconPress from "@/assets/imgs/map_ico_location_press.png";
import mapLocationBg from "@/assets/imgs/map_img_location_bg.png";
import emptyIcon from "@/assets/imgs/empty.png";
export default {
  name: "Home",
  components: { LineChart, WindChart },
  computed: {
    ...mapState(["userInfo", "sensorColor"]),
  },
  data() {
    return {
      mapIcon,
      mapLocationBg,
      emptyIcon,
      mapIconPress,
      map: null,
      mapType: "BMAP_EARTH_MAP",
      preMarker: null,
      isShow: true,
      // 图表
      chartWind: [],
      chartMap: {
        TEMP: {
          label: "温度",
          icon: "temper",
          color: ["rgba(255, 66, 0, 0.76)", "rgba(255, 66, 0, 0.11)"],
          unit: "°C",
        },
        HUMIDITY: {
          label: "湿度",
          icon: "hum",
          color: ["rgba(255, 174, 0, 0.76)", "rgba(255, 174, 0, 0.11)"],
          unit: "%",
          data: [810, 232, 301, 934],
        },
        FLOW_RATE: {
          label: "流速",
          icon: "flowrate",
          color: ["rgba(0, 255, 132, 0.76)", "rgba(0, 255, 132, 0.11)"],
          unit: "m/s",
        },
        FLOW_VELOCITY: {
          label: "流量",
          icon: "flow",
          color: ["rgba(0, 54, 255, 0.76)", "rgba(0, 54, 255, 0.11)"],
          unit: "m³/s",
        },
        RAINFALL: {
          label: "雨量",
          icon: "rainfall",
          color: ["rgba(0, 222, 255, 0.76)", "rgba(0, 222, 255, 0.11)"],
          unit: "度",
        },
        WATER_LEVEL: {
          label: "水位",
          icon: "level",
          color: ["rgba(255, 0, 78, 0.76)", "rgba(255, 0, 78, 0.12)"],
          unit: "度",
        },
        WIND_SPEED: {
          label: "风速",
          icon: "wind",
          color: ["rgba(0, 168, 255, 0.76)", "rgba(0, 168, 255, 0.11)"],
          unit: "m/s",
        },
        WIND_DIRECTION: {
          label: "风向",
          icon: "windir",
          color: ["rgba(186, 0, 255, 0.76)", "rgba(186, 0, 255, 0.11)"],
          unit: "度",
        },
      },
      chartData: [],
      chartLoading: false,
      loading: false,
      // 警告列表
      alarms: [],
      // 监测站
      deviceCode: null,
      deviceName: "",
      devices: [],
      // 传感器
      visible: false,
      sensorsForm: [
        {
          key: "温度：",
          value: "TEMP",
          sensor: "",
        },
        {
          key: "湿度：",
          value: "HUMIDITY",
          sensor: "",
        },
        {
          key: "风速：",
          value: "WIND_SPEED",
          sensor: "",
        },
        {
          key: "风向：",
          value: "WIND_DIRECTION",
          sensor: "",
        },
        {
          key: "雨量：",
          value: "RAINFALL",
          sensor: "",
        },
        {
          key: "水位：",
          value: "WATER_LEVEL",
          sensor: "",
        },
        {
          key: "流速：",
          value: "FLOW_RATE",
          sensor: "",
        },
        {
          key: "流量：",
          value: "FLOW_VELOCITY",
          sensor: "",
        },
      ],
      sensors: [],
      // 时间
      week: null,
      wwkMap: {
        0: "日",
        1: "一",
        2: "二",
        3: "三",
        4: "四",
        5: "五",
        6: "六",
      },
      time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      timer: null,
    };
  },
  methods: {
    ...mapMutations(["updateAccessToken"]),
    getAlarmList() {
      getAlarmList({
        pageNum: 1,
        pageSize: 6,
      }).then((data) => {
        this.alarms = data.data.records || [];
      });
    },
    getDeviceList() {
      this.loading = true;
      return getDeviceList({
        pageNum: 1,
        pageSize: 20,
      }).then((data) => {
        this.devices = data.data.records;
      });
    },
    getSensorType(deviceCode) {
      this.chartLoading = true;
      return getSensorChart({
        deviceCode,
      }).then((data) => {
        this.chartData = [];
        this.chartWind = [];
        let sensorType = data.data || [];
        sensorType.forEach((sensor) => {
          if (!sensorType.includes("WIND_SPEED") && sensor === "WIND_DIRECTION")
            return;
          this.getSensorData(deviceCode, sensor);
        });
        this.sensorsForm = this.sensorsForm.map((s) => {
          let sensor = sensorType.filter((t) => s.value === t);
          if (
            !sensorType.includes("WIND_SPEED") &&
            s.value === "WIND_DIRECTION"
          ) {
            sensor = [];
          }
          return { ...s, sensor: sensor.length ? s.value : "" };
        });
        this.chartLoading = false;
      });
    },
    getSensorData(deviceCode, sensorType) {
      getSensorData({
        deviceCode,
        sensorType,
      }).then((data) => {
        if (sensorType === "WIND_SPEED") {
          this.chartWind = data.data.records;
        }
        const xdata = data.data.records.map(
          (rd) => rd.reportTime.split(" ")[1]
        );
        const ydata = data.data.records.map((rd) => rd.data);
        const chartOptions = this.chartMap[sensorType];

        this.chartData.push({
          ...chartOptions,
          xdata,
          ydata,
        });
      });
    },
    setSensorChart() {
      const enumSensorTypes = this.sensorsForm
        .map((s) => s.sensor)
        .filter((s) => s);
      setSensorChart({
        deviceCode: this.deviceCode,
        enumSensorTypes,
      }).then(() => {
        this.getSensorType(this.deviceCode);
        this.$message.success("设置成功");
        this.visible = false;
      });
    },
    setMapLabel(deviceName, longitude, latitude) {
      /* eslint-disable */
      // 显示文本
      const opts = {
        position: new BMapGL.Point(longitude, latitude), // 指定文本标注所在的地理位置
        offset: new BMapGL.Size(0, -90) // 设置文本偏移量
      };
      const label = new BMapGL.Label(deviceName, opts);
      label.setStyle({
        color: '#FDB616',
        padding: '10px',
        fontSize: '16px',
        fontWeight: "bold",
        width: "300px",
        height: '40px',
        overflow: "hidden",
        textAlign: "center",
        lineHeight: '38px',
        fontFamily: 'OPPOSans',
        transform: 'translateX(-50%)',
        border: "0px",
        background: `url(${this.mapLocationBg}) center no-repeat`
      });
      this.map.addOverlay(label);
      /* eslint-disable */
    },
    setScrollZoom() {
      /* eslint-disable */
      if (window.addEventListener) {
        //FF,火狐浏览器会识别该方法
        window.addEventListener(
          "DOMMouseScroll",
          this.wheel,
          false
        );
      }
      window.onmousewheel = document.onmousewheel = this.wheel; //W3C
      /* eslint-disable */
    },
    wheel(event) {
      let delta = 0;
      if (!event) event = window.event;
      if (event.wheelDelta) {
        //IE、chrome浏览器使用的是wheelDelta，并且值为“正负120”
        delta = event.wheelDelta / 120;
        if (window.opera) delta = -delta; //因为IE、chrome等向下滚动是负值，FF是正值，为了处理一致性，在此取反处理
      } else if (event.detail) {
        //FF浏览器使用的是detail,其值为“正负3”
        delta = -event.detail / 3;
      }
      if (delta) {
        if (delta < 0) {
          this.map.setZoom(this.map.getZoom() - 2);
        } else {
          this.map.setZoom(this.map.getZoom() + 2);
        }
      }
    },
    readyMap() {
      /* eslint-disable */
      // 更换图标
      const newIcon = new BMapGL.Icon(this.mapIconPress, new BMapGL.Size(44, 54));
      const {
        longitude,
        latitude,
        deviceCode = "",
        deviceName = "",
      } = this.devices[0] ? this.devices[0] : { longitude: 116.404, latitude: 39.915 };
      this.deviceCode = deviceCode;
      this.deviceName = deviceName;
      this.getSensorType(deviceCode);
      this.map = new BMapGL.Map("container", { mapType: BMAP_EARTH_MAP });
      const map = this.map;   
      const point = new BMapGL.Point(longitude, latitude);   
      const scaleCtrl = new BMapGL.ScaleControl(); 
      map.centerAndZoom(point, 15);
      map.enableScrollWheelZoom(true);
      map.setMapStyleV2({ styleJson: mpStyle });
      map.addControl(scaleCtrl);
      // 创建图标
      this.setMapLabel(deviceName, longitude, latitude);
      this.devices.forEach((device, index) => {
        const { longitude, latitude, deviceCode: dCode, deviceName: dName } = device;
        const myIcon = new BMapGL.Icon(this.mapIcon, new BMapGL.Size(44, 54));
        // 创建Marker标注
        const pt = new BMapGL.Point(longitude, latitude);
        const marker = new BMapGL.Marker(pt, {
          icon: myIcon
        });
        map.addOverlay(marker);
        if (index === 0) {
          this.preMarker = marker;
          marker.setIcon(newIcon);
        }
        marker.addEventListener("click", () => {
          this.deviceCode = dCode;
          this.deviceName = dName;
          // 上一个
          this.preMarker && this.preMarker.setIcon(myIcon);
          marker.setIcon(newIcon);
          this.preMarker = marker;
          this.setMapLabel(dName, longitude, latitude);
        });
      });
      /* eslint-disable */
      this.loading = false;
      // this.setScrollZoom();
    },
    handleOut() {
      postAuthLogout({
        memo: "退出登录",
        platformTypeEnum: "PC",
      }).then(() => {
        this.updateAccessToken("");
        location.href = "/login";
      });
    },
    handleChangeMap(type) {
      /* eslint-disable */
      if (type === 'BMAP_NORMAL_MAP') {
        this.mapType = "BMAP_NORMAL_MAP";
        this.map.setMapType(BMAP_NORMAL_MAP);
      } else {
        this.mapType = "BMAP_EARTH_MAP";
        this.map.setMapType(BMAP_EARTH_MAP);
      }
      /* eslint-disable */
    },
    toLink(path) {
      window.open(path, "_blank");
    },
    toLinkRouter(path) {
      this.$router.push(path);
    }
  },
  created() {
    this.getAlarmList();
    this.getDeviceList().then(() => {
      this.readyMap();
    });
  },
  mounted() {
    this.week = dayjs().day();
    this.timer = setInterval(() => {
      this.time = dayjs().format('YYYY-MM-DD HH:mm:ss');
    }, 1000);
  },
  beforeDestroy() {
    document.onmousemove = null;
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
};
</script>

<style lang="scss">
.home,
.map {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
.home-map-control {
  position: absolute;
  bottom: 56px;
  left: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  z-index: 1002;
  background: rgba(5, 23, 45, 0.65);
  span {
    width: 71px;
    text-align: center;
    display: block;
    padding: 6px;
    color: #909399;
    border: 1px solid #025a96;
  }
  span.active {
    background-color: #122ac0;
    color: #fff;
  }
}
.home-header {
  position: absolute;
  top: 0;
  left: 50%;
  z-index: 1002;
  width: 100%;
  height: 120px;
  background:linear-gradient(0deg, rgba(21, 23, 209, 0), #050771);
  box-sizing: border-box;
  transform: translate(-50%, 0);
  &-left {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: row;
    &-l_bg {
      width: 370px;
      height: 152px;
      background: url(~@/assets/imgs/nv_img_bg_left.png) center no-repeat;
    }
    &-r_bg {
      flex: 1;
      height: 152px;
      background: url(~@/assets/imgs/nv_img_bg_middle_l.png) center repeat;
    }
    &-c {
      position: absolute;
      top: 20px;
      left: 16px;
      display: flex;
      flex-direction: row;
    }
    .home-left-button {
      font-size: 16px;
      font-weight: bold;
      color: #FFFFFF;
      opacity: 0.6;
      text-align: center;
      width: 132px;
      height: 40px;
      line-height: 40px;
      background: url(~@/assets/imgs/nav_left.png) center no-repeat;
      background-size: 100%;
      font-family: "OPPOSans";
      cursor: pointer;
    }
    .home-left-button:hover {
      opacity: 1;
      background: url(~@/assets/imgs/nav_left_hov.png) center no-repeat;
    }
  }
  &-right {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: row;
    &-l_bg {
      width: 370px;
      height: 152px;
      background: url(~@/assets/imgs/nv_img_bg_right.png) center no-repeat;
    }
    &-r_bg {
      flex: 1;
      height: 152px;
      background: url(~@/assets/imgs/nv_img_bg_middle_l.png) center repeat;
    }
    &-c {
      position: absolute;
      top: 20px;
      right: 16px;
      display: flex;
      flex-direction: row;
    }
    .home-right-button {
      position: relative;
      .home-right-lasa-wrap {
        position: absolute;
        left: 0px;
        bottom: -33px;
        width: 112px;
        opacity: 0;
      }
      .home-right-lasa {
        width: 112px;
        height: 38px;
        line-height: 38px;
        text-align: center;
        font-size: 15px;
        font-weight: bold;
        background-color: #000FAB;
        cursor: pointer;
      }
      .home-right-lasa:hover {
        background-color: #4a55c8;
      }
      &:hover .home-right-lasa-wrap {
        opacity: 1;
        height: 33px;
      }
    }
    .home-right-user {
      position: relative;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 0px 18px;
      box-sizing: border-box;
      .home-user-logout {
        position: absolute;
        left: 0px;
        bottom: -33px;
        width: 112px;
        height: 0px;
        line-height: 33px;
        text-align: center;
        font-size: 15px;
        font-weight: bold;
        background-color: #000FAB;
        opacity: 0;
      }
      &:hover .home-user-logout {
        opacity: 1;
        height: 33px;
      }
      span {
        display: block;
      }
      .home-user-icon {
        width: 18px;
        height: 18px;
        background: url(~@/assets/imgs/nav_user.png) center no-repeat;
        background-size: 100%;
      }
      .home-user-name {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        flex: 1;
      }
      .home-user-arrow {
        width: 8px;
        height: 8px;
        background: url(~@/assets/imgs/nav_user_arrow.png) center no-repeat;
        background-size: 100%;
      }
    }
    .home-right-button, .home-right-user {
      font-size: 16px;
      font-weight: bold;
      color: #FFFFFF;
      opacity: 0.6;
      text-align: center;
      width: 132px;
      height: 40px;
      line-height: 40px;
      background: url(~@/assets/imgs/nav_right.png) center no-repeat;
      background-size: 100%;
      font-family: "OPPOSans";
      cursor: pointer;
    }
    .home-right-button:hover, .home-right-user:hover {
      opacity: 1;
      background: url(~@/assets/imgs/nav_right_hov.png) center no-repeat;
    }
  }
  &-middle {
    width: 870px;
    height: 152px;
    background: url(~@/assets/imgs/nv_img_bg_middle.png) center 0 no-repeat;
    .home-middle-name-wrap {
      height: 100px;
      line-height: 100px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
    }
    .home-middle-name {
      height: 66px;
      line-height: 66px;
      font-size: 50px;
      font-family: HYGangYiTi;
      font-weight: 600;
      text-shadow: 0px 8px 15px rgba(0, 0, 0, 0.45);
      color: #fff;
      letter-spacing: 7px;
    }
    .home-middle-datetime {
      height: 24px;
      line-height: 24px;
      color: #fff;
      font-size: 16px;
      text-align: center;
      font-family: "Microsoft Yahei";
      font-weight: 600;
    }
  }
}
.home-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.home-chart-wrap-container::-webkit-scrollbar {
  width: 0px;
}
.home-chart-wrap-container {
  position: relative;
  width: 369px;
  margin: 20px auto;
  min-height: 509px;
  max-height: 780px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;
  z-index: 1002;
}
.home-chart-wrap {
  position: absolute;
  top: 105px;
  right: 20px;
  width: 459px;
  min-height: 509px;
  max-height: 780px;
  box-sizing: border-box;
  z-index: 1000;
  background: url(~@/assets/imgs/data_img_line_right_top.png) center top no-repeat,
  url(~@/assets/imgs/data_img_line_right_foot.png) center bottom no-repeat,
  url(~@/assets/imgs/data_img_line_right_middle.png) 0px 199px repeat-y;
  overflow: hidden;
  .home-chart-buoy {
    position: absolute;
    left: -24px;
    top: 50%;
    transform: translate(0%, -50%);
    width: 24px;
    height: 158px;
    background: url(~@/assets/imgs/buoy_ctr_narrow.png) center no-repeat;
    background-size: 100%;
    cursor: pointer;
  }
  .home-chart-buoy.explan {
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translate(0%, -50%);
    width: 24px;
    height: 158px;
    background: url(~@/assets/imgs/buoy_ctr.png) center no-repeat;
    background-size: 100%;
    cursor: pointer;
  }
  .home-chart-buoy.narrow {
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translate(0%, -50%);
    width: 24px;
    height: 158px;
    background: url(~@/assets/imgs/buoy_ctr.png) 0 0 no-repeat;
    background-size: 100%;
    cursor: pointer;
  }
  .home-chart-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 9px;
    margin-bottom: 20px;
    border-bottom: 2px solid;
    border-image: linear-gradient(90deg, rgba(0, 120, 255, 0.3), rgba(255, 255, 255, 0.3), rgba(0, 120, 255, 0.3)) 2 2;
  }
  .home-chart-header-right {
    width: 44px;
    height: 44px;
    background: url(~@/assets/imgs/data_ico_setting.png) center no-repeat;
    cursor: pointer;
  }
  .home-chart-header-left {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  span.chart-left-title {
    display: block;
    font-size: 24px;
    font-family: OPPOSans;
    font-weight: bold;
    color: #80B5FC;
    margin-left: -24px;
    line-height: 43px;
  }
  span.chart-left-icon {
    display: block;
    width: 90px;
    height: 43px;
    background: url(~@/assets/imgs/data_ico_sensor.png) 0 center no-repeat;
  }
  .home-chart-container {
    padding: 0px 0px;
    .chart-header {
      color: #80B5FC;
      margin-bottom: 13px;
    }
    .chart-header-left {
      position: relative;
      font-size: 18px;
      text-indent: 27px;
      width: 80px;
      height: 22px;
      line-height: 22px;
    }
    .chart-header-left.temper {
      background: url(~@/assets/imgs/equipment_ico_temperature.png) 0 center no-repeat;
    }
    .chart-header-left.hum {
      background: url(~@/assets/imgs/equipment_ico_humidity.png) 0 center no-repeat;
    }
    .chart-header-left.flowrate {
      background: url(~@/assets/imgs/equipment_ico_velocity.png) 0 center no-repeat;
    }
    .chart-header-left.flow {
      background: url(~@/assets/imgs/equipment_ico_traffic.png) 0 center no-repeat;
    }
    .chart-header-left.wind {
      background: url(~@/assets/imgs/equipment_ico_speed.png) 0 center no-repeat;
    }
    .chart-header-left.windir {
      background: url(~@/assets/imgs/equipment_ico_direction.png) 0 center no-repeat;
    }
    .chart-header-left.rainfall {
      background: url(~@/assets/imgs/equipment_ico_rainfall.png) 0 center no-repeat;
    }
    .chart-header-left.level {
      background: url(~@/assets/imgs/equipment_ico_level.png) 0 center no-repeat;
    }
  }
}
.home-chart-wrap.explan {
  width: 0px;
  border: 0px;
}
.home-warn-wrap {
  position: absolute;
  top: 105px;
  left: 20px;
  width: 459px;
  min-height: 509px;
  background: url(~@/assets/imgs/data_img_line_left_top.png) center top no-repeat,
  url(~@/assets/imgs/data_img_line_left_foot.png) center bottom no-repeat,
  url(~@/assets/imgs/data_img_line_left_middle.png) 0px 199px repeat-y;
  z-index: 1000;
  box-sizing: border-box;
  padding: 28px 40px;
  .home-warn-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 30px;
    padding-bottom: 25px;
    border-bottom: 2px solid;
    border-image: linear-gradient(90deg, rgba(0, 120, 255, 0.3), rgba(255, 255, 255, 0.3), rgba(0, 120, 255, 0.3)) 2 2;
  }
  .home-warn-header-left {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  span.warn-left-title {
    display: block;
    font-size: 24px;
    font-family: OPPOSans;
    font-weight: bold;
    color: #80B5FC;
    margin-left: -24px;
    line-height: 43px;
  }
  span.warn-left-icon {
    display: block;
    width: 90px;
    height: 43px;
    background: url(~@/assets/imgs/data_ico_alarm.png) 0 center no-repeat;
  }
  .home-warn-header-right {
    width: 44px;
    height: 44px;
    background: url(~@/assets/imgs/data_ico_history.png) center no-repeat;
    cursor: pointer;
  }
  .home-warn-container {
    padding-top: 50px;
  }
  .home-warn-item {
    color: #A4CAFD;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 36px;
    &-left {
      width: 250px;
      height: 48px;
      line-height: 24px;
      font-size: 16px;
      overflow: hidden; 
      span {
        display: block;
        overflow: hidden; 
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    &-right {
      width: 130px;
      font-size: 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    &-time {
      white-space: nowrap;
    }
    &-tag {
      width: 70px;
      height: 23px;
      margin-bottom: 12px;
      line-height: 23px;
      color: #fff;
      background-color: #ED7B00;
      border-radius: 3px;
      text-align: center;
    }
    &-tag.other {
      background-color: #FF0000;
    }
    &-tiem {
      display: block;
      color: #fff;
    }
  }
}
.page-table-dialog .home-form-sensor {
  &.el-form {
    width: 665px;
  }
  .el-select {
    width: 240px;
  }
  .el-input {
    width: 240px;
  }
  .el-input__inner {
    width: 100%;
  }
}
.home-left-bg {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
  width: 40%;
  height: 100%;
  background: linear-gradient(-90deg, rgba(21, 23, 209, 0), rgba(5, 7, 113, 0.58));
}
.home-right-bg {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 999;
  width: 40%;
  height: 100%;
  background: linear-gradient(90deg, rgba(21, 23, 209, 0), rgba(5, 7, 113, 0.58));
}
.home-bottom-bg {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 999;
  width: 100%;
  height: 91px;
  background: linear-gradient(180deg, rgba(21, 23, 209, 0), rgba(5, 7, 113, 0.58));

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 51px 19px 0px;
  box-sizing: border-box;
  .home-bottom-left {
    width: 821px;
    height: 18px;
    background: url(~@/assets/imgs/data_img_line_foot_left.png) 0 center no-repeat;
  }
  .home-bottom-mid {
    font-size: 16px;
    height: 16px;
    line-height: 16px;
    color: #80B5FC;
  }
  .home-bottom-right {
    width: 821px;
    height: 18px;
    background: url(~@/assets/imgs/data_img_line_foot_right.png) 0 center no-repeat;
  }
}
</style>
