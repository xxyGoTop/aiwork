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
        <el-form
          ref="form"
          :inline="true"
          :model="formInline"
          class="page-form-inline"
        >
          <el-form-item label="设备名称" prop="name">
            <el-input
              v-model="formInline.name"
              placeholder="设备名称"
            ></el-input>
          </el-form-item>
          <el-form-item label="设备状态" prop="status">
            <el-select v-model="formInline.status" placeholder="设备状态">
              <el-option label="全部" value=""></el-option>
              <el-option label="正常" value="ON_LINE"></el-option>
              <el-option label="停用" value="OFF_LINE"></el-option>
              <el-option label="已删除" value="DELETED"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-left: 80px">
            <el-button type="primary" @click="handleDevice()">查询</el-button>
            <el-button @click="handleReset()">重置</el-button>
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
            size="small"
          >
            <el-table-column prop="id" label="序号" width="80" align="center" />
            <el-table-column prop="name" label="设备名称" />
            <el-table-column prop="code" label="设备ID" />
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
                  :class="{ error: row.status !== 0 }"
                  >{{
                    row.status === 0
                      ? "正常"
                      : row.status === -1
                      ? "已删除"
                      : "停用"
                  }}</span
                >
              </template>
            </el-table-column>
            <el-table-column prop="action" label="操作" width="280">
              <template #default="{ row }">
                <el-row>
                  <el-button
                    v-if="row.status !== -1"
                    type="text"
                    @click="handleStopDevice(row)"
                    >{{ row.status === 0 ? "停用" : "启用" }}</el-button
                  >
                  <el-button type="text" @click="handleEdit(row)"
                    >编辑</el-button
                  >
                  <el-button type="text" @click="handleDelete(row)"
                    >删除</el-button
                  >
                  <el-button
                    type="text"
                    @click="
                      toRouterLink(
                        `/device/sensor/${row.code}?name=${row.name}`
                      )
                    "
                    >数据记录</el-button
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
            @current-change="handleDevice"
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
      v-loading="detailLoading"
      :visible.sync="visible"
      :append-to-body="true"
      custom-class="page-table-dialog"
      :title="dTitle"
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
      :append-to-body="true"
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
    <!-- 详情 -->
    <el-dialog
      :visible.sync="detailVisible"
      :append-to-body="true"
      custom-class="page-table-dialog"
      title="设备详情"
      center
    >
      <el-form status-icon label-width="130px" class="user-form">
        <el-form-item label="设备名：">
          <el-input v-model="detail.deviceName"></el-input>
        </el-form-item>
        <el-form-item label="设备ID：">
          <el-input v-model="detail.deviceCode"></el-input>
        </el-form-item>
        <el-form-item label="传感器：">
          <el-input v-model="detail.sensorTypes"></el-input>
        </el-form-item>
      </el-form>
      <div class="page-container_top_bottom page-container_top_left"></div>
      <div class="page-container_top_bottom page-container_top_right"></div>
      <div class="page-container_top_bottom page-container_bottom_left"></div>
      <div class="page-container_top_bottom page-container_bottom_right"></div>
    </el-dialog>
  </section>
</template>

<script>
import { mapState } from "vuex"
import { getUserGroup } from "@/api/user"
import {
  getDevicePage,
  getDeviceRaw,
  getDeviceDetail,
  postDeviceAdd,
  postDeviceUpdate,
  postDeviceDelete,
} from "@/api/device"

export default {
  data() {
    return {
      visible: false,
      deleteVisible: false,
      detailVisible: false,
      dTitle: "添加设备",
      formInline: {
        name: "",
        status: "",
      },
      fromData: {
        deviceCode: "",
        groupId: "",
      },
      // table相关
      loading: false,
      detailLoading: false,
      deviceCode: null,
      detail: {},
      devices: [],
      rawDevices: [],
      groups: [],
      total: 10,
      page: 1,
      pageSize: 10,
    }
  },
  computed: {
    ...mapState(["roles"]),
  },
  methods: {
    getDevicePage() {
      this.loading = true
      getDevicePage({
        pageNum: this.page,
        pageSize: 20,
        ...this.formInline,
      })
        .then((data) => {
          this.devices = data.data.records || []
          this.total = +data.data.total || 0
        })
        .finally(() => {
          this.loading = false
        })
    },
    getDeviceRaw() {
      getDeviceRaw().then((data) => {
        this.rawDevices = data.data.records
      })
    },
    getDeviceDetail(deviceCode) {
      this.detailLoading = true
      getDeviceDetail(deviceCode)
        .then((data) => {
          this.detail = data.data
          this.fromData.deviceCode = data.data.deviceCode
          this.fromData.groupId = data.data.groupId
        })
        .finally(() => {
          this.detailLoading = false
        })
    },
    getUserGroup() {
      getUserGroup().then((data) => {
        this.groups = data.data.records
      })
    },
    handleAdd() {
      this.dTitle = "添加设备"
      this.visible = true
      this.deviceCode = null
      this.fromData.deviceCode = null
    },
    handleEdit({ code, groupId }) {
      this.dTitle = "编辑设备"
      this.visible = true
      this.deviceCode = code
      this.fromData.deviceCode = code
      this.fromData.groupId = groupId
      this.getDeviceDetail({ deviceCode: code })
    },
    handleDevice(page = 1) {
      this.page = page
      this.getDevicePage()
    },
    handleAddOrUpdate() {
      if (!this.deviceCode) {
        postDeviceAdd({
          ...this.fromData,
        })
          .then(() => {
            this.visible = false
            this.$message.success("添加成功")
          })
          .finally(() => {
            this.handleDevice()
          })
        return
      }
      postDeviceUpdate({
        ...this.fromData,
      })
        .then(() => {
          this.visible = false
          this.$message.success("更新成功")
        })
        .finally(() => {
          this.handleDevice()
        })
    },
    handleStopDevice({ deviceCode, status, groupId }) {
      postDeviceUpdate({
        deviceCode,
        groupId,
        status: status === 0 ? 1 : 0,
      }).then(() => {
        this.$message.success("操作成功")
      })
    },
    handleDelete({ code }) {
      this.deleteVisible = true
      this.deviceCode = code
    },
    postDelete() {
      postDeviceDelete({
        deviceCode: this.deviceCode,
      })
        .then(() => {
          this.$message.success("删除成功")
        })
        .finally(() => {
          this.handleDevice()
        })
    },
    handleReset() {
      this.$refs.form.resetFields()
    },
    handleDetail({ code }) {
      this.detailVisible = true
      this.getDeviceDetail({ deviceCode: code })
    },
    toRouterLink(path) {
      this.$router.push(path)
    },
  },
  created() {
    this.getDeviceRaw()
    this.getUserGroup()
    this.getDevicePage()
  },
}
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
