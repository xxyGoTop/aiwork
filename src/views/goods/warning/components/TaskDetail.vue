 <template>
  <el-drawer
    title="任务详情"
    :visible="visible"
    @close="handleDrawerClose"
    ref="drawer"
    size="1000px"
    destroy-on-close>
    <div class="container">
      <div class="prod_info">
        <div class="prod_item" >
          <span class="prod_label">
            任务编号
          </span>
          <span class="prod_content" style="color: #0061D9;">
            {{ info.taskNum || '-' }}
          </span>
        </div>
        <div class="prod_item">
          <span class="prod_label">
            价格预警商品数
          </span>
          <span class="prod_content">
            {{ hasValue(info.monitorNum) ? info.monitorNum : '-' }}
          </span>
        </div>
        <div class="prod_item" >
          <span class="prod_label">
            任务状态
          </span>
          <span class="prod_content">
            {{ Object.keys(taskStatusMap).includes(`${info.status}`) ? taskStatusMap[info.status] : '-' }}
          </span>
        </div>
        <div class="prod_item" >
          <span class="prod_label">
            创建人
          </span>
          <span class="prod_content">
            {{ info.operator || '-' }}
          </span>
        </div>
        <div class="prod_item" >
          <span class="prod_label">
            创建时间
          </span>
          <span class="prod_content">
            {{ info.creationDate || '-' }}
          </span>
        </div>
      </div>
      <el-row type="flex" justify="space-between" align="middle" style="margin-top: 20px;">
        <el-button type="primary" @click="handleExport">导出</el-button>
        <el-input v-model="queryModel.productId" placeholder="搜索当当ID或外平台ID" style="width:250px" clearable>
          <template #append>
            <el-button type="primary" @click="handleSearch" icon="el-icon-search"></el-button>
          </template>
        </el-input>
      </el-row>
      <!-- table -->
      <el-table :data="prdInfoList" border style="margin-top:15px">
        <el-table-column label="当当ID" prop="productId" align="center">
          <template #default="{ row }">
            <router-link :to="{ name: 'goods', query: { productId: row.productId, partnerId: info.partnerId } }" class="jump_link">{{ row.productId }}</router-link>
          </template>
        </el-table-column>
        <el-table-column label="外平台ID" prop="outerCode" align="center">
          <template #default="{ row }">
            <a :href="`${groupMap[groupType].link}${row.outerCode}`" target="_blank" class="jump_link">{{ row.outerCode }}</a>
          </template>
        </el-table-column>
        <el-table-column label="商品名称" prop="productName" align="center" ></el-table-column>
        <el-table-column align="center" min-width="100">
          <template #header>
            <DropdownSelect
              label="变价状态"
              :options="statusOptions"
              :topOffset="19"
              v-model="queryModel.ddPriceChangeType"
              @select="getTaskDetail">
            </DropdownSelect>
          </template>
          <template #default="{ row }">
            {{ row.ddPriceChangeText }}
          </template>
        </el-table-column>
        <el-table-column label="当当价" prop="ddPrice" align="center"></el-table-column>
        <el-table-column label="当当价变更时间" prop="changeData" align="center"></el-table-column>
        <el-table-column label="历史价格1" prop="ddPrice1" align="center"></el-table-column>
        <el-table-column label="历史价格1变更时间" prop="changeData1" align="center"></el-table-column>
        <el-table-column label="历史价格2" prop="ddPrice2" align="center"></el-table-column>
        <el-table-column label="历史价格2变更时间" prop="changeData2" align="center"></el-table-column>
        <el-table-column label="历史价格3" prop="ddPrice3" align="center"></el-table-column>
        <el-table-column label="历史价格3变更时间" prop="changeData3" align="center"></el-table-column>
        <el-table-column label="备注" prop="remark" align="center"></el-table-column>
      </el-table>
      <el-row type="flex" justify="end" style="margin:20px 0">
        <el-pagination
          background
          hide-on-single-page
          layout="total,prev,pager,next"
          :total="total"
          :page-size="10"
          :current-page.sync="queryModel.curPage"
          @current-change="getTaskDetail">
        </el-pagination>
      </el-row>
    </div>
  </el-drawer>
</template>

<script>
import {
  GetTaskDetailList,
  TaskResult,
} from '@/api/goods/warning';
import {
  // dlFile,
  hasValue
} from '@/util';

// const taskResultMap = {
//   '-1': '任务不存在',
//   '-2': '系统异常',
//   '2': '结果文件生成中',
//   '3': '结果文件已经上传',
// };

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    info: {
      type: Object,
      default: () => ({}),
    },
    groupType: {
      type: [String, Number],
      default: 1,
    },
  },
  data() {
    return {
      prdInfoList: [],
      total: 0,
      exportLink: process.env.VUE_APP_EXPORT_LINK,
      statusMap: {
        0: '不限',
        1: '近三天',
        2: '近15天',
      },
      taskStatusMap: {
        34: '待开始',
        33: '进行中',
        25: '已过期',
        31: '任务终止'
      },
      queryModel: {
        productId: '',
        ddPriceChangeType: 0,
        curPage: 1,
        pageSize: 10,
      },
      statusOptions: [
        { label: '不限', value: 0 },
        { label: '近三天', value: 1 },
        { label: '近15天', value: 2 },
      ],
    }
  },
  computed: {
    groupMap() {
      return this.$store.state.groupMap;
    },
  },
  watch: {
    visible(val) {
      val && this.getTaskDetail();
    }
  },
  methods: {
    hasValue,
    // 查询
    handleSearch() {
      if (this.queryModel.productId) {
        if (!/^\d+$/.test(this.queryModel.productId)) return this.$message.warning('请输入数字')
      }
      this.getTaskDetail()
    },
    getTaskDetail() {
      const queryParams = {
       ...this.queryModel,
       taskId: this.info.id
      };
      const params = Object.create(null);
      for (const [key, value] of Object.entries(queryParams)) {
        if (hasValue(value)) {
          params[key] = value;
        }
      }
      GetTaskDetailList(params)
        .then(({ data, total }) => {
          this.prdInfoList = data;
          this.total = total;
        })
        .catch(console.warn)
    },
    handleDrawerClose() {
      this.$emit('update:visible', false);
      this.queryModel.ddPriceChangeType = 0;
      this.queryModel.productId = '';
    },
    handleExport() {
      // 必须先执行导出操作后才可以下载
      TaskResult({
        monitorTaskId: this.info.id,
        queryCondition: JSON.stringify({
          partnerId: this.info.partnerId,
          queryId: this.queryModel.productId,
          ddPriceChangeType: this.queryModel.ddPriceChangeType
        }),
        operator: this.info.operator,
      })
        .then(({ code }) => {
          code === 200 && this.$message.success('任务创建成功，请前往下载中心查看');
          // if (data === 3) {
          //   dlFile(`${this.exportLink}${this.info.id}`, `黑名单任务详情-${this.info.taskNum}`, 'xlsx');
          // } else {
          //   this.$message.warning(taskResultMap[data]);
          // }
        })
        .catch(console.warn);
    },
  },
}
</script>

<style lang="scss" scoped>
.container{
  padding: 0 15px;
  box-sizing: border-box;
  height: calc(100vh - 77px);
  overflow-y: scroll;
  .prod_info{
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    background: #f3f5f6;
    padding: 10px;
    .prod_item{
      display: flex;
      flex-direction: column;
      .prod_label{
        color:#999999;
        font-size: 12px;
        margin-bottom: 10px;
      }
      .prod_content{
        color:#141414;
        font-size: 14px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
      }
    }
  }
  .jump_link{
    color: #0061D9;
    text-decoration: none;
  }
  .export{
    text-decoration: none;
  }
}
</style>
