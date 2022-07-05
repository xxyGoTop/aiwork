<template>
  <div class="page">
    <el-form :model="queryForm" ref="queryForm" inline label-width="82px">
      <el-row type="flex" justify="start" style="margin-bottom:15px">
        <el-col :span="8">
           <el-form-item label="选择店铺">
            <el-select placeholder="选择店铺" v-model="queryForm.partnerId" size="small" style="width:191.6px" class="shop-select">
              <el-option 
                v-for="(shop, index) in shops"
                :label="shop.partnerName"
                :value="shop.partnerId"
                :key="index">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="任务编码" prop="taskNum">
            <el-input type="text" v-model="queryForm.taskNum" placeholder="请输入任务编码" size="small" style="width:191.6px"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="创建人" prop="operator">
            <el-input type="text" v-model="queryForm.operator" placeholder="请输入任务创建人" size="small" style="width:191.6px"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row type="flex" justify="start" align="middle" style="margin-bottom:16px">
        <el-form-item label="创建时间" prop="creationDate">
          <el-date-picker
            v-model="creationDate"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="small"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width:350px;">
          </el-date-picker>
        </el-form-item>
      </el-row>
    </el-form>
    <el-row type="flex" justify="space-between">
      <div class="btn-left">
        <el-button type="primary" size="small" @click="handleSearch">筛选</el-button>
        <el-button type="info" size="small" @click="handleReset">清空筛选</el-button>
      </div>
      <el-button type="primary" size="small" @click="handleUpdateGoodsInfo('add')">新增信息修改</el-button>
    </el-row>
    <!-- table -->
    <el-table :data="listInfo" v-loading="loading" border style="width:100%;margin-top:15px">
      <!-- <el-table-column type="selection"></el-table-column> -->
      <el-table-column label="任务编号" prop="taskNum" align="center">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handleUpdateResult(row)" style="color:#0061D9">{{ row.taskNum }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="修改类型" prop="subTaskType" align="center"></el-table-column>
      <el-table-column label="修改商品数" prop="taskCount" align="center"></el-table-column>
      <el-table-column label="任务状态" prop="status" align="center" min-width="100">
        <template #header>
          <DropdownSelect
            label="任务状态"
            :options="statusList"
            labelKey="name"
            valueKey="status"
            :topOffset="19"
            v-model="queryForm.status"
            @select="handleSearch">
          </DropdownSelect>
        </template>
        <template #default="{ row }">
          <span>{{ row.status }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" prop="creator" align="center"></el-table-column>
      <el-table-column label="创建时间" prop="createDate" align="center" sortable min-width="120">
        <template #default="{ row }">
          {{ row.createDate ? formatDate(new Date(row.createDate)) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button
            type="text"
            size="small"
            @click="handleStopUpdateInfo(row)"
            v-if="(row.subTaskType === '标题锁定' || row.subTaskType === '标题前缀' || row.subTaskType === '替换BANNER' || row.subTaskType === '替换banner' || row.subTaskType === '替换首图' || row.subTaskType === '定时包邮' || (row.groupType === 1 && (row.subTaskType === '全量更新' || row.subTaskType === '更新主站标题' || row.subTaskType === '更新主站主图'|| row.subTaskType === '更新主站详情'))) && row.status === '进行中'">
            停止
          </el-button>
          <el-button type="text" size="small" @click="handleUpdateGoodsInfo('edit', row)" v-if="row.subTaskType === '定时包邮' && row.status === '进行中' && (Date.now() < new Date(row.endTime).getTime())">编辑</el-button>
          <el-button type="text" size="small" @click="handleUpdateResult(row)">查看修改结果</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- pagination -->
    <el-row type="flex" justify="end" style="margin:20px 0">
      <el-pagination
        background
        hide-on-single-page
        layout="total,prev,pager,next"
        :total="total"
        :page-size="queryForm.pageSize"
        :current-page="queryForm.page"
        @current-change="handleCurrentChange">
      </el-pagination>
    </el-row>
    <!-- 修改信息 -->
    <BatchDrawer
      :visible.sync="visible"
      :pickShop="queryForm.partnerId"
      :shops="shops"
      :ty="updateType"
      :payload="editPayload"
      @success="handleSearch">
    </BatchDrawer>
    <!-- 详情 -->
    <DetailDrawer
      :visible.sync="detailVisible"
      :info="detailInfo"
      :groupType="groupType">
    </DetailDrawer>
  </div>
</template>

<script>
import {
  GoodsShops,
} from '@/api/goods/list';
import {
  // TaskDetailQuery,
  QueryTaskList,
  TaskStatusList,
  InfoAbort
} from '@/api/goods/task';
import BatchDrawer from './components/BatchDrawer';
import DetailDrawer from './components/DetailDrawer';
import { format } from 'date-fns';

export default {
  components: { BatchDrawer, DetailDrawer },
  data() {
    return {
      visible: false,
      detailVisible: false,
      detailInfo: {},
      tempDetailInfo: {},
      editPayload: {},
      queryForm: {
        partnerId: '',
        taskNum: '',
        createDateBegin: '',
        createDateEnd: '',
        pageSize: 10,
        page: 1,
        operator: '',
        status: '',
        taskType: 104
      },
      creationDate: [],
      statusList: [],
      createPerson: [],
      shops: [],
      total: 0,
      listInfo: [],
      loading: false,
      updateType: 'add'
    }
  },
  beforeRouteLeave(_, from , next) {
    this.$store.commit('setPartnerId', this.queryForm.partnerId || '');
    next()
  },
  computed: {
    groupType() {
      const findedShop = this.shops.find(shop => shop.partnerId === this.queryForm.partnerId);
      return findedShop ? findedShop.groupType : '';
    },
  },
  methods: {
    formatDate(date) {
      return format(date, 'yyyy-MM-dd HH:mm:ss')
    },
    getShops() {
      GoodsShops()
        .then(({ data }) => {
          this.shops = data || [];
          this.shops.push({
            groupType: 2,
            partnerId: -2,
            partnerName: '拼多多_全平台'
          })
          this.queryForm.partnerId = this.$store.state.partnerId ? this.$store.state.partnerId : this.shops[0].partnerId;
          this.getList();
        })
        .catch(console.warn);
    },
    // 任务状态
    getTaskStatus() {
      TaskStatusList({ taskType: 104 })
        .then(({ data }) => {
          this.statusList = [
            { status: '', name: '不限' },
            ...data,
          ];
        })
        .catch(console.warn)
    },
    // 查询
    getList() {
      if (this.loading) return
      this.loading = true;
      this.creationDate = this.creationDate || [];
      const queryParams = {
        ...this.queryForm,
        createDateBegin: this.creationDate[0],
        createDateEnd: this.creationDate[1]
      };
      const params = Object.create(null);
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== '' && value !== undefined) params[key] = value;
      }
      QueryTaskList(params)
        .then(({ data, total }) => {
          this.listInfo = data;
          this.total = total;
        })
        .catch(console.warn)
        .finally(() => {
          this.loading = false;
        })
    },
    handleSearch() {
      this.queryForm.page = 1;
      this.getList()
    },
    handleReset() {
      this.$refs.queryForm.resetFields();
      this.creationDate = [];
    },
    handleCurrentChange(page) {
      this.queryForm.page = page;
      this.getList()
    },
    // 查看结果
    handleUpdateResult(row) {
      this.detailVisible = true;
      let curStatus = '';
      this.statusList.map(item => {
        if (item.name === row.status) {
          curStatus = item.status
        }
      })
      this.detailInfo = Object.assign(row, { partnerId: this.queryForm.partnerId, state: curStatus });
    },
    // 新增信息修改
    handleUpdateGoodsInfo(ty, row) {
      this.visible = true;
      this.updateType = ty;
      if (ty === 'edit') {
        this.editPayload = row
      }
    },
    // 停止
    handleStopUpdateInfo(row) {
      let taskSubType = '';
      switch (row.subTaskType) {
        case '标题锁定': 
          taskSubType = 1045;
          break;
        case '标题前缀':
          taskSubType = 1046;
          break;
        case '替换BANNER':
          taskSubType = 1047;
          break;
        case '替换banner':
          taskSubType = 1047;
          break; 
        case '替换首图':
          taskSubType = 1048;
          break; 
        case '定时包邮':
          taskSubType = 1049;
          break;
        case '全量更新':
          taskSubType = 1041;
          break;
        case '更新主站标题':
          taskSubType = 1042;
          break;
        case '更新主站主图':
          taskSubType = 1043;
          break;
        case '更新主站详情':
          taskSubType = 1044;
          break;
      }
      const params = {
        id: row.id,
        taskSubType: taskSubType
      }
      InfoAbort(params)
        .then(() => {
          this.$message.success('停止商品信息修改成功');
          this.getList();
        })
        .catch(console.warn)
    }
  },
   created() {
    this.getShops();
    this.getTaskStatus();
  },
}
</script>

<style lang="scss" scoped>

</style>
