<template>
  <div class="home" v-loading="loading">
    <div class="home-header">
      <div class="home-row">
        <div class="home-header-left">
          <div class="home-left-button" @click="toLinkRouter('/device/alarm')">
            报警记录
          </div>
          <div class="home-left-button" @click="toLinkRouter('/check/record')">
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
        <div class="home-header-middle">
          <div class="home-middle-name-wrap">
            <div class="home-middle-name"></div>
          </div>
          <div class="home-middle-datetime">
            {{ time }} 星期{{ wwkMap[week] }}
          </div>
        </div>
        <div class="home-header-right">
          <div
            class="home-right-button"
            @click="
              toLink('http://slj.lasa.gov.cn/lsslj/xxyw/common_list.shtml')
            "
          >
            水利要闻
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
    <!-- 警告 -->
    <div class="home-warn-wrap">
      <div class="home-warn-header">
        <div class="home-warn-header-left"></div>
        <div
          class="home-warn-header-right"
          @click="toLinkRouter('/device/alarm')"
        >
          查看全部
        </div>
      </div>
      <div class="home-warn-container">
        <div class="home-warn-item" v-for="alarm in alarms" :key="alarm.id">
          <div class="home-warn-item-left">{{ alarm.deviceName }}</div>
          <div class="home-warn-item-right">
            <span
              class="home-warn-item-tag"
              :style="{ backgroundColor: sensorColor[alarm.sensorType] }"
            >
              {{ alarm.alarmReason }}
            </span>
            <span class="home-warn-item-time">{{ alarm.triggerTime }}</span>
          </div>
        </div>
      </div>
      <div class="page-container_top_bottom page-container_top_left"></div>
      <div class="page-container_top_bottom page-container_top_right"></div>
      <div class="page-container_top_bottom page-container_bottom_left"></div>
      <div class="page-container_top_bottom page-container_bottom_right"></div>
    </div>
    <!-- 设备数据 -->
    <div class="home-chart-wrap">
      <div class="home-chart-wrap-container">
        <div class="home-chart-header">
          <div class="home-chart-header-left">
            <span class="chart-left-title">{{ deviceName }}</span>
            <span class="chart-left-icon"></span>
          </div>
          <div class="home-chart-header-right" @click="visible = true">
            数据设置
          </div>
        </div>
        <div class="home-chart-container box-grid">
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
            <line-chart
              :key="chart.icon"
              :x-data="chart.xdata"
              :y-data="chart.ydata"
              :color="chart.color"
            >
            </line-chart>
          </div>
        </div>
      </div>
      <div class="page-container_top_bottom page-container_top_left"></div>
      <div class="page-container_top_bottom page-container_top_right"></div>
      <div class="page-container_top_bottom page-container_bottom_left"></div>
      <div class="page-container_top_bottom page-container_bottom_right"></div>
      <div class="home-chart-buoy"></div>
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
import { getSensorType, getSensorData, setSensorChart } from "@/api/sensor";
import LineChart from "@/components/LineChart";
import { mpStyle } from "@/assets/js/mpStyle";
import mapIcon from "@/assets/imgs/map_ico_location_nor.png";
import mapIconPress from "@/assets/imgs/map_ico_location_press.png";
import mapLocationBg from "@/assets/imgs/map_img_location_bg.png";
export default {
  name: "Home",
  components: { LineChart },
  computed: {
    ...mapState(["userInfo", "sensorColor"]),
  },
  data() {
    return {
      mapIcon,
      mapLocationBg,
      mapIconPress,
      map: null,
      preMarker: null,
      // 图表
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
        pageSize: 10,
      }).then((data) => {
        this.alarms = data.data.records;
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
      return getSensorType({
        deviceCode,
      }).then((data) => {
        this.chartData = [];
        let sensorType = data.data || [];
        sensorType.forEach((sensor) => {
          this.getSensorData(deviceCode, sensor);
        });
        this.sensorsForm = this.sensorsForm.map((s) => {
          const sensor = sensorType.filter((t) => s.value === t);
          return { ...s, sensor: sensor.length ? s.value : "" };
        });
      });
    },
    getSensorData(deviceCode, sensorType) {
      getSensorData({
        deviceCode,
        sensorType,
      }).then((data) => {
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
        color: '#FF0000',
        padding: '10px',
        fontSize: '17px',
        fontWeight: "bold",
        width: "300px",
        height: '42px',
        overflow: "hidden",
        textAlign: "center",
        lineHeight: '42px',
        fontFamily: 'font-size: 16px;',
        transform: 'translateX(-50%)',
        border: "0px",
        background: `url(${this.mapLocationBg}) center no-repeat`
      });
      this.map.addOverlay(label);
      /* eslint-disable */
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
      this.map = new BMapGL.Map("container");
      const map = this.map;   
      const point = new BMapGL.Point(longitude, latitude);    
      map.centerAndZoom(point, 15);
      map.enableScrollWheelZoom(true);
      map.setMapStyleV2({ styleJson: mpStyle });
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
  destroyed() {
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
  height: 1073px;
  min-height: 100%;
  position: relative;
}
.home-header {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1002;
  width: 100%;
  height: 91px;
  background: url(~@/assets/imgs/nav_bg.png) center 0 no-repeat;
  background-size: 100%;
  padding: 0px 20px;
  box-sizing: border-box;
  &-left {
    display: flex;
    flex-direction: row;
    padding-top: 21px;
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
    display: flex;
    flex-direction: row;
    padding-top: 21px;
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
    height: 91px;
    .home-middle-name-wrap {
      height: 61px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
    }
    .home-middle-name {
      width: 392px;
      height: 29px;
      background: url(~@/assets/imgs/nav_title.png) center no-repeat;
      background-size: 100%;
    }
    .home-middle-datetime {
      height: 14px;
      line-height: 14px;
      color: #fff;
      font-size: 14px;
      text-align: center;
      font-family: "OPPOSans";
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
  width: 824px;
  max-height: 939px;
  background: rgba(5, 23, 45, 0.65);
  padding: 10px 30px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;
  z-index: 1001;
}
.home-chart-wrap {
  position: absolute;
  top: 105px;
  right: 25px;
  width: 824px;
  min-height: 450px;
  max-height: 939px;
  border: 1px solid #003B7A;
  box-sizing: border-box;
  z-index: 1000;
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
    right: -24px;
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
    position: relative;
    font-size: 14px;
    font-family: OPPOSans;
    font-weight: 500;
    color: #FFFFFF;
    opacity: 0.5;
    padding-right: 20px;
    cursor: pointer;
  }
  .home-chart-header-right::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 0px;
    width: 6px;
    height: 10px;
    background: url(~@/assets/imgs/back.png) center no-repeat;
    transform: translate(0%, -50%);
  }
  span.chart-left-title {
    display: block;
    font-size: 30px;
    font-family: OPPOSans;
    font-weight: bold;
    color: #fff;
    margin-bottom: 8px;
  }
  span.chart-left-icon {
    display: block;
    width: 88px;
    height: 16px;
    background: url(~@/assets/imgs/data_bg.png) 0 center no-repeat;
  }
  .home-chart-container {
    padding: 0px 0px;
    .chart-header {
      color: #fff;
      margin-bottom: 18px;
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
.home-warn-wrap {
  position: absolute;
  top: 105px;
  left: 25px;
  width: 425px;
  min-height: 216px;
  background: rgba(5, 23, 45, 0.65);
  border: 1px solid #003B7A;
  z-index: 1000;
  padding: 28px;
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
    width: 118px;
    height: 22px;
    background: url(~@/assets/imgs/warn.png) 0 center no-repeat;
  }
  .home-warn-header-right {
    position: relative;
    font-size: 14px;
    font-family: OPPOSans;
    font-weight: 500;
    color: #FFFFFF;
    opacity: 0.5;
    padding-right: 20px;
    cursor: pointer;
  }
  .home-warn-header-right::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 0px;
    width: 6px;
    height: 10px;
    opacity: 0.6;
    background: url(~@/assets/imgs/back.png) center no-repeat;
    transform: translate(0%, -50%);
  }
  .home-warn-container {
    padding-top: 50px;
  }
  .home-warn-item {
    color: #fff;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 36px;
    &-left {
      width: 196px;
      height: 48px;
      line-height: 24px;
      font-size: 16px;
      overflow: hidden; 
      text-overflow: ellipsis;
      display: -webkit-box; 
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2; 
    }
    &-right {
      width: 130px;
      font-size: 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
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
  .el-input {
    width: 240px;
  }
  .el-input__inner {
    width: 240px;
  }
}
</style>
