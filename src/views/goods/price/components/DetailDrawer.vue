 <template>
  <el-drawer
    title="商品改价详情"
    :visible="visible"
    @close="handleDrawerClose"
    ref="drawer"
    direction="rtl"
    size="700px"
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
          <div class="prod_item" >
          <span class="prod_label">
            改价商品数
          </span>
          <span class="prod_content">
            {{ info.changeNum }}
          </span>
        </div>
        <div class="prod_item" >
          <span class="prod_label">
            任务状态
          </span>
          <span class="prod_content">
            {{ statusList[info.status] || '-' }}
          </span>
        </div>
        <div class="prod_item" >
          <span class="prod_label">
            创建人
          </span>
          <span class="prod_content">
            {{info.operator || '-' }}
          </span>
        </div>
        <div class="prod_item" >
          <span class="prod_label">
            创建时间
          </span>
          <span class="prod_content">
            {{ info.creationDate ? formatDate(new Date(info.creationDate)) : '-' }}
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
      <el-table :data="prdInfoList" border style="margin-top:15px" v-loading="loading">
        <el-table-column label="当当ID" prop="productId" align="center">
          <template #default="{ row }">
            <router-link :to="{ name: 'goods', query: { productId: row.productId, partnerId: info.partnerId } }" class="jump_link">
              {{ row.productId }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="外平台ID" prop="outerCode" align="center">
          <template #default="{ row }">
            <a :href="`${groupMap[groupType].link}${row.outerCode}`" target="_blank" class="jump_link">{{ row.outerCode }}</a>
          </template>
        </el-table-column>
        <el-table-column label="商品名称" align="center">
          <template #default="{ row }">
            <el-tooltip
              :content="row.productName"
              placement="top">
              <div class="productName" v-if="row.productName">
                {{ row.productName.length > 10 ? row.productName.slice(0, 10) : row.productName }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="改前价格" prop="originalPrice" align="center" ></el-table-column>
        <el-table-column label="改后价格" prop="changePrice" align="center" ></el-table-column>
        <el-table-column label="商品状态" align="center" >
          <template #header>
            <DropdownSelect
              label="商品状态"
              :options="statusOptions"
              :topOffset="19"
              v-model="queryModel.status"
              @select="getTaskDetail">
            </DropdownSelect>
          </template>
          <template #default="{ row }">
            <span>{{ row.displayStatus }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" align="center"></el-table-column>
      </el-table>

      <el-row type="flex" justify="end" style="margin:20px 0">
        <el-pagination
          background
          hide-on-single-page
          layout="total,prev,pager,next"
          :total="total"
          :page-size="10"
          :current-page.sync="page"
          @current-change="getTaskDetail">
        </el-pagination>
      </el-row>
    </div>
  </el-drawer>
</template>

<script>
import {
  TaskDetailQuery,
} from '@/api/goods/price';
import {
  TaskResult,
  TaskStatusMap
} from '@/api/goods/task'
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
      page: 1,
      exportLink: process.env.VUE_APP_EXPORT_LINK,
      loading: false,
      // 任务状态
      statusList: {
        0: '初始化',
        1: '处理中',
        2: '解析进行中',
        3: '待处理',
        10: '部分成功',
        11: '全部成功',
        12: '解析完成',
        20: '部分失败',
        21: '全部失败',
        22: '解析失败',
        30: '系统异常',
        25: '已过期',
        //商品改价任务才会使用
        40: '恢复中',
      },
      queryModel: {
        productId: '',
        status: '',
      },
      statusOptions: [
        // { label: '不限', value: '' },
        // // { label: '初始化', value: 0 },
        // { label: '处理中', value: -1 },
        // { label: '处理成功', value: 1 },
        // { label: '处理失败', value: 2 },
        // { label: '已恢复', value: 10 },
        // { label: '恢复失败', value: 11 },
        // { label: '已过期', value: 21 },
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
      val && this.getStatusMap(this.info.id);
    }
  },
  methods: {
    // 状态映射
    getStatusMap(taskId) {
      TaskStatusMap({ taskId })
        .then(({ data }) => {
          for (const [key, value] of Object.entries(data)) {
            this.statusOptions.push({
              label: key, value
            })
          }
          this.statusOptions.unshift({ label: '不限', value: '' })
        })
        .catch(console.warn)
    },
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
    handleDrawerClose() {
      this.$emit('update:visible', false);
      this.queryModel.status = '';
      this.queryModel.productId = '';
      this.statusOptions = [];
    },
    getTaskDetail() {
      if (this.loading) return
      this.loading = true;
      const queryParams = {
        ...this.queryModel,
        curPage: this.page,
        pageSize: 10,
        partnerId: this.info.partnerId,
        taskNum: this.info.taskNum
      };
      const params = Object.create(null);
      for (const [key, value] of Object.entries(queryParams)) {
        if (hasValue(value)) {
          params[key] = value;
        }
      }
      params['status'] = params.status && params.status.split(',') || []
      TaskDetailQuery(params)
        .then(({ data, total }) => {
          this.prdInfoList = data;
          this.total = total;
        })
        .catch(console.warn)
        .finally(() => {
          this.loading = false
        })
    },
    handleExport() {
      TaskResult({
        taskId: this.info.id,
      })
        .then(({ data }) => {
          if (data === 3) {
            dlFile(`${this.exportLink}${this.info.id}`, `商品改价详情-${this.info.taskNum}`, 'xlsx');
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
  .productName{
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}
</style>
