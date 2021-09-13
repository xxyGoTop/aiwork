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
        <div class="page-table-header-right" v-else>
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
              <el-option label="区域一" value="shanghai"></el-option>
              <el-option label="区域二" value="beijing"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="报警设备" prop="deviceId">
            <el-select v-model="formInline.deviceId" placeholder="报警设备">
              <el-option label="区域一" value="shanghai"></el-option>
              <el-option label="区域二" value="beijing"></el-option>
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
            <el-table-column
              prop="sensorType"
              label="报警类型"
              align="center"
            />
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
          <div class="page-table-box-header">
            <h3>设备：拉萨河闸站光理所3号闸水流量检测站</h3>
            <div class="box-header-right">
              <el-button type="text">编辑</el-button>
              <el-button type="text">删除</el-button>
            </div>
          </div>
          <el-table stripe :data="list" v-loading="loading" style="width: 100%">
            <el-table-column
              prop="name"
              label="报警类型"
              width="180"
              align="center"
            />
            <el-table-column
              prop="account"
              label="平台报警警戒值"
              align="center"
            />
            <el-table-column
              prop="action"
              label="短信报警警戒值"
              align="center"
            ></el-table-column>
          </el-table>
        </div>
        <el-row style="margin-top: 16px" type="flex" justify="end">
          <el-pagination
            background
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
      title="添加用户"
      center
    >
      <el-form
        :model="fromUserData"
        status-icon
        ref="fromUserData"
        label-width="100px"
        class="user-form"
      >
        <el-form-item label="账号：" prop="account">
          <el-input
            v-model="fromUserData.account"
            placeholder="请输入账号"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码：" prop="password">
          <el-input
            type="password"
            v-model="fromUserData.password"
            placeholder="请输入密码"
          >
            <i class="el-icon-edit el-input__icon" slot="suffix"> </i>
          </el-input>
        </el-form-item>
        <el-form-item label="姓名：" prop="name">
          <el-input
            v-model="fromUserData.name"
            placeholder="请输入姓名"
          ></el-input>
        </el-form-item>
        <el-form-item label="手机号：" prop="tel">
          <el-input
            v-model="fromUserData.tel"
            placeholder="请输入手机号"
          ></el-input>
        </el-form-item>
        <el-form-item label="权限：" prop="roleId">
          <el-input
            v-model="fromUserData.roleId"
            placeholder="请选择权限"
          ></el-input>
        </el-form-item>
      </el-form>
      <div class="page-container_top_bottom page-container_top_left"></div>
      <div class="page-container_top_bottom page-container_top_right"></div>
      <div class="page-container_top_bottom page-container_bottom_left"></div>
      <div class="page-container_top_bottom page-container_bottom_right"></div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="visible = false">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="gVisible"
      custom-class="page-table-dialog"
      title="新增用户组"
      center
    >
      <el-form
        :model="fromGroupData"
        status-icon
        ref="fromGroupData"
        label-width="100px"
        class="user-form"
      >
        <el-form-item label="组名：" prop="account">
          <el-input
            v-model="fromGroupData.account"
            placeholder="请输入组名"
          ></el-input>
        </el-form-item>
        <el-form-item label="组员：" prop="group">
          <div class="user-group-box">
            <el-checkbox
              :indeterminate="isIndeterminate"
              v-model="checkAll"
              @change="handleCheckAllChange"
            >
              全选
            </el-checkbox>
            <div style="margin: 0px 0 24px"></div>
            <el-checkbox-group
              v-model="checkedGroups"
              @change="handleCheckedGroupsChange"
            >
              <el-checkbox
                v-for="group in groups"
                :label="group.id"
                :key="group.id"
              >
                {{ group.label }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>
      </el-form>
      <div class="page-container_top_bottom page-container_top_left"></div>
      <div class="page-container_top_bottom page-container_top_right"></div>
      <div class="page-container_top_bottom page-container_bottom_left"></div>
      <div class="page-container_top_bottom page-container_bottom_right"></div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="gVisible = false">取 消</el-button>
        <el-button type="primary" @click="gVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import { mapState } from "vuex";
import { getUserPage } from "@/api/user";
import { getAlarmList } from "@/api/alarm";

export default {
  data() {
    return {
      visible: false,
      gVisible: false,
      formInline: {
        startTime: "",
        endTime: "",
        sensorType: "",
        deviceId: "",
      },
      fromUserData: {
        account: "",
        password: "",
        checkPass: "",
        name: "",
        tel: "",
        roleId: "",
      },
      fromGroupData: {
        name: "",
        group: [],
      },
      checkedGroups: [],
      checkAll: false,
      isIndeterminate: false,
      groups: [
        {
          label: "巴桑卓玛",
          id: 1,
        },
        {
          label: "布次仁",
          id: 2,
        },
        {
          label: "格桑旺久",
          id: 3,
        },
        {
          label: "格桑旺久2",
          id: 4,
        },
      ],
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
    getUserPage(page = 1) {
      getUserPage({
        ...this.formInline,
        pageNum: page,
        pageSize: this.pageSize,
      }).then((data) => {
        this.list = data.data.records || [];
        this.total = +data.data.total || 0;
      });
    },
    getAlarmList() {
      this.loading = true;
      getAlarmList({
        ...this.formInline,
        pageNum: this.alarmPage,
        pageSize: this.alarmPageSize,
      })
        .then((data) => {
          this.alarmList = data.data.records || [];
          this.alarmTotal = +data.data.total || 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleAlarm(page = 1) {
      this.alarmPage = page;
      this.getAlarmList();
    },
    handleReset() {
      this.$refs.form.resetFields();
    },
    handleChangeTab(tab) {
      this.tab = tab;
    },
    handleCheckAllChange(val) {
      this.checkedGroups = val ? this.groups.map((g) => g.id) : [];
      this.isIndeterminate = false;
    },
    handleCheckedGroupsChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.groups.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.groups.length;
    },
    toRouterLink(path) {
      this.$router.push(path);
    },
  },
  created() {
    this.getUserPage();
    this.getAlarmList();
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
.page-table-box-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  margin-bottom: 30px;
  h3 {
    font-size: 18px;
  }
}
</style>
