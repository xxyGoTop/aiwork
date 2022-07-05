<template>
  <div class="page">
    <el-form :model="queryForm" ref="queryForm" inline label-width="82px" style="margin-bottom: 16px">
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
      <!-- <el-form-item label="创建人" prop="operator">
        <el-input type="text" v-model="queryForm.operator" placeholder="请输入任务创建人" size="small" style="width:191.6px"></el-input>
      </el-form-item> -->
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
    </el-form>
    <el-row type="flex" justify="space-between">
      <el-row type="flex" justify="start">
        <el-button type="primary" size="small" @click="handleSearch">筛选</el-button>
        <el-button type="info" size="small" @click="handleReset">清空筛选</el-button>
      </el-row>
      <!-- <el-button type="primary" size="small" @click="handleUpdateGoodsInfo">新增信息修改</el-button> -->
    </el-row>
    <!-- table -->
    <el-table :data="listInfo" v-loading="loading" border style="width:100%;margin-top:15px">
      <el-table-column label="任务编号" prop="taskNum" align="center">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handleShowDetail(row)" style="color:#0061D9">{{ row.taskNum }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="任务状态" prop="status" align="center" min-width="100">
        <template #default="{ row }">
          <span>{{ row.statusDesc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="变更商品数" prop="productNum" align="center"></el-table-column>
      <el-table-column label="创建时间" prop="creationDate" align="center" min-width="120">
        <template #default="{ row }">
          {{ row.creationDate ? formatDate(new Date(row.creationDate)) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button
            type="text"
            size="small"
            @click="handleDownloadInfo(row)"
            v-if="row.status === 11">
            下载
          </el-button>
          <el-button type="text" size="small" @click="handleShowDetail(row)" v-if="row.status === 11">查看详情</el-button>
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
        :page-size="20"
        :current-page.sync="queryForm.page"
        @current-change="getList">
      </el-pagination>
    </el-row>
    <!-- 详情 -->
    <DetailDrawer :visible.sync="detailVisible" :info="detailInfo" :groupType="groupType"></DetailDrawer>
  </div>
</template>

<script>
import {
  GoodsShops,
} from '@/api/goods/list';
import {
  GetAlterList,
} from '@/api/goods/alter';
import {
  TaskResult,
} from '@/api/goods/task';
import DetailDrawer from './components/DetailDrawer';
import { format } from 'date-fns';
import {
  dlFile
} from '@/util';

const taskResultMap = {
  '-1': '任务不存在',
  '-2': '系统异常',
  '2': '结果文件生成中',
  '3': '结果文件已经上传',
};

export default {
  components: { DetailDrawer },
  data() {
    return {
      detailVisible: false,
      detailInfo: {},
      queryForm: {
        partnerId: '',
        taskNum: '',
        createDateBegin: '',
        createDateEnd: '',
        pageSize: 20,
        page: 1,
        // operator: '',
        // status: '',
        // taskType: 104
      },
      creationDate: [],
      statusList: [
        { status: '', name: '不限' },
        { status: 11, name: '已完成' },
        { status: 1, name: '生成中' },
      ],
      shops: [],
      total: 0,
      listInfo: [],
      loading: false,
      exportLink: process.env.VUE_APP_EXPORT_LINK,
    }
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
          this.queryForm.partnerId = this.shops[0].partnerId;
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
        if (value !== '' && value !== undefined) params[key] = value;
      }
      GetAlterList(params)
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
    // 查看结果
    handleShowDetail(row) {
      this.detailVisible = true;
      this.detailInfo = Object.assign({ partnerId: this.queryForm.partnerId }, row);
    },
    // 下载
    handleDownloadInfo(row) {
      TaskResult({
        taskId: row.taskId,
      })
        .then(({ data }) => {
          if (data === 3) {
            dlFile(`${this.exportLink}${row.taskId}`, `商品信息变更明细-${row.taskNum}`, 'xlsx');
          } else {
            this.$message.warning(taskResultMap[data]);
          }
        })
        .catch(console.warn);
    },
  },
   created() {
    this.getShops();
  },
}
</script>

