 <template>
  <el-drawer
    title="任务详情"
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
            任务编码
          </span>
          <span class="prod_content" style="color: #0061D9;">
            {{ info.taskNum || '-' }}
          </span>
        </div>
        <div class="prod_item" >
          <span class="prod_label">
            发布数量
          </span>
          <span class="prod_content">
            {{ info.taskCount || '-' }}
          </span>
        </div>
        <div class="prod_item" >
          <span class="prod_label">
            任务状态
          </span>
          <span class="prod_content">
            {{ info.status || '-' }}
          </span>
        </div>
        <div class="prod_item" >
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
      <el-row type="flex" justify="start" align="middle" style="margin-top: 20px;">
        <el-button type="primary" @click="handleExport">导出</el-button>
        <!-- <el-input v-model="queryModel.productId" placeholder="搜索当当ID或外平台ID" style="width:250px" clearable>
          <template #append>
            <el-button type="primary" @click="handleSearch" icon="el-icon-search"></el-button>
          </template>
        </el-input> -->
      </el-row>
      <!-- table -->
      <el-table :data="prdInfoList" border style="margin-top:15px" v-loading="loading">
        <el-table-column label="外平台SPUID" prop="outerCode" align="center"></el-table-column>
        <el-table-column label="SKUID(当当)" prop="productId" align="center"></el-table-column>
        <el-table-column label="款式" prop="style" align="center"></el-table-column>
        <el-table-column label="版本" prop="version" align="center"></el-table-column>
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
  TaskResult,
} from "@/api/goods/task"
import { format } from "date-fns"
import {
  dlFile,
  hasValue
} from "@/util"

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
    info: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      prdInfoList: [],
      total: 0,
      page: 1,
      exportLink: process.env.VUE_APP_EXPORT_LINK,
      loading: false,
      queryModel: {
        productId: "",
        saleStatus: "",
      },
    }
  },
  computed: {
    groupMap() {
      return this.$store.state.groupMap
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
        if (!/^\d+$/.test(this.queryModel.productId)) return this.$message.warning("请输入数字")
      }
      this.getTaskDetail()
    },
    formatDate(date) {
      return format(date, "yyyy-MM-dd HH:mm:ss")
    },
    getTaskDetail() {
      if (this.loading) return
      this.loading = true
      const queryParams = {
        ...this.queryModel,
        page: this.page,
        pageSize: 10,
        partnerId: this.info.partnerId,
        taskId: this.info.id || ""
      }
      const params = Object.create(null)
      for (const [key, value] of Object.entries(queryParams)) {
        if (hasValue(value)) {
          params[key] = value
        }
      }
      TaskDetailQuery(params)
        .then(({ data, total }) => {
          this.prdInfoList = data
          this.total = total
        })
        .catch(console.warn)
        .finally(() => {
          this.loading = false
        })
    },
    handleDrawerClose() {
      this.$emit("update:visible", false)
      this.queryModel.saleStatus = ""
      this.queryModel.productId = ""
    },
    handleExport() {
      // 必须先执行导出操作后才可以下载
      TaskResult({
        taskId: this.info.id,
      })
        .then(({ data }) => {
          if (data === 3) {
            dlFile(`${this.exportLink}${this.info.id}`, `添加SKU详情-${this.info.taskNum}`, "xlsx")
          } else {
            this.$message.warning(taskResultMap[data])
          }
        })
        .catch(console.warn)
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
