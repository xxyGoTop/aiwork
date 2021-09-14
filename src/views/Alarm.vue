<template>
  <section class="page-wrapper">
    <!-- 数据表格 -->
    <div class="page-container">
      <div class="page-table-header">
        <div class="page-table-header-left">
          <span
            :class="{ active: tab === 'user' }"
            @click="handleChangeTab('user')"
            >报警记录</span
          >
          <span
            :class="{ active: tab === 'group' }"
            @click="handleChangeTab('group')"
            >报警设置</span
          >
        </div>
        <div class="page-table-header-right" v-if="tab === 'user'">
          <span class="page-table-header-right-export-icon"></span>
          <span>导出</span>
        </div>
        <div class="page-table-header-right" @click="handleAdd()" v-else>
          <span class="page-table-header-right-icon"></span>
          <span>新增报警</span>
        </div>
      </div>
      <div class="page-table-form" v-if="tab === 'user'">
        <el-form
          ref="form"
          :inline="true"
          :model="formInline"
          class="page-form-inline"
        >
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="formInline.startTime"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="datetime"
              placeholder="报警开始时间"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="formInline.endTime"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="datetime"
              placeholder="报警结束时间"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="报警类型" prop="sensorType">
            <el-select v-model="formInline.sensorType" placeholder="报警类型">
              <el-option label="全部" value=""></el-option>
              <el-option
                v-for="sensor in sensorsType"
                :key="sensor.value"
                :label="sensor.key"
                :value="sensor.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="报警设备" prop="deviceId">
            <el-select v-model="formInline.deviceId" placeholder="报警设备">
              <el-option label="全部" value=""></el-option>
              <el-option
                v-for="d in devices"
                :key="d.deviceCode"
                :label="d.deviceName"
                :value="d.deviceCode"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-left: 88px">
            <el-button type="primary" @click="handleAlarm()">查询</el-button>
            <el-button @click="handleReset()">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="page-table" v-if="tab === 'user'">
        <!-- 表格 -->
        <div class="page-table-box">
          <el-table
            stripe
            :data="alarmList"
            v-loading="loading"
            style="width: 100%"
          >
            <el-table-column prop="id" label="序号" width="80" align="center" />
            <el-table-column prop="sensorType" label="报警类型" align="center">
              <template #default="{ row }">
                <span class="alarm-status">{{ row.sensorType }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="triggerTime"
              label="报警时间"
              align="center"
            />
            <el-table-column prop="deviceName" label="报警设备" />
            <el-table-column
              prop="alarmValue"
              label="警戒值"
              width="200"
              align="center"
            />
            <el-table-column prop="alarmReason" label="报警原因">
            </el-table-column>
          </el-table>
        </div>
        <el-row style="margin-top: 16px" type="flex" justify="end">
          <el-pagination
            background
            @current-change="handleAlarm"
            :current-page="alarmPage"
            :page-size="alarmPageSize"
            :total="alarmTotal"
            layout="total, prev, pager, next"
          />
        </el-row>
      </div>
      <div class="page-table" v-else>
        <!-- 表格 -->
        <div class="page-table-box">
          <el-table stripe :data="list" v-loading="loading" style="width: 100%">
            <el-table-column prop="name" label="规则名称" align="center" />
            <el-table-column
              prop="typeName"
              label="报警类型"
              width="180"
              align="center"
            >
              <template #default="{ row }">
                <span class="alarm-status">{{ row.typeName }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="deviceId"
              label="报警设备"
              width="380"
              align="center"
            />
            <el-table-column
              prop="platformThreshold"
              label="平台报警值"
              width="180"
              align="center"
            />
            <el-table-column
              prop="smsThreshold"
              label="短信报警值"
              width="180"
              align="center"
            ></el-table-column>
          </el-table>
        </div>
        <el-row style="margin-top: 16px" type="flex" justify="end">
          <el-pagination
            background
            @current-change="getAlarmPageAll"
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
    <!-- 编辑 -->
    <el-dialog
      :visible.sync="visible"
      custom-class="page-table-dialog"
      :title="dTitle"
      center
    >
      <el-form
        :model="fromRuleData"
        status-icon
        ref="fromRuleData"
        label-width="120px"
        class="dialog-form"
      >
        <el-form-item label="规则名称：" prop="alarmName">
          <el-input
            v-model="fromRuleData.alarmName"
            placeholder="规则名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="报警设备：" prop="deviceId">
          <el-select v-model="fromRuleData.deviceId" placeholder="报警设备">
            <el-option
              v-for="d in devices"
              :key="d.deviceCode"
              :label="d.deviceName"
              :value="d.deviceCode"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="报警类型：" prop="sensorType">
          <el-select v-model="fromRuleData.sensorType" placeholder="报警类型">
            <el-option
              v-for="sensor in sensorsType"
              :key="sensor.value"
              :label="sensor.key"
              :value="sensor.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="平台报警值：" prop="platformThreshold">
          <el-input
            v-model="fromRuleData.platformThreshold"
            placeholder="请输入平台报警值"
          ></el-input>
        </el-form-item>
        <el-form-item label="短信报警值：" prop="smsThreshold">
          <el-input
            v-model="fromRuleData.smsThreshold"
            placeholder="请输入短信报警值"
          ></el-input>
        </el-form-item>
      </el-form>
      <div class="page-container_top_bottom page-container_top_left"></div>
      <div class="page-container_top_bottom page-container_top_right"></div>
      <div class="page-container_top_bottom page-container_bottom_left"></div>
      <div class="page-container_top_bottom page-container_bottom_right"></div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="postAddAlarm()">确 定</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import { mapState } from "vuex";
import { getAlarmList, getAlarmPageAll, postAddAlarm } from "@/api/alarm";
import { getDeviceList } from "@/api/device";

export default {
  data() {
    return {
      visible: false,
      formInline: {
        startTime: "",
        endTime: "",
        sensorType: "",
        deviceId: "",
      },
      fromRuleData: {
        alarmName: "",
        deviceId: "",
        sensorType: "",
        platformThreshold: "",
        smsThreshold: "",
      },
      sensorsType: [
        {
          key: "温度告警",
          value: "TEMP",
        },
        {
          key: "湿度告警",
          value: "HUMIDITY",
        },
        {
          key: "风速告警",
          value: "WIND_SPEED",
        },
        {
          key: "风向告警",
          value: "WIND_DIRECTION",
        },
        {
          key: "雨量告警",
          value: "RAINFALL",
        },
        {
          key: "水位告警",
          value: "WATER_LEVEL",
        },
        {
          key: "流速告警",
          value: "FLOW_RATE",
        },
        {
          key: "流量告警",
          value: "FLOW_VELOCITY",
        },
      ],
      dTitle: "添加规则",
      groups: [],
      devices: [],
      // table相关
      tab: "user",
      loading: false,
      list: [],
      total: 10,
      page: 1,
      pageSize: 10,
      alarmList: [],
      alarmTotal: 10,
      alarmPage: 1,
      alarmPageSize: 10,
    };
  },
  computed: {
    ...mapState(["roles"]),
  },
  methods: {
    getDeviceList() {
      getDeviceList({
        pageNum: 1,
        pageSize: 20,
      }).then((data) => {
        this.devices = data.data.records;
      });
    },
    getAlarmPageAll(page = 1) {
      getAlarmPageAll({
        ...this.formInline,
        pageNum: page,
        pageSize: this.pageSize,
      }).then((data) => {
        this.list = data.data.records || [];
        this.total = +data.data.total || 0;
      });
    },
    getAlarmList(page = 1) {
      this.loading = true;
      this.page = page;
      getAlarmList(
        {
          pageNum: page,
          pageSize: this.alarmPageSize,
        },
        {
          ...this.formInline,
        }
      )
        .then((data) => {
          this.alarmList = data.data.records || [];
          this.alarmTotal = +data.data.total || 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    postAddAlarm() {
      postAddAlarm({
        ...this.fromRuleData,
      }).then(() => {
        this.$message.success("添加成功");
        this.visible = false;
        this.getAlarmPageAll();
      });
    },
    handleAlarm(page = 1) {
      this.alarmPage = page;
      this.getAlarmList(page);
    },
    handleAdd() {
      this.dTitle = "添加规则";
      this.visible = true;
    },
    handleEdit() {
      this.dTitle = "编辑规则";
      this.visible = true;
    },
    handleReset() {
      this.$refs.form.resetFields();
    },
    handleChangeTab(tab) {
      this.tab = tab;
    },
    toRouterLink(path) {
      this.$router.push(path);
    },
  },
  created() {
    this.getAlarmPageAll();
    this.getAlarmList();
    this.getDeviceList();
  },
};
</script>

<style lang="scss" scoped>
.user-group-box {
  width: 406px;
  height: 210px;
  padding: 20px;
  overflow-y: auto;
  background: #0b315f;
  box-sizing: border-box;
  border: 1px solid;
  border-image: linear-gradient(
      90deg,
      rgba(0, 120, 255, 0.3),
      rgba(0, 120, 255, 0.3)
    )
    1 1;
}
.alarm-status {
  display: inline-block;
  width: 64px;
  padding: 0px 3px;
  height: 28px;
  font-size: 16px;
  line-height: 28px;
  text-align: center;
  color: #ff4d4f;
  background: rgba(0, 255, 36, 0.1);
  border: 1px solid #ff4d4f;
  border-radius: 4px;
}
</style>
