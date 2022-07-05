<template>
  <div class="page">
    <div class="page-title">快手结算单</div>
    <div class="notice-wrap">
      <div class="notice-list notice">官方公告</div>
      <div class="notice-list">1.此结算单列表均为人工定期手动从快手小店后台下载后并导入的结算单。</div>
      <div class="notice-list">2.导入结算单务必要谨慎操作，导入后<b style="color:red">不能修改！</b></div>
      <div class="notice-list">3.导入模版为快手后台直接下载的excel数据直接导入即可，不需增删数据。</div>
    </div>

    <el-form :model="billForm" ref="billForm" inline label-width="70px" style="margin-top:24px">
      <el-form-item label="下单时间" prop="orderDate">
        <el-date-picker
          unlink-panels
          type="datetimerange"
          v-model="billForm.orderDate"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss"
          :picker-options="pickerOptions"
          clearable>
        </el-date-picker>
      </el-form-item>
      <el-form-item label="同步状态" prop="status">
        <el-select v-model="billForm.status">
          <el-option
            v-for="(value, ky) of syncOptions"
            :key="ky"
            :label="value"
            :value="ky">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="订单号" prop="orderId">
        <el-input v-model="billForm.orderId" clearable></el-input>
      </el-form-item>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button type="info" @click="handleReset">重置</el-button>
    </el-form>
    <el-row type="flex" align="middle">
      <el-button type="primary" @click="handleImport" style="width:80px">导入</el-button>
      <el-button type="text" @click="handleTask">任务列表</el-button>
      <!-- <el-button type="text" @click="handleDownloadTemplate">下载模板</el-button> -->
    </el-row>
    
    <div style="font-weight:bold;margin:24px 0 5px 0;">数据列表</div>
    <el-table :data="billList" ref="billList" border v-loading="isLoading">
      <!-- <el-table-column type="selection" width="42" :reserve-selection="true"></el-table-column> -->
      <el-table-column label="订单号" prop="orderId" min-width="140" align="center" fixed></el-table-column>
      <el-table-column label="下单时间" prop="orderCreationDate" min-width="140" align="center"></el-table-column>
      <el-table-column label="订单状态" prop="orderStatus" width="100" align="center">
        <!-- <template #default="{ row }">
          <el-row type="flex" align="middle">
            <i class="dot" :class="row.orderStatus === 1 ? 'on' : ''"></i>
            <div>{{ saleStatusMap[`${row.orderStatus}`] }}</div>
          </el-row>
        </template> -->
      </el-table-column>
      <el-table-column label="商品ID" prop="outerProductId" width="100" align="center"></el-table-column>
      <el-table-column label="商品名称" prop="productName" align="center"></el-table-column>
      <el-table-column label="商品数量" prop="productNum" align="center"></el-table-column>
      <el-table-column label="达人ID" prop="celebrityId" width="100" align="center"></el-table-column>
      <el-table-column label="订单实付(元)" align="right">
        <template #default="{ row }">
         <span>￥{{ row.realPayAmount | numFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="平台补贴(元)" align="right">
        <template #default="{ row }">
          <span>￥{{ row.platformAllowance | numFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="合计收入(元)" align="right">
        <template #default="{ row }">
          <span>￥{{ row.totalAmount | numFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="技术服务费(元)" align="right">
        <template #default="{ row }">
          <span>￥{{ row.technologyFee | numFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="推广者佣金(元)" prop="" align="right">
        <template #default="{ row }">
          <span>￥{{ row.promoterFee | numFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单退款(元)" align="right">
        <template #default="{ row }">
          <span>￥{{ row.refundAmount | numFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="合计支出(元)" align="right">
        <template #default="{ row }">
          <span>￥{{ row.totalPay | numFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="资金渠道" prop="financingChannel" align="center"></el-table-column>
      <el-table-column label="账户名称" prop="accountName" align="center"></el-table-column>
      <el-table-column label="结算金额(元)" align="right">
        <template #default="{ row }">
          <span>￥{{ row.settleAmount | numFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结算状态" prop="settleStatus" align="center"></el-table-column>
      <el-table-column label="结算时间" prop="settleDate" align="center"></el-table-column>
      <el-table-column label="花呗服务费" align="right">
        <template #default="{ row }">
          <span>￥{{ row.antFee | numFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="同步状态" align="center">
        <template #default="{ row }">
          <span>{{ syncOptions[row.status] }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-row type="flex" justify="end">
      <el-pagination
        style="margin-top:16px"
        background
        hide-on-single-page
        layout="total, prev, pager, next, jumper"
        :total="total"
        :sizes="[10]"
        :current-page.sync="billForm.page"
        :page-size="billForm.pageSize"
        @current-change="handleCurrentChange">
      </el-pagination>
    </el-row>

    <!-- 导入 -->
    <import-drawer :visible.sync="importVisible"></import-drawer>
    <!-- 任务 -->
    <task-drawer :visible.sync="taskVisible" :result="taskList"></task-drawer>
  </div>
</template>

<script>
import ImportDrawer from './components/ImportDrawer'
import TaskDrawer from './components/TaskDrawer'
// import { saveFile } from '@/util'
import {
  QueryBillList,
  // DownloadBillTemp,
  QueryTaskList,
} from '@/api/bill.js'
import { format } from 'date-fns'


// 默认下单时间
const defaultDate = () => {
  const end = new Date();
  const start = new Date();
  start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
  return [start, end]
}

export default {
  components: {
    ImportDrawer,
    TaskDrawer,
  },
  data() {
    let curDate = '';
    return {
      isLoading: false,
      billForm: {
        orderDate: defaultDate(),
        status: '0',
        orderId: '',
        page: 1,
        pageSize: 10
      },
      total: 0,
      syncOptions: {
        0: '全部',
        1: '待同步',
        2: '同步中',
        3: '成功'
      },
      billList: [],
      importVisible: false,
      taskVisible: false,
      pickerOptions: {
        onPick({ maxDate, minDate }) {
          if (!maxDate && minDate) {
            curDate = minDate
          }
          if (maxDate) {
            curDate = null
          }
        },
        disabledDate(date) {
          if (curDate) {
            return (date.getTime() < curDate.getTime() - 3600 * 24 * 1000 * 180) || date.getTime() - curDate.getTime() > 3600 * 24 * 1000 * 180
          }
          return date.getTime() > new Date().getTime()
        },
        shortcuts: [{
          text: '近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近半年',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 180);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      // 订单状态
      saleStatusMap: {},
      // 任务列表
      taskList: {},
    }
  },
  filters: {
    numFilter(val) {
      return Number(val).toFixed(2)
    }
  },
  created() {
    this.getBillList();
  },
  methods: {
    format(date) {
      return format(new Date(date), 'yyyy-MM-dd HH:mm:ss')
    },
    getBillList() {
      if (this.isLoading) return
      this.isLoading = true;
      this.billForm.orderDate = this.billForm.orderDate || [];
      const orderCreationDateBegin = this.billForm.orderDate[0] ? this.format(this.billForm.orderDate[0]) : this.format(defaultDate()[0]);
      const orderCreationDateEnd = this.billForm.orderDate[1] ? this.format(this.billForm.orderDate[1]) : this.format(defaultDate()[1]);
      
      const data = {
        status: Number(this.billForm.status),
        orderId: this.billForm.orderId,
        page: this.billForm.page,
        pageSize: this.billForm.pageSize,
        orderCreationDateBegin,
        orderCreationDateEnd
      };
      QueryBillList(data)
        .then(({ data, total}) => {
          this.billList = data;
          this.total = total;
        })
        .catch(console.warn)
        .finally(() => {
          this.isLoading = false
        })
    },
    handleSearch() {
      this.getBillList()
    },
    handleReset() {
      this.$refs.billForm.resetFields();
    },
    handleCurrentChange(page) {
      this.billForm.page = page,
      this.handleSearch();
    },
    // 导入
    handleImport() {
      this.importVisible = true;
    },
    getTaskList() {
      const data = {
        page: 1,
        pageSize: 10
      }
      QueryTaskList(data)
        .then(data => {
          this.taskList = data;
        })
        .catch(console.warn)
    },
    // 任务列表
    handleTask() {
      this.taskVisible = true;
      this.getTaskList()
    },
    // 下载模板
    // handleDownloadTemplate() {
    //   DownloadBillTemp({ groupType: 1, taskType: 301})
    //     .then(data => {
    //       saveFile(data, '快手结算单模版', 'xlsx');
    //       this.$message.success('下载成功')
    //     })
    //     .catch(console.warn)
    // },
  }
}
</script>

<style lang="scss" scoped>
$bold: bold;
$btm: 8px;

.page{
  .notice-wrap{
    padding: $btm;
    background: #F2F2F2;
    border-radius: 5px;
  }
  &-title{
    font-weight: $bold;
    margin-bottom: 2 * $btm;
    font-size: 20px;
  }
  .notice{
    font-weight: $bold;
  }
  .notice-list + .notice-list{
    margin-top: $btm;
  }
  .dot {
    width: 6px;
    height: 6px;
    margin-right: 4px;
    border-radius: 100%;
    background-color: #D2DDEB;
    &.on {
      background-color: #6CD092;
    }
  }
}
</style>
