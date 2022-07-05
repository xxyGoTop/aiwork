<template>
  <div class="page">
    <el-form :model="queryForm" ref="queryForm" inline label-width="82px">
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
      <el-form-item label="任务编码" prop="taskNum">
        <el-input type="text" v-model="queryForm.taskNum" placeholder="请输入任务编码" size="small" style="width:191.6px"></el-input>
      </el-form-item>
      <el-form-item label="创建人" prop="operator">
        <el-input type="text" v-model="queryForm.operator" placeholder="请输入任务创建人" size="small" style="width:191.6px"></el-input>
      </el-form-item>
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
      <el-form-item label="任务状态" prop="status">
        <el-select v-model="queryForm.status" size="small" style="width:191.6px">
          <el-option 
            v-for="status in statusList"
            :label="status.label"
            :value="status.value"
            :key="status.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-row type="flex" justify="space-between" style="margin-top:16px">
      <div class="btn-left">
        <el-button type="primary" size="small" @click="handleSearch">筛选</el-button>
        <el-button type="info" size="small" @click="handleReset">清空筛选</el-button>
      </div>
      <el-button type="primary" size="small" @click="handleGift">新增赠品促销</el-button>
    </el-row>
    <!-- table -->
    <el-table :data="giftList" v-loading="loading" border style="width:100%;margin-top:15px">
      <el-table-column label="任务编号" prop="taskNum" align="center"></el-table-column>
      <el-table-column label="任务状态" prop="status" align="center" width="100">
        <template #header>
          <DropdownSelect
            label="任务状态"
            :options="statusList"
            :topOffset="19"
            v-model="queryForm.status"
            @select="handleSearch">
          </DropdownSelect>
        </template>
        <template #default="{ row }">
          <div
            v-for="(item, key) in statusList"
            :key="key">
            <span v-if="row.status === item.value">{{ item.label }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="主商品数" prop="mainProductCount" align="center"></el-table-column>
      <el-table-column label="促销时间段" prop="taskCount" align="center">
        <template #default="{ row }">
          <span v-if="row.startTime && row.endTime">{{ `${row.startTime} ~ ${row.endTime}`}}</span>
        </template>
      </el-table-column>
      <el-table-column label="已赠订单数" prop="orderCount" align="center"></el-table-column>
      <el-table-column label="创建人" prop="creator" align="center"></el-table-column>
      <el-table-column label="创建时间" prop="creationDate" align="center" min-width="120">
        <template #default="{ row }">
          {{ row.creationDate ? formatDate(new Date(row.creationDate)) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handleViewAct(row)">查看活动</el-button>
          <el-button type="text" size="small" @click="handleGiftEdit(row)" v-if="row.status === 0">编辑</el-button>
          <el-button type="text" size="small" @click="handleGiftDel(row)" v-if="row.status === 0">删除</el-button>
          <el-button type="text" size="small" @click="handleGiftStop(row)" v-if="row.status === 4">终止</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- pagination -->
    <el-row type="flex" justify="end" style="margin:20px 0">
      <el-pagination
        background
        hide-on-single-page
        layout="total,sizes,prev,pager,next"
        :total="total"
        :page-sizes="[20, 30]"
        :page-size.sync="queryForm.pageSize"
        :current-page.sync="queryForm.page"
        @size-change="getList"
        @current-change="getList">
      </el-pagination>
    </el-row>
    <!-- 详情与编辑 -->
    <promote-edit
      :visible.sync="visible"
      :payload="payload"
      @refresh="getList">
    </promote-edit>
    <!-- 新增赠品 -->
    <create-promote
      :visible.sync="cvisible"
      :payload="cpayload"
      @refresh="getList">
    </create-promote>
  </div>
</template>

<script>
import {
  GoodsShops,
} from '@/api/goods/list';
import { format } from 'date-fns';
import PromoteEdit from './components/PromoteEdit.vue';
import CreatePromote from './components/CreatePromote.vue';
import { isValid } from '@/util';
import {
  GiftActStop,
  GiftActDel,
  GiftQuery,
} from '@/api/promote/gift';

export default {
  components: {
    PromoteEdit,
    CreatePromote,
  },
  data() {
    return {
      visible: false,
      payload: {},
      cvisible: false,
      cpayload: {},
      queryForm: {
        partnerId: '',
        taskNum: '',
        createDateBegin: '',
        createDateEnd: '',
        pageSize: 20,
        page: 1,
        operator: '',
        status: '',
        taskType: 116,
      },
      creationDate: [],
      statusList: [
        { value: '', label: '不限' },
        { value: 0, label: '待开始' },
        { value: 4, label: '活动中' },
        { value: 25, label: '已结束' },
        { value: 31, label: '任务终止' }
      ],
      shops: [],
      total: 0,
      giftList: [],
      loading: false,
    }
  },
  methods: {
    formatDate(date) {
      return format(date, 'yyyy-MM-dd HH:mm:ss')
    },
    getShops() {
      GoodsShops()
        .then(({ data }) => {
          this.shops = data && data.length ? data.filter(shop => shop.groupType === 1) : [];
          this.queryForm.partnerId = this.shops[0].partnerId || '';
          this.getList();
        })
        .catch(console.warn);
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
        if (isValid(value)) params[key] = value;
      }
      GiftQuery(params)
        .then(({ data, total }) => {
          this.giftList = data;
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
    // 新增赠品促销
    handleGift() {
      this.cvisible = true;
      this.cpayload = {
        partnerId: this.queryForm.partnerId
      }
    },
    // 编辑
    handleGiftEdit(row) {
      this.visible = true;
      this.payload = {
        ...row,
        type: 'edit'
      }
    },
    // 查看活动
    handleViewAct(row) {
      this.visible = true;
      this.payload = {
        ...row,
        type: 'detail'
      }
    },
    // 终止
    handleGiftStop(row) {
      GiftActStop(row.taskId)
        .then(() => {
          this.$message.success('终止任务成功');
          this.getList();
        })
        .catch(console.warn)
    },
    // 删除
    handleGiftDel(row) {
      GiftActDel(row.taskId)
        .then(() => {
          this.$message.success('删除任务成功');
          this.getList();
        })
        .catch(console.warn)
    },
  },
   created() {
    this.getShops();
  },
}
</script>

