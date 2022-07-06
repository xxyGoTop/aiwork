 <template>
<el-drawer
  title="敏感词任务详情"
  :visible="visible"
  @close="handleDrawerClose"
  ref="drawer"
  direction="rtl"
  size="50%">
  <div class="container">
    <div class="prod_info">
      <div class="prod_item" style="min-width: 130px;">
        <span class="prod_label">
          任务编号
        </span>
        <span class="prod_content" style="color: #0061D9;">
          {{ info.taskNum || '-' }}
        </span>
      </div>
        <div class="prod_item" >
        <span class="prod_label">
          预计/实际完成时间
        </span>
        <span class="prod_content">
          {{ info.expectTime ||  '-' }}
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
    </el-row>
    <!-- table -->
    <el-table :data="prdInfoList" border style="margin-top:15px" v-loading="loading">
      <el-table-column label="当当ID" prop="productId" align="center">
        <!-- <template #default="{ row }">
          <router-link :to="{ name: 'goods', query: { productId: row.productId, partnerId: info.partnerId } }" class="jump_link">{{ row.productId }}</router-link>
        </template> -->
      </el-table-column>
      <el-table-column label="外平台ID" prop="outCode" align="center">
        <!-- <template #default="{ row }">
          <a :href="`${groupMap[groupType].link}${row.outerCode}`" target="_blank" class="jump_link">{{ row.outerCode }}</a>
        </template> -->
      </el-table-column>
      <el-table-column label="商品名称" prop="productName" align="center" ></el-table-column>
      <el-table-column label="商品状态" prop="status" align="center" ></el-table-column>
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
import { TaskDetailQuery, TaskResult } from "@/api/words/task"
import { format } from "date-fns"
import {
  saveFile,
} from "@/util"

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
  },
  data() {
    return {
      prdInfoList: [],
      total: 0,
      page: 1,
      exportLink: process.env.VUE_APP_EXPORT_LINK,
      loading: false,
    }
  },
  computed: {
    groupMap() {
      return this.$store.state.groupMap
    },
    groupType() {
      return this.info.platform
    },
  },
  watch: {
    visible(val) {
      val && this.getTaskDetail()
    }
  },
  methods: {
    formatDate(date) {
      return format(date, "yyyy-MM-dd HH:mm:ss")
    },
    getTaskDetail() {
      if (this.loading) return
      this.loading = true
      const queryParams = {
        page: this.page,
        pageSize: 10,
        taskNum: this.info.taskNum || ""
      }
      const params = Object.create(null)
      for (const [key, value] of Object.entries(queryParams)) {
        if (value) {
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
    },
    handleExport() {
      // 必须先执行导出操作后才可以下载
      TaskResult({
        taskNum: this.info.taskNum,
      })
        .then(data => {
          saveFile(data, "敏感词任务详情", "xlsx")
          // if (data === 3) {
          //   dlFile(`${this.exportLink}${this.info.id}`, `商品信息修改详情-${this.info.taskNum}`, 'xlsx');
          // } else {
          //   this.$message.warning(taskResultMap[data]);
          // }
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
      // min-width: 110px;
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
