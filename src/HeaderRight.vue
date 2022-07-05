<template>
<div class="header-right">
  <el-row type="flex" justify="start" align="middle" class="links">
    <el-dropdown @command="handleShowCenter" trigger="click">
      <span class="el-dropdown-link">
        {{ loginUserName || '用户' }}<i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item icon="el-icon-download" command="d">下载中心</el-dropdown-item>
        <el-dropdown-item icon="el-icon-switch-button logout" command="l">退出</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </el-row>
  <el-dialog title="下载中心" :visible.sync="dlVisible" fullscreen>
    <el-form :model="queryData" ref="queryForm" inline label-width="82px">
      <el-form-item label="任务名称" prop="taskName">
        <el-input
          type="text"
          v-model="queryData.taskName"
          placeholder="请输入任务名称"
          size="small"
          style="width:191.6px"
          clearable>
        </el-input>
      </el-form-item>
      <el-form-item label="文件名称" prop="fileName">
        <el-input
          type="text"
          v-model="queryData.fileName"
          placeholder="请输入文件名称"
          size="small"
          style="width:191.6px"
          clearable>
        </el-input>
      </el-form-item>
      <el-form-item label="任务来源" prop="taskSource">
        <el-input
          type="text"
          v-model="queryData.taskSource"
          placeholder="请输入任务来源"
          size="small"
          style="width:191.6px"
          clearable>
        </el-input>
      </el-form-item>
      <el-form-item label="创建人" prop="creationUser">
        <el-input
          type="text"
          v-model="queryData.creationUser"
          placeholder="请输入创建人"
          size="small"
          style="width:191.6px"
          clearable>
        </el-input>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          type="datetime"
          v-model="queryData.startTime"
          placeholder="开始时间"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss"
          style="width: 185px;">
        </el-date-picker>
        <span class="seperator"> - </span>
        <el-date-picker
          type="datetime"
          v-model="queryData.endTime"
          placeholder="结束时间"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss"
          style="width: 185px;">
        </el-date-picker>
      </el-form-item>
      <el-button type="primary" icon="el-icon-search" @click="getTasks">筛选</el-button>
      <el-button type="primary" @click="handleReset">清空筛选</el-button>
    </el-form>
    <el-table :data="tasks" v-loading="loading">
      <el-table-column label="任务ID" prop="taskId" width="80px"></el-table-column>
      <el-table-column label="任务来源" prop="taskSource"></el-table-column>
      <el-table-column label="任务名称" prop="taskName" min-width="130px"></el-table-column>
      <el-table-column label="文件名称" prop="fileName" min-width="100px"></el-table-column>
      <!-- <el-table-column label="文件大小" prop="contentLength"></el-table-column> -->
      <el-table-column label="状态" width="80px">
        <template #default="{ row }">
          <el-tag :type="dlStatusMap[row.status].type">{{ dlStatusMap[row.status].label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="完成进度" min-width="100px">
        <template #default="{ row }">
          <el-progress
            :text-inside="true"
            :stroke-width="20"
            :percentage="row.status === 2 || row.status === 11 ? 100 : +row.completedProgress"
            :color="row.status === 2 || row.status === 11 ? progressMap(100) : progressMap(+row.completedProgress)">
          </el-progress>
        </template>
      </el-table-column>
      <el-table-column label="创建人" prop="creationUser" width="100px"></el-table-column>
      <el-table-column label="创建时间" prop="creationDate"></el-table-column>
      <el-table-column label="文件完成时间" prop="lastChangedDate"></el-table-column>
      <!-- <el-table-column label="最后修改人" prop="lastChangedUser"></el-table-column>
      <el-table-column label="最后修改时间" prop="lastChangedDate"></el-table-column> -->
      <el-table-column label="操作" width="80px">
        <template #default="{ row }">
          <a
            v-if="row.status === 2 || row.status === 11"
            :href="`${exportLink}${row.taskId}`"
            :download="`${row.taskName}-${row.taskId}.xlsx`"
            target="_blank"
            style="color: #409EFF">下载
          </a>
        </template>
      </el-table-column>
    </el-table>
    <el-row type="flex" justify="end">
      <el-pagination
        style="margin-top: 10px"
        background
        hide-on-single-page
        layout="total, prev, pager, next"
        :total="total"
        :page-size="queryData.pageSize"
        :current-page.sync="queryData.pageNum"
        @current-change="getTasks">
      </el-pagination>
    </el-row>
  </el-dialog>
</div>
</template>

<script>
import {
  TasksQuery,
  // TaskDL,
} from '@/api/file';
import {
  GoodsShops,
} from '@/api/goods/list';
// import { Logout } from '@/api/auth'
import {
  // saveFile,
  hasValue
} from '@/util';
const {
  VUE_APP_EXPORT_LINK,
} = process.env

export default {
  data() {
    return {
      exportLink: VUE_APP_EXPORT_LINK,
      dlVisible: false,
      loading: false,
      total: 0,
      tasks: [],
      queryData: {
        taskName: '',
        fileName: '',
        taskSource: '',
        startTime: '',
        endTime: '',
        creationUser: '',
        appId: 2,
        pageNum: 1,
        pageSize: 10,
        orderBy: 1,
      },
      dlStatusMap: {
        1: {
          label: '生成中',
          type: 'warning',
        },
        2: {
          label: '已完成',
          type: 'success',
        },
        3: {
          label: '失败',
          type: 'info',
        },
        11: {
          label: '已完成',
          type: 'success',
        },
        21: {
          label: '失败',
          type: 'info',
        }
      },
      shops: [],
    };
  },
  computed: {
    loginUserName() {
      return this.$store.state.username
    }
  },
  methods: {
    handleReset() {
      this.$refs.queryForm.resetFields();
      this.queryData.startTime = '';
      this.queryData.endTime = '';
    },
    progressMap(val) {
      if (!hasValue(val)) return ''
      if (val >= 0 && val <= 50) {
        return '#F56C6C'
      } else if (val > 50 && val <= 75) {
        return '#E6A23C'
      } else if (val > 75 && val < 100) {
        return '#409EFF'
      } else {
        return '#67C23A'
      }
    },
    getShops() {
      GoodsShops()
        .then(({ data }) => {
          this.shops = data || [];
          if (this.shops.length) {
            // this.queryData.partnerId = this.shops[0].partnerId;
          } else {
            this.$message.warning('尚无店铺');
          }
        })
        .catch(console.warn);
    },
    handleShowCenter(command) {
      switch (command) {
        case 'd':
          this.dlVisible = true;
          this.getTasks();
          break;
        case 'l':
          window.location.href = `${location.origin}/om-api/logout`;
          break;
      }
    },
    getTasks() {
      if (this.loading) return;
      const queryParams = {
        ...this.queryData
      };
      const params = Object.create(null);
      for (const [key, value] of Object.entries(queryParams)) {
        if (hasValue(value)) {
          params[key] = value
        }
      }
      this.loading = true;
      TasksQuery(params)
        .then(({ data }) => {
          this.total = data.total;
          this.tasks = data.list;
        })
        .catch(console.warn)
        .finally(() => {
          this.loading = false;
        });
    },
  },
}
</script>

<style lang="scss" scoped>
.links-item {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 100%;
  cursor: pointer;
  text-decoration: none;
  transition: all 200ms;
  &:hover {
    background-color: rgba($color: #ffffff, $alpha: .1);
  }
}
.seperator{
  display: inline-flex;
  margin: 0 5px;
}
.download {
  width: 30px;
  height: 30px;
}
</style>

<style lang="scss">
.header-right{
  .el-dropdown{
    cursor: pointer;
  }
  .el-dropdown-link{
    color:#ffffff
  }
}
</style>
