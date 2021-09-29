<template>
  <section class="page-form-wrapper">
    <div class="page-form-wrap">
      <div class="page-form-content">
        <el-form
          ref="form"
          :inline="true"
          :model="formInline"
          class="page-form-inline"
        >
          <el-form-item label="人员名称" prop="userId">
            <el-select v-model="formInline.userId" placeholder="用户名">
              <el-option
                v-for="user in users"
                :key="user.id"
                :label="user.name"
                :value="user.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="formInline.startTime"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="datetime"
              placeholder="选择日期时间"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="formInline.endTime"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="datetime"
              placeholder="选择日期时间"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="作业类型" prop="workStatus">
            <el-select v-model="formInline.workStatus" placeholder="作业类型">
              <el-option label="全部" value=""></el-option>
              <el-option label="执行中" :value="0"></el-option>
              <el-option label="已结束" :value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="作业状态" prop="workType">
            <el-select v-model="formInline.workType" placeholder="作业状态">
              <el-option label="全部" value=""></el-option>
              <el-option label="值班打卡" :value="0"></el-option>
              <el-option label="巡逻打卡" :value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-left: 8px">
            <el-button type="primary" @click="getLocationPage()"
              >查询</el-button
            >
            <el-button @click="handleReset()">重置</el-button>
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
    <!-- 地图切换 -->
    <div class="page-map-control">
      <span :class="{'active': mapType === 'BMAP_NORMAL_MAP'}" @click="handleChangeMap('BMAP_NORMAL_MAP')">地图</span>
      <span :class="{'active': mapType === 'BMAP_EARTH_MAP'}" @click="handleChangeMap('BMAP_EARTH_MAP')">卫星</span>
    </div>
    <div v-loading="loading" id="way" class="map"></div>
  </section>
</template>

<script>
import { mapState } from "vuex";
import { getLocationPage } from "@/api/record";
import { mpStyle } from "@/assets/js/mpStyle";
export default {
  data() {
    return {
      formInline: {
        userId: "",
        endTime: "",
        startTime: "",
        workStatus: "",
        workType: "",
      },
      // table相关
      loading: false,
      list: [],
      bmap: null,
      mapType: "BMAP_EARTH_MAP",
    };
  },
  computed: {
    ...mapState(["users"]),
    recordId() {
      return this.$route.params.id;
    },
    startT() {
      return this.$route.query.start;
    },
    endT() {
      return this.$route.query.end;
    },
    userId() {
      return this.$route.query.userId;
    },
    workStatusId() {
      return this.$route.query.workStatus;
    },
    workTypeId() {
      return this.$route.query.workType;
    },
  },
  methods: {
    getLocationPage() {
      const { userId, startTime } = this.formInline;
      if (!userId || !startTime) {
        this.$message.error("请先选择人员和时间段");
        return;
      }
      this.loading = true;
      getLocationPage({
        ...this.formInline,
      })
        .then((data) => {
          this.list = data.data.filter((r) => r.longitude && r.latitude) || [];
          if (this.list.length) {
            this.readyMapPath();
          } else {
            this.$message.error("未查到当前人员路线");
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleReset() {
      this.$refs.form.resetFields();
    },
    readyMapPath() {
      /* eslint-disable */
      // const list = [{
      //   'longitude': 116.297611,
      //   'latitude': 40.047363
      // }, {
      //   'longitude': 116.302839,
      //   'latitude': 40.048219
      // }, {
      //   'longitude': 116.308301,
      //   'latitude': 40.050566
      // }, {
      //   'longitude': 116.305732,
      //   'latitude': 40.054957
      // }, {
      //   'longitude': 116.304754,
      //   'latitude': 40.057953
      // }, {
      //   'longitude': 116.306487,
      //   'latitude': 40.058312
      // }, {
      //   'longitude': 116.307223,
      //   'latitude': 40.056379
      // }];
      const list = this.list;
      this.bmap.panTo(new BMapGL.Point(list[0].longitude, list[0].latitude));
      let pl = new BMapGL.Polyline(
        list.map(l => new BMapGL.Point(l.longitude, l.latitude)),
        { strokeColor: "#00FF00", strokeWeight: 6 }
      );
      this.bmap.addOverlay(pl);
      /* eslint-disable */
    },
    readyMap() {
      /* eslint-disable */
      const bmap = new BMapGL.Map("way");
      bmap.centerAndZoom(new BMapGL.Point(91.09634224, 29.64599583), 16);
      bmap.enableScrollWheelZoom(true);
      bmap.setMapType(BMAP_EARTH_MAP);
      bmap.setMapStyleV2({ styleJson: mpStyle });
      this.bmap = bmap;
      /* eslint-disable */
    },
    handleChangeMap(type) {
      /* eslint-disable */
      if (type === 'BMAP_NORMAL_MAP') {
        this.mapType = "BMAP_NORMAL_MAP";
        this.bmap.setMapType(BMAP_NORMAL_MAP);
      } else {
        this.mapType = "BMAP_EARTH_MAP";
        this.bmap.setMapType(BMAP_EARTH_MAP);
      }
      /* eslint-disable */
    },
  },
  mounted() {
    this.readyMap();
    if (this.recordId) {
      this.formInline.startTime = this.startT;
      this.formInline.endTime = (this.endT === 'null' || !this.endT) ? '' : this.endT ;
      this.formInline.userId = this.userId;
      this.formInline.workStatus = this.workStatusId ? +this.workStatusId : '';
      this.formInline.workType = this.workTypeId ? +this.workTypeId : '';
      this.getLocationPage();
    }
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
.page-map-control {
  position: absolute;
  bottom: 40px;
  left: 30px;
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
.page-form-wrap {
  position: absolute;
  top: 100px;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 0px 24px;
  z-index: 1010;
  .page-form-content {
    position: relative;
    background: rgba(5, 23, 45, 0.65);
    border: 1px solid #003b7a;
    padding: 31px 26px 9px;
  }
}
</style>
