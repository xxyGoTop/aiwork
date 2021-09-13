<template>
  <section class="page-wrapper">
    <!-- 数据表格 -->
    <div class="page-container">
      <div class="page-table-header">
        <div class="page-table-header-left">
          <span class="normal">设备管理</span>
        </div>
        <div class="page-table-header-right" @click="handleAdd">
          <span class="page-table-header-right-icon"></span>
          <span>新增设备</span>
        </div>
      </div>
      <div class="page-table-form">
        <el-form :inline="true" :model="formInline" class="page-form-inline">
          <el-form-item label="设备名称">
            <el-input
              v-model="formInline.deviceName"
              placeholder="设备名称"
            ></el-input>
          </el-form-item>
          <el-form-item label="设备状态">
            <el-select v-model="formInline.status" placeholder="设备状态">
              <el-option label="正常" :value="0"></el-option>
              <el-option label="停用" :value="1"></el-option>
              <el-option label="已删除" :value="-1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-left: 80px">
            <el-button type="primary" @click="handleDevice()">查询</el-button>
            <el-button>重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="page-table">
        <!-- 表格 -->
        <div class="page-table-box">
          <el-table
            stripe
            :data="devices"
            v-loading="loading"
            style="width: 100%"
          >
            <el-table-column
              prop="deviceNumber"
              label="序号"
              width="80"
              align="center"
            />
            <el-table-column prop="deviceName" label="设备名称" />
            <el-table-column prop="deviceCode" label="传感器" />
            <el-table-column prop="sensorType" label="传感器" />
            <el-table-column
              prop="used"
              label="设备状态"
              align="center"
              width="200"
            >
              <template #default="{ row }">
                <span
                  class="device-status"
                  :class="{ error: row.used !== 1 }"
                  >{{
                    row.used === 1
                      ? "正常"
                      : row.used === -1
                      ? "已删除"
                      : "停用"
                  }}</span
                >
              </template>
            </el-table-column>
            <el-table-column prop="action" label="操作" width="280">
              <template #default="{ row }">
                <el-row>
                  <el-button type="text">停用</el-button>
                  <el-button type="text" @click="handleEdit(row)"
                    >编辑</el-button
                  >
                  <el-button type="text" @click="handleDelete(row)"
                    >删除</el-button
                  >
                  <el-button
                    type="text"
                    @click="toRouterLink(`/device/sensor/${row.deviceCode}`)"
                    >数据记录</el-button
                  >
                </el-row>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-row style="margin-top: 16px" type="flex" justify="end">
          <el-pagination
            background
            @current-change="handleDevice"
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
      title="添加设备"
      center
    >
      <el-form
        :model="fromData"
        status-icon
        ref="fromUserData"
        label-width="110px"
        class="dialog-form"
      >
        <el-form-item label="设备名称：" prop="deviceCode">
          <el-select v-model="fromData.deviceCode" placeholder="设备名称">
            <el-option
              v-for="device in rawDevices"
              :key="device.deviceId"
              :label="device.deviceName"
              :value="device.deviceId"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户组：" prop="groupId">
          <el-select v-model="fromData.groupId" placeholder="用户组">
            <el-option
              v-for="group in groups"
              :key="group.groupId"
              :label="group.groupName"
              :value="group.groupId"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="page-container_top_bottom page-container_top_left"></div>
      <div class="page-container_top_bottom page-container_top_right"></div>
      <div class="page-container_top_bottom page-container_bottom_left"></div>
      <div class="page-container_top_bottom page-container_bottom_right"></div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="handleAddOrUpdate()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 删除 -->
    <el-dialog
      :visible.sync="deleteVisible"
      custom-class="page-delete-dialog"
      center
    >
      <div class="page-delete-title">确定要删除该设备吗？</div>
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
import { getUserGroup } from "@/api/user";
import {
  getDeviceList,
  getDeviceRaw,
  postDeviceAdd,
  postDeviceUpdate,
  postDeviceDelete,
} from "@/api/device";

export default {
  data() {
    return {
      visible: false,
      deleteVisible: false,
      formInline: {
        deviceName: "",
        status: "",
      },
      fromData: {
        deviceCode: "",
        groupId: "",
      },
      // table相关
      loading: false,
      deviceCode: null,
      devices: [],
      rawDevices: [],
      groups: [],
      total: 10,
      page: 1,
      pageSize: 10,
    };
  },
  computed: {
    ...mapState(["roles"]),
  },
  methods: {
    getDeviceList() {
      this.loading = true;
      getDeviceList({
        pageNum: 1,
        pageSize: 20,
      })
        .then((data) => {
          this.devices = data.data.records;
          this.total = +data.data.total || 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getDeviceRaw() {
      getDeviceRaw().then((data) => {
        this.rawDevices = data.data.records;
      });
    },
    getUserGroup() {
      getUserGroup().then((data) => {
        this.groups = data.data.records;
      });
    },
    handleAdd() {
      this.visible = true;
      this.deviceCode = null;
      this.fromData.deviceCode = null;
    },
    handleEdit({ deviceCode }) {
      this.visible = true;
      this.deviceCode = deviceCode;
      this.fromData.deviceCode = deviceCode;
    },
    handleDevice(page = 1) {
      this.page = page;
      this.getDeviceList();
    },
    handleAddOrUpdate() {
      if (!this.deviceCode) {
        postDeviceAdd({
          ...this.fromData,
        })
          .then(() => {
            this.visible = false;
            this.$message.success("添加成功");
          })
          .finally(() => {
            this.handleDevice();
          });
        return;
      }
      postDeviceUpdate({
        ...this.fromData,
      })
        .then(() => {
          this.visible = false;
          this.$message.success("更新成功");
        })
        .finally(() => {
          this.handleDevice();
        });
    },
    handleDelete({ deviceCode }) {
      this.deleteVisible = true;
      this.deviceCode = deviceCode;
    },
    postDelete() {
      postDeviceDelete({
        deviceCode: this.deviceCode,
      })
        .then(() => {
          this.$message.success("删除成功");
        })
        .finally(() => {
          this.handleDevice();
        });
    },
    toRouterLink(path) {
      this.$router.push(path);
    },
  },
  created() {
    this.getDeviceRaw();
    this.getUserGroup();
    this.getDeviceList();
  },
};
</script>

<style lang="scss" scoped>
.device-status {
  display: inline-block;
  width: 64px;
  height: 28px;
  font-size: 16px;
  line-height: 28px;
  text-align: center;
  color: #52c41a;
  background: rgba(0, 255, 36, 0.1);
  border: 1px solid #52c41a;
  border-radius: 4px;
}
.device-status.error {
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
}
</style>
