 <template>
<el-drawer
  title="黑名单"
  :visible="visible"
  @close="handleDrawerClose"
  ref="drawer"
  size="700px"
  destroy-on-close>
  <div class="container">
    <div class="prod_info">
      <div class="prod_item" >
        <span class="prod_label">
          任务编号
        </span>
        <span class="prod_content" style="color: #0061D9;">
          {{ info.taskId || '-' }}
        </span>
      </div>
      <div class="prod_item" style="min-width:150px">
        <span class="prod_label">
          黑名单时间段
        </span>
        <span class="prod_content">
          {{ info.startTime && info.endTime ? formatDate(new Date(info.startTime)) + '~' + formatDate(new Date(info.endTime)) : '-' }}
        </span>
      </div>
      <div class="prod_item" >
        <span class="prod_label">
          任务状态
        </span>
        <span class="prod_content">
          {{ info.taskStatus || '-' }}
        </span>
      </div>
      <div class="prod_item" >
        <span class="prod_label">
          创建人
        </span>
        <span class="prod_content">
          {{info.taskOperator || '-' }}
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
        <!-- <template #default="{ row }">
          <router-link :to="{ name: 'goods', query: { productId: row.productId } }" class="jump_link">{{ row.productId }}</router-link>
        </template> -->
      </el-table-column>
      <el-table-column label="外平台ID" prop="outerCode" align="center">
        <!-- <template #default="{ row }">
          <a :href="`${groupMap[groupType].link}${row.outerCode}`" target="_blank" class="jump_link">{{ row.outerCode }}</a>
        </template> -->
      </el-table-column>
      <el-table-column label="商品名称" prop="productName" align="center" ></el-table-column>
      <el-table-column label="商品状态" prop="displayStatus" align="center" >
        <template #header>
          <DropdownSelect
            label="商品状态"
            :options="statusOptions"
            :topOffset="19"
            v-model="queryModel.status"
            @select="getTaskDetail">
          </DropdownSelect>
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
        :page-size="20"
        :current-page.sync="page"
        @current-change="getTaskDetail">
      </el-pagination>
    </el-row>
  </div>
</el-drawer>
</template>

<script>
import {
  BlackTaskInfo,
  BlackTaskDetail,
  TaskResultDownload
} from "@/api/goods/black"
import { format } from "date-fns"
import {
  dlFile,
  hasValue
} from "@/util"
import {
  TaskStatusMap
} from "@/api/goods/task"

const taskResultMap = {
  "-1": "任务不存在",
  "-2": "系统异常",
  "2": "结果文件生成中",
  "3": "结果文件已经上传",
}

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    payload: {
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
      info: {},
      exportLink: process.env.VUE_APP_EXPORT_LINK,
      taskResultMap: {
        0: "生效中",
        1: "未开始",
        2: "已过期",
        3: "添加失败",
      },
      queryModel: {
        productId: "",
        status: "",
      },
      statusOptions: [
        // { label: '不限', value: '' },
        // { label: '初始化', value: 0 },
        // { label: '未开始', value: 1 },
        // { label: '生效中', value: 2 },
        // { label: '已过期', value: 3 },
        // { label: '添加失败', value: 4 },
      ],
    }
  },
  computed: {
    groupMap() {
      return this.$store.state.groupMap
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.getTaskDetail()
        this.getTaskInfo()
        this.getStatusMap(this.payload.taskId)
      }
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
          this.statusOptions.unshift({ label: "不限", value: "" })
        })
        .catch(console.warn)
    },
    // 查询
    handleSearch() {
      if (this.queryModel.productId) {
        if (!/^\d+$/.test(this.queryModel.productId)) return this.$message.warning("请输入数字")
      }
      this.getTaskDetail()
    },
    formatDate(date) {
      return format(date, "yyyy-MM-dd HH:mm:ss")
    },
    // 任务信息
    getTaskInfo() {
      BlackTaskInfo({ taskId: this.payload.taskId })
        .then(({ data }) => {
          this.info = data
        })
        .catch(console.warn)
    },
    getTaskDetail() {
      const queryParams = {
        ...this.queryModel,
        page: this.page,
        pageSize: 20,
        partnerId: this.payload.partnerId,
        taskId: this.payload.taskId
      }
      const params = Object.create(null)
      for (const [key, value] of Object.entries(queryParams)) {
        if (hasValue(value)) {
          params[key] = value
        }
      }
      params["status"] = params.status && params.status.split(",") || []
      BlackTaskDetail(params)
        .then(({ data, total }) => {
          this.prdInfoList = data
          this.total = total
        })
        .catch(console.warn)
    },
    handleDrawerClose() {
      this.$emit("update:visible", false)
      this.queryModel.status = ""
      this.queryModel.productId = ""
      this.statusOptions = []
    },
    handleExport() {
      // 必须先执行导出操作后才可以下载
      TaskResultDownload({
        taskId: this.payload.taskId,
      })
        .then(({ data }) => {
          if (data === 3) {
            dlFile(`${this.exportLink}${this.payload.taskId}`, `黑名单任务详情-${this.payload.taskNum}`, "xlsx")
          } else {
            this.$message.warning(taskResultMap[data])
          }
        })
        .catch(console.warn)
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
