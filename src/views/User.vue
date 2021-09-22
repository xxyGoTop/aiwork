<template>
  <section class="page-wrapper">
    <!-- 数据表格 -->
    <div class="page-container">
      <div class="page-table-header">
        <div class="page-table-header-left">
          <span
            :class="{ active: tab === 'user' }"
            @click="handleChangeTab('user')"
            >用户管理</span
          >
          <span
            :class="{ active: tab === 'group' }"
            @click="handleChangeTab('group')"
            >用户组</span
          >
        </div>
        <div
          class="page-table-header-right"
          @click="handleAddUser()"
          v-if="tab === 'user'"
        >
          <span class="page-table-header-right-icon"></span>
          <span>新增用户</span>
        </div>
        <div class="page-table-header-right" @click="handleAddGroup()" v-else>
          <span class="page-table-header-right-icon"></span>
          <span>新增用户组</span>
        </div>
      </div>
      <div class="page-table-form" v-if="tab === 'user'">
        <el-form
          ref="formInline"
          :inline="true"
          :model="formInline"
          class="page-form-inline"
        >
          <el-form-item label="用户姓名" prop="userName">
            <el-input
              v-model="formInline.userName"
              placeholder="用户姓名"
            ></el-input>
          </el-form-item>
          <el-form-item label="手机号码" prop="tel">
            <el-input
              v-model="formInline.tel"
              placeholder="手机号码"
            ></el-input>
          </el-form-item>
          <el-form-item label="权限级别" prop="roleCode">
            <el-select v-model="formInline.roleCode" placeholder="权限级别">
              <el-option label="全部" value=""></el-option>
              <el-option
                v-for="role in roles"
                :key="role.roleCode"
                :label="role.roleName"
                :value="role.roleCode"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="用户状态" prop="status">
            <el-select v-model="formInline.status" placeholder="用户状态">
              <el-option label="全部" value=""></el-option>
              <el-option label="正常" value="shanghai"></el-option>
              <el-option label="停用" value="beijing"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-left: 80px">
            <el-button type="primary" @click="getUserPage()">查询</el-button>
            <el-button @click="handleReset()">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="page-table" v-show="tab === 'user'">
        <!-- 表格 -->
        <div class="page-table-box">
          <el-table stripe :data="list" v-loading="loading" style="width: 100%">
            <el-table-column prop="id" label="序号" width="80" align="center" />
            <el-table-column prop="name" label="用户姓名" align="center" />
            <el-table-column prop="account" label="账号" align="center" />
            <el-table-column
              prop="tel"
              label="电话"
              align="center"
              width="120"
            />
            <el-table-column prop="roleName" label="权限" align="center" />
            <el-table-column
              prop="status"
              label="用户状态"
              align="center"
              width="200"
            >
            </el-table-column>
            <el-table-column
              prop="action"
              label="操作"
              width="180"
              align="center"
            >
              <template #default="{ row }">
                <el-row>
                  <el-button type="text" @click="handleDeleteUser(row)"
                    >删除</el-button
                  >
                  <el-button type="text" @click="handleEditUser(row)"
                    >编辑</el-button
                  >
                  <el-button
                    type="text"
                    @click="
                      toRouterLink(
                        `/user/log/${row.id}?name=${row.name}&role=${row.roleName}`
                      )
                    "
                    >登录记录</el-button
                  >
                </el-row>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-row style="margin-top: 16px" type="flex" justify="end">
          <el-pagination
            background
            @current-change="getUserPage"
            :current-page="userPage"
            :page-size="pageSize"
            :total="userTotal"
            layout="total, prev, pager, next"
          />
        </el-row>
      </div>
      <div class="page-table" v-show="tab !== 'user'">
        <!-- 表格 -->
        <div class="page-table-box">
          <el-table
            stripe
            :data="groupList"
            v-loading="loading"
            style="width: 100%"
          >
            <el-table-column
              prop="groupId"
              label="序号"
              width="80"
              align="center"
            />
            <el-table-column
              prop="groupName"
              label="用户组名"
              width="180"
              align="center"
            />
            <el-table-column prop="groupName" label="用户组成员">
              <template #default="{ row }">
                <div>
                  <span v-for="u in row.users" :key="u.id">
                    {{ u.name }}
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <el-row>
                  <el-button type="text" @click="handleDeleteGroup(row)"
                    >删除</el-button
                  >
                  <el-button type="text" @click="handleEditGrooup(row)"
                    >编辑</el-button
                  >
                </el-row>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-row style="margin-top: 16px" type="flex" justify="end">
          <el-pagination
            background
            @current-change="getUserGroup"
            :current-page="groupPage"
            :page-size="pageSize"
            :total="groupTotal"
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
      :title="userTitle"
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
            :type="showpass ? 'text' : 'password'"
            v-model="fromUserData.password"
            placeholder="请输入密码"
          >
            <i
              class="form-eye-icon"
              :class="{ close: !showpass }"
              slot="suffix"
              @click="handleIconClick"
            >
            </i>
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
        <el-form-item label="权限：" prop="roleCode">
          <el-select v-model="fromUserData.roleCode" placeholder="权限级别">
            <el-option
              v-for="role in roles"
              :key="role.roleCode"
              :label="role.roleName"
              :value="role.roleCode"
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
        <el-button type="primary" @click="handleSubmitUser()">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="gVisible"
      custom-class="page-table-dialog"
      :title="groupTitle"
      center
    >
      <el-form
        :model="fromGroupData"
        status-icon
        ref="fromGroupData"
        label-width="100px"
        class="user-form"
      >
        <el-form-item label="组名：" prop="groupName">
          <el-input
            v-model="fromGroupData.groupName"
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
              v-model="fromGroupData.userIds"
              @change="handleCheckedGroupsChange"
            >
              <el-checkbox v-for="l in list" :label="l.id" :key="l.id">
                {{ l.name }}
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
        <el-button type="primary" @click="handleSubmitGroup()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 删除 -->
    <el-dialog
      :visible.sync="deleteVisible"
      custom-class="page-delete-dialog"
      center
    >
      <div class="page-delete-title">确定要删除该用戶吗？</div>
      <div class="page-container_top_bottom page-container_top_left"></div>
      <div class="page-container_top_bottom page-container_top_right"></div>
      <div class="page-container_top_bottom page-container_bottom_left"></div>
      <div class="page-container_top_bottom page-container_bottom_right"></div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteVisible = false">取 消</el-button>
        <el-button type="primary" @click="postDeleteUser()">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="deleteGroupVisible"
      custom-class="page-delete-dialog"
      center
    >
      <div class="page-delete-title">确定要删除该用戶組吗？</div>
      <div class="page-container_top_bottom page-container_top_left"></div>
      <div class="page-container_top_bottom page-container_top_right"></div>
      <div class="page-container_top_bottom page-container_bottom_left"></div>
      <div class="page-container_top_bottom page-container_bottom_right"></div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteGroupVisible = false">取 消</el-button>
        <el-button type="primary" @click="postDeleteUserGroup()"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </section>
</template>

<script>
import { cMd5 } from "@/util";
import { mapState } from "vuex";
import {
  getUserPage,
  postAddUser,
  postDeleteUser,
  postUpdateUser,
  getUserGroup,
  postAddUserGroup,
  postDeleteUserGroup,
  postUpdateUserGroup,
} from "@/api/user";

export default {
  data() {
    return {
      showpass: false,
      visible: false,
      gVisible: false,
      deleteVisible: false,
      deleteGroupVisible: false,
      formInline: {
        userName: "",
        tel: "",
        roleCode: "",
        status: "",
      },
      fromUserData: {
        account: "",
        password: "",
        name: "",
        tel: "",
        roleCode: "",
      },
      fromGroupData: {
        groupName: "",
        userIds: [],
      },
      checkedGroups: [],
      checkAll: false,
      isIndeterminate: false,
      groups: [],
      userId: null,
      groudId: null,
      grouds: [],
      userTitle: "新增用户",
      groupTitle: "新增用户组",
      // table相关
      tab: "user",
      loading: false,
      list: [],
      groupList: [],
      userTotal: 0,
      groupTotal: 0,
      userPage: 1,
      groupPage: 1,
      pageSize: 10,
    };
  },
  computed: {
    ...mapState(["roles"]),
  },
  methods: {
    getUserPage(page = 1) {
      this.userPage = page;
      this.loading = true;
      getUserPage(
        {
          pageNum: page,
          pageSize: this.pageSize,
        },
        {
          ...this.formInline,
        }
      )
        .then((data) => {
          this.list = data.data.records || [];
          this.userTotal = +data.data.total || 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getUserGroup(page = 1) {
      this.groupPage = page;
      this.loading = true;
      getUserGroup({
        pageNum: page,
        pageSize: this.pageSize,
      })
        .then((data) => {
          this.groupList = data.data.records || [];
          this.groupTotal = +data.data.total || 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    postAddUser() {
      const { password } = this.fromUserData;
      postAddUser({
        ...this.fromUserData,
        password: cMd5(password)
      }).then(() => {
        this.visible = false;
        this.$message.success("添加成功");
        this.getUserPage();
      });
    },
    postUpdateUser() {
      const { password } = this.fromUserData;
      postUpdateUser({
        userId: this.userId,
        ...this.fromUserData,
        password: cMd5(password)
      }).then(() => {
        this.visible = false;
        this.$message.success("編輯成功");
        this.getUserPage();
      });
    },
    postDeleteUser() {
      postDeleteUser({
        userId: this.userId,
      }).then(() => {
        this.$message.success("刪除成功");
        this.getUserPage();
        this.deleteVisible = false;
      });
    },
    postAddUserGroup() {
      postAddUserGroup({
        ...this.fromGroupData,
      }).then(() => {
        this.gVisible = false;
        this.$message.success("添加成功");
        this.getUserGroup();
      });
    },
    postUpdateUserGroup() {
      postUpdateUserGroup({
        groupId: this.groupId,
        ...this.fromGroupData,
      }).then(() => {
        this.gVisible = false;
        this.$message.success("編輯成功");
        this.getUserGroup();
      });
    },
    postDeleteUserGroup() {
      postDeleteUserGroup({
        groupId: this.groupId,
      }).then(() => {
        this.$message.success("刪除成功");
        this.getUserPage();
        this.deleteGroupVisible = false;
      });
    },
    handleChangeTab(tab) {
      this.tab = tab;
    },
    handleCheckAllChange(val) {
      this.fromGroupData.userIds = val ? this.list.map((g) => g.id) : [];
      this.isIndeterminate = false;
    },
    handleCheckedGroupsChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.fromGroupData.userIds.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.fromGroupData.userIds.length;
    },
    handleReset() {
      this.$refs.formInline.resetFields();
    },
    handleSubmitUser() {
      !this.userId ? this.postAddUser() : this.postUpdateUser();
    },
    handleAddUser() {
      this.userId = null;
      this.visible = true;
      this.userTitle = "新增用户";
      this.fromUserData = {
        name: "",
        account: "",
        roleCode: "",
        tel: "",
        password: "",
      };
    },
    handleEditUser({ id, name, account, roleCode, tel, password }) {
      this.userId = id;
      this.visible = true;
      this.userTitle = "编辑用户";
      this.fromUserData = {
        name,
        account,
        roleCode,
        tel,
        password,
      };
    },
    handleSubmitGroup() {
      !this.groupId ? this.postAddUserGroup() : this.postUpdateUserGroup();
    },
    handleAddGroup() {
      this.gVisible = true;
      this.groupId = null;
      this.checkAll = false;
      this.isIndeterminate = false;
      this.groupTitle = "新增用户组";
      this.fromGroupData.groupName = "";
      this.fromGroupData.userIds = [];
    },
    handleEditGrooup({ groupName, groupId, users }) {
      this.checkAll = this.list.length === users.length;
      this.isIndeterminate = this.list.length !== users.length;
      this.gVisible = true;
      this.groupId = groupId;
      this.groupTitle = "编辑用户组";
      this.fromGroupData = {
        groupName,
        userIds: users.map((u) => u.id),
      };
    },
    handleDeleteUser({ id }) {
      this.userId = id;
      this.deleteVisible = true;
    },
    handleDeleteGroup({ groupId }) {
      this.groupId = groupId;
      this.deleteGroupVisible = true;
    },
    handleIconClick() {
      this.showpass = !this.showpass;
    },
    toRouterLink(path) {
      this.$router.push(path);
    },
  },
  created() {
    this.getUserPage();
    this.getUserGroup();
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
</style>
