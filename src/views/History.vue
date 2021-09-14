<template>
  <section class="page-wrapper">
    <div class="page-container">
      <div class="page-table-header">
        <div class="page-table-header-left">
          <span class="normal">历史记录</span>
        </div>
        <div class="page-table-header-right" @click="postDeveiceExport()">
          <span class="page-table-header-right-export-icon"></span>
          <span>导出</span>
        </div>
      </div>
      <div class="page-table-form">
        <el-form
          ref="form"
          :inline="true"
          :model="formInline"
          class="page-form-inline"
        >
          <el-form-item label="设备名称">
            <el-select v-model="formInline.deviceCode" placeholder="设备名称">
              <el-option
                v-for="d in devices"
                :key="d.deviceCode"
                :label="d.deviceName"
                :value="d.deviceCode"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="开始时间">
            <el-date-picker
              v-model="formInline.startDate"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="datetime"
              placeholder="选择日期时间"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="结束时间">
            <el-date-picker
              v-model="formInline.endDate"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="datetime"
              placeholder="选择日期时间"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="设备参数">
            <el-select v-model="formInline.sensorType" placeholder="设备参数">
              <el-option label="全部" value=""></el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-left: 80px">
            <el-button type="primary" @click="getDeviceHisroey()"
              >查询</el-button
            >
            <el-button @click="handleReset()">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- 数据表格 -->
      <div class="page-table">
        <!-- 表格 -->
        <div class="page-table-box">
          <el-table stripe :data="list" v-loading="loading" style="width: 100%">
            <el-table-column prop="id" label="序号" width="80" align="center" />
            <el-table-column
              prop="deviceName"
              label="设备名称"
              align="center"
              width="120"
            />
            <el-table-column
              prop="deviceCode"
              label="设备ID"
              align="center"
              width="120"
            />
            <el-table-column
              prop="startTime"
              label="开始时间"
              align="center"
              width="150"
            />
            <el-table-column
              prop="endTime"
              label="结束时间"
              align="center"
              width="150"
            />
            <el-table-column
              prop="location"
              label="流量(m³/s)"
              align="center"
            />
            <el-table-column prop="record" label="水位(m)" align="center" />
            <el-table-column prop="record" label="风速(m/s)" align="center" />
            <el-table-column prop="record" label="雨量(mm)" align="center" />
            <el-table-column prop="record" label="温度(℃)" align="center" />
            <el-table-column prop="record" label="风向(°)" align="center" />
            <el-table-column prop="record" label="湿度(%)" align="center" />
          </el-table>
        </div>
        <el-row style="margin-top: 16px" type="flex" justify="end">
          <el-pagination
            background
            :current-change="getDeviceHisroey"
            :current-page="page"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next, total"
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
import { mapState } from "vuex";
import { downBlobFile } from "@/util";
import {
  getDeviceList,
  getDeviceHisroey,
  postDeveiceExport,
} from "@/api/device";
export default {
  data() {
    return {
      formInline: {
        deviceCode: "",
        startDate: "",
        endDate: "",
        sensorType: "",
      },
      devices: [],
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
    getDeviceHisroey(page = 1) {
      getDeviceHisroey(
        {
          pageNum: page,
          pageSize: this.pageSize,
        },
        {
          ...this.formInline,
        }
      ).then((data) => {
        this.list = data.data.records || [];
        this.total = +data.data.total || 0;
      });
    },
    getDeviceList() {
      getDeviceList({
        pageNum: 1,
        pageSize: 20,
      }).then((data) => {
        this.devices = data.data.records;
      });
    },
    postDeveiceExport() {
      postDeveiceExport({
        ...this.formInline,
      }).then((data) => {
        downBlobFile(data, "历史记录.xlsx");
      });
    },
    handleReset() {
      this.$refs.form.resetFields();
    },
    toRouterLink(path) {
      this.$router.push(path);
    },
  },
  created() {
    this.getDeviceHisroey();
    this.getDeviceList();
  },
};
</script>

<style lang="css" scoped></style>
