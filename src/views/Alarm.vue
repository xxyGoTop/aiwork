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
        <div
          class="page-table-header-right"
          @click="postAlarmExport()"
          v-if="tab === 'user'"
        >
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
      <div class="page-table" v-show="tab === 'user'">
        <!-- 表格 -->
        <div class="page-table-box">
          <el-table
            stripe
            :data="alarmList"
            v-loading="loading"
            style="width: 100%"
            size="small"
          >
            <el-table-column
              type="index"
              label="序号"
              width="80"
              align="center"
            />
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
        <el-row
          class="page-pagt-wrap"
          style="margin-top: 16px"
          type="flex"
          justify="center"
        >
          <el-pagination
            background
            @current-change="handleAlarm"
            :current-page="alarmPage"
            :page-size="alarmPageSize"
            :total="alarmTotal"
            :hide-on-single-page="true"
            layout="total, prev, pager, next"
          />
        </el-row>
      </div>
      <div class="page-table" v-show="tab !== 'user'">
        <!-- 表格 -->
        <div class="page-table-box">
          <el-table stripe :data="list" size="small" v-loading="loading" style="width: 100%">
            <el-table-column
              prop="ruleId"
              label="序号"
              width="80"
              align="center"
            />
            <el-table-column prop="alarmName" label="规则名称" align="center" />
            <el-table-column
              prop="sensorType"
              label="报警类型"
              width="110"
              align="center"
            >
              <template #default="{ row }">
                <span class="alarm-status">{{
                  sensorsMap[row.sensorType]
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="deviceName"
              label="报警设备"
              width="380"
              align="center"
            />
            <el-table-column
              prop="platformThreshold"
              label="平台报警值"
              width="130"
              align="center"
            />
            <el-table-column
              prop="mobiles"
              label="手机号"
              width="280"
              align="center"
            >
              <template #default="{ row }">
                <div :title="row.mobiles" class="table-span-over">
                  {{ row.mobiles }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="smsThreshold"
              label="短信报警值"
              width="130"
              align="center"
            ></el-table-column>
            <el-table-column prop="action" label="操作" width="280">
              <template #default="{ row }">
                <el-row>
                  <el-button type="text" @click="handleEdit(row)"
                    >编辑</el-button
                  >
                  <el-button type="text" @click="handleDelete(row)"
                    >删除</el-button
                  >
                </el-row>
              </template>
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
            @current-change="getAlarmRulePage"
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
    <!-- 编辑 -->
    <el-dialog
      :visible.sync="visible"
      :append-to-body="true"
      custom-class="page-table-dialog"
      :title="dTitle"
      center
    >
      <el-form
        :model="fromRuleData"
        :rules="rules"
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
        <el-form-item label="报警手机号：" prop="mobiles">
          <el-input
            v-model="fromRuleData.mobiles"
            placeholder="多个英文逗号隔开"
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
        <el-button type="primary" @click="handleSubmit()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 删除 -->
    <el-dialog
      :visible.sync="deleteVisible"
      :append-to-body="true"
      custom-class="page-delete-dialog"
      center
    >
      <div class="page-delete-title">确定要删除该规则吗？</div>
      <div class="page-container_top_bottom page-container_top_left"></div>
      <div class="page-container_top_bottom page-container_top_right"></div>
      <div class="page-container_top_bottom page-container_bottom_left"></div>
      <div class="page-container_top_bottom page-container_bottom_right"></div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteVisible = false">取 消</el-button>
        <el-button type="primary" @click="postDelete()">确 定</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import { mapState } from "vuex";
import {
  getAlarmList,
  getAlarmRulePage,
  postAddAlarm,
  postAlarmExport,
  postDeleteAlarm,
  postEditAlarm,
} from "@/api/alarm";
import { getDeviceList } from "@/api/device";
import { downBlobFile } from "@/util";

export default {
  data() {
    const validateBlank = (_, value, callback) => {
      if (!value) {
        callback(new Error("请选择设备"));
      }
      callback();
    };
    const validateMobiles = (_, value, callback) => {
      if (!value) {
        callback(new Error("请输入正确的手机号"));
      }
      const isMoble = value
        .split(",")
        .filter((v) => v)
        .every((v) => /^1[3-9]\d{9}$/.test(v));
      if (!isMoble) {
        callback(new Error("请输入正确的手机号"));
      }
      callback();
    };
    const validateShold = (_, value, callback) => {
      const reg = /^([1-9][\d]*|0)(\.[\d]+)?$/;
      if (!value) {
        callback(new Error("请输入正确的数值"));
      }
      if (!reg.test(value)) {
        callback(new Error("请输入正确的数值"));
      }
      callback();
    };
    return {
      deleteVisible: false,
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
        mobiles: "",
        platformThreshold: "",
        smsThreshold: "",
      },
      rules: {
        deviceId: [{ validator: validateBlank, trigger: "change" }],
        mobiles: [{ validator: validateMobiles, trigger: "blur" }],
        platformThreshold: [{ validator: validateShold, trigger: "blur" }],
        smsThreshold: [{ validator: validateShold, trigger: "blur" }],
      },
      sensorsMap: {},
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
      ruleId: null,
      groups: [],
      devices: [],
      // table相关
      tab: "user",
      loading: false,
      list: [],
      total: 10,
      page: 1,
      pageSize: 20,
      alarmList: [],
      alarmTotal: 10,
      alarmPage: 1,
      alarmPageSize: 20,
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
    getAlarmRulePage(page = 1) {
      this.page = page;
      getAlarmRulePage({
        pageNum: page,
        pageSize: this.pageSize,
      }).then((data) => {
        this.list = data.data.records || [];
        this.total = +data.data.total || 0;
      });
    },
    getAlarmList(page = 1) {
      this.loading = true;
      let formObj = {};
      Object.keys(this.formInline).forEach((key) => {
        if (this.formInline[key]) {
          formObj = {
            ...formObj,
            [key]: this.formInline[key],
          };
        }
      });
      getAlarmList(
        {
          pageNum: page,
          pageSize: this.alarmPageSize,
        },
        {
          ...formObj,
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
    postAlarmExport() {
      let formObj = {};
      Object.keys(this.formInline).forEach((key) => {
        if (this.formInline[key]) {
          formObj = {
            ...formObj,
            [key]: this.formInline[key],
          };
        }
      });
      postAlarmExport({
        ...formObj,
      }).then((data) => {
        downBlobFile(data, "报警记录.xlsx");
      });
    },
    postAddAlarm() {
      let formObj = {};
      Object.keys(this.fromRuleData).forEach((key) => {
        if (this.fromRuleData[key]) {
          formObj = {
            ...formObj,
            [key]: this.fromRuleData[key],
          };
        }
      });
      postAddAlarm({
        ...formObj,
      }).then(() => {
        this.$message.success("添加成功");
        this.visible = false;
        this.getAlarmRulePage();
      });
    },
    postEditAlarm() {
      let formObj = {};
      Object.keys(this.fromRuleData).forEach((key) => {
        if (this.fromRuleData[key]) {
          formObj = {
            ...formObj,
            [key]: this.fromRuleData[key],
          };
        }
      });
      postEditAlarm({
        ...formObj,
      }).then(() => {
        this.$message.success("更新成功");
        this.visible = false;
        this.getAlarmRulePage();
      });
    },
    handleAlarm(page = 1) {
      this.alarmPage = page;
      this.getAlarmList(page);
    },
    handleSubmit() {
      const { ruleId } = this.fromRuleData;
      this.$refs.fromRuleData.validate().then(() => {
        ruleId ? this.postEditAlarm() : this.postAddAlarm();
      });
    },
    handleAdd() {
      this.dTitle = "添加规则";
      this.visible = true;
      this.fromRuleData = {
        ruleId: "",
        alarmName: "",
        deviceId: "",
        sensorType: "",
        mobiles: "",
        platformThreshold: "",
        smsThreshold: "",
      };
    },
    handleEdit({
      ruleId,
      alarmName,
      deviceId,
      sensorType,
      mobiles,
      platformThreshold,
      smsThreshold,
    }) {
      this.dTitle = "编辑规则";
      this.visible = true;
      this.fromRuleData = {
        ruleId,
        alarmName,
        deviceId,
        sensorType,
        mobiles,
        platformThreshold,
        smsThreshold,
      };
    },
    handleDelete({ ruleId }) {
      this.deleteVisible = true;
      this.ruleId = ruleId;
    },
    postDelete() {
      postDeleteAlarm({
        ruleId: this.ruleId,
      }).then(() => {
        this.$message.success("删除成功");
        this.deleteVisible = false;
        this.getAlarmRulePage();
      });
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
    this.sensorsType.forEach((s) => {
      this.sensorsMap[s.value] = s.key;
    });
    this.getAlarmRulePage();
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
.table-span-over {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
