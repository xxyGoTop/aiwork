 <template>
  <el-drawer
    title="锁库存详情"
    :visible="visible"
    @close="handleDrawerClose"
    ref="drawer"
    direction="rtl"
    size="800px"
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
        <div class="prod_item prod_item-date" >
          <span class="prod_label">
            锁库存时间段
          </span>
          <span class="prod_content">
            {{ info.startTime ? info.startTime : '-' }} ~
            {{ info.endTime ? info.endTime : '-' }}
          </span>
        </div>
        <div class="prod_item" >
          <span class="prod_label">
            锁库存商品数
          </span>
          <span class="prod_content">
            {{ info.taskCount || '-' }}
          </span>
        </div>
        <div class="prod_item prod_item-min" >
          <span class="prod_label">
            任务状态
          </span>
          <span class="prod_content">
            {{ info.status || '-' }}
          </span>
        </div>
        <div class="prod_item prod_item-min" >
          <span class="prod_label">
            创建人
          </span>
          <span class="prod_content">
            {{info.creator || '-' }}
          </span>
        </div>
        <div class="prod_item" >
          <span class="prod_label">
            创建时间
          </span>
          <span class="prod_content">
            {{ info.createDate ? formatDate(new Date(info.createDate)) : '-' }}
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
            <router-link :to="{ name: 'goods', query: { productId: row.productId, partnerId: info.partnerId } }" class="jump_link">
              {{ row.productId > 0 ? row.productId : '商品Id不存在' }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="外平台ID" prop="outerCode" align="center">
          <template #default="{ row }">
            <a :href="`${groupMap[groupType].link}${row.outerCode}`" target="_blank" class="jump_link">{{ row.outerCode }}</a>
          </template>
        </el-table-column>
        <el-table-column label="商品名称" prop="productName" align="center" v-if="groupType === 1">
          <template #default="{ row }">
            <div class="ellp-2" :title="row.productName">{{row.productName}}</div>
          </template>
        </el-table-column>
        <el-table-column label="商品状态" prop="displayStatus" align="center" v-if="groupType === 1"></el-table-column>
        <el-table-column label="仓库" prop="warehouseId" align="center">
          <template #header>
            <DropdownSelect
              label="仓库"
              :options="warehouseOptions"
              :topOffset="19"
              v-model="queryModel.warehouseId"
              @select="getTaskDetail">
            </DropdownSelect>
          </template>
          <template #default="{ row }">
            {{ row.warehouseId > 0 ? warehouseMap[row.warehouseId] : '仓库Id不存在' }}
          </template>
        </el-table-column>
        <el-table-column label="当当可售" prop="saleQuantity" align="center" v-if="groupType === 1"></el-table-column>
        <!-- <el-table-column label="外卖场可售" prop="remark" align="center"></el-table-column> -->
        <el-table-column label="首次锁定值" prop="stockLockNum" align="center" v-if="groupType === 1"></el-table-column>
        <el-table-column label="最小值" prop="minThreshold" align="center" v-if="groupType === 1"></el-table-column>
        <el-table-column label="补锁值" prop="addStock" align="center" v-if="groupType === 1"></el-table-column>
        <el-table-column label="已锁总值" prop="allAddStocks" align="center" v-if="groupType === 1"></el-table-column>
        <el-table-column label="备注" prop="remark" align="center"></el-table-column>
      </el-table>
      <el-row type="flex" justify="end" style="margin:20px 0">
        <el-pagination
          background
          hide-on-single-page
          layout="total,prev,pager,next"
          :total="total"
          :page-size="20"
          :current-page.sync="page"
          @current-change="getTaskDetail">
        </el-pagination>
      </el-row>
    </div>
  </el-drawer>
</template>

<script>
/*商品状态
已上架，未上架，发布失败，待执行
*/
import {
  TaskDetailQuery,
  TaskResult,
} from '@/api/stock';
import { format } from 'date-fns';
import {
  dlFile,
  hasValue
} from '@/util';

const taskResultMap = {
  '-1': '任务不存在',
  '-2': '系统异常',
  '2': '结果文件生成中',
  '3': '结果文件已经上传',
};

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    info: Object,
    // groupType: {
    //   type: [String, Number],
    //   default: 1,
    // },
  },
  data() {
    return {
      prdInfoList: [],
      total: 0,
      page: 1,
      exportLink: process.env.VUE_APP_EXPORT_LINK,
      warehouseMap: {
        30: "天津",
        17: "无锡",
        15: "广州",
      },
      queryModel: {
        productId: '',
        warehouseId: '',
      },
      warehouseOptions: [
        { label: '不限', value: '' },
        { label: '天津', value: 30 },
        { label: '无锡', value: 17 },
        { label: '广州', value: 15 },
      ],
    }
  },
  computed: {
    groupType() {
      return this.info.groupType || 1;
    },
    groupMap() {
      return this.$store.state.groupMap;
    },
  },
  watch: {
    visible(val) {
      val && this.getTaskDetail()
    }
  },
  methods: {
    // 查询
    handleSearch() {
      if (this.queryModel.productId) {
        if (!/^\d+$/.test(this.queryModel.productId)) return this.$message.warning('请输入数字')
      }
      this.getTaskDetail()
    },
    formatDate(date) {
      return format(date, 'yyyy-MM-dd HH:mm:ss')
    },
    getTaskDetail() {
      const queryParams = {
        ...this.queryModel,
        page: this.page,
        pageSize: 20,
        partnerId: this.info.partnerId,
        taskId: this.info.id || ''
      };
      const params = Object.create(null);
      for (const [key, value] of Object.entries(queryParams)) {
        if (hasValue(value)) {
          params[key] = value;
        }
      }
      TaskDetailQuery(params)
        .then(({ data, total }) => {
          this.prdInfoList = data;
          this.total = total;
        })
        .catch(console.warn)
    },
    handleDrawerClose() {
      this.$emit('update:visible', false);
      this.queryModel.warehouseId = '';
      this.queryModel.productId = '';
    },
    handleExport() {
      TaskResult({
        taskId: this.info.id,
      })
        .then(({ data }) => {
          if (data === 3) {
            dlFile(`${this.exportLink}${this.info.id}`, `锁库存详情-${this.info.taskNum}`, 'xlsx');
          } else {
            this.$message.warning(taskResultMap[data]);
          }
        })
        .catch(console.warn);
    },
  }
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
      &-min {
        min-width: 80px;
      }
      &-date {
        width: 150px;
      }
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
      .tmId{
        color: #0061D9;
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
