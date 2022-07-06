 <template>
<el-drawer
  title="商品变更详情"
  :visible="visible"
  @close="handleDrawerClose"
  ref="drawer"
  direction="rtl"
  size="700px">
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
          任务状态
        </span>
        <span class="prod_content">
          {{ info.statusDesc || '-' }}
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
      <el-row type="flex" justify="end" align="middle">
        <el-input v-model="query.searchKeyId" placeholder="请输入当当ID或外平台ID" @keyup.enter.native="getTaskDetail" style="width: 250px">
          <el-button slot="append" type="primary" @click="getTaskDetail">搜索</el-button>
        </el-input>
      </el-row>
    </el-row>
    <!-- table -->
    <el-table :data="prdInfoList" border style="margin-top:15px" v-loading="loading">
      <el-table-column label="当当ID" prop="productId" align="center">
        <template #default="{ row }">
          <a :href="`${groupMap[0].link}${row.productId}.html`" target="_blank" class="jump_link">
            {{ row.productId }}
          </a>
        </template>
      </el-table-column>
      <el-table-column label="外平台ID" prop="outerCode" align="center">
        <template #default="{ row }">
          <a :href="`${groupMap[groupType].link}${row.outerCode}`" target="_blank" class="jump_link">{{ row.outerCode }}</a>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" prop="productName" align="center" ></el-table-column>
      <el-table-column label="商品类目" prop="categoryName" align="center" ></el-table-column>
      <el-table-column label="修改类型" align="center" prop="changeTypeDesc">
        <template #header>
          <DropdownSelect
            label="修改类型"
            :options="typeOptions"
            :topOffset="19"
            v-model="query.changeType"
            @select="getTaskDetail">
          </DropdownSelect>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="changeInfo" align="center"></el-table-column>
    </el-table>
    <el-row type="flex" justify="end" style="margin:20px 0">
      <el-pagination
        background
        hide-on-single-page
        layout="total,prev,pager,next"
        :total="total"
        :page-size="10"
        :current-page.sync="query.page"
        @current-change="getTaskDetail">
      </el-pagination>
    </el-row>
  </div>
</el-drawer>
</template>

<script>
import { format } from "date-fns"
import {
  TaskDetailQuery,
} from "@/api/goods/alter"
import {
  TaskResult,
} from "@/api/goods/task"
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
      loading: false,
      query: {
        searchKeyId: "",
        page: 1,
        pageSize: 10,
        changeType: "",
        taskId: ""
      },
      typeOptions: [
        { label: "不限", value: "" },
        { label: "商品名称", value: 1 },
        { label: "出版社名称", value: 2 },
        { label: "作者姓名", value: 3 },
        { label: "分类ID", value: 4 },
        { label: "ISBN号", value: 5 },
        { label: "所属商家", value: 6 },
        { label: "商品描述", value: 7 },
        { label: "商品图片", value: 8 },
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
      val && this.getTaskDetail()
    }
  },
  methods: {
    formatDate(date) {
      return format(date, "yyyy-MM-dd HH:mm:ss")
    },
    getTaskDetail() {
      if (hasValue(this.query.searchKeyId)) {
        if (!this.query.searchKeyId.match(/^[0-9]+$/)) {
          return this.$message.warning("当当ID或外平台ID格式错误")
        }
      }
      if (this.loading) return
      this.loading = true
      const queryParams = {
        ...this.query,
        //  partnerId: this.info.partnerId,
        taskId: this.info.taskId
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
      this.query = {
        searchKeyId: "",
        page: 1,
        pageSize: 10,
        changeType: "",
        taskId: ""
      }
    },
    handleExport() {
      // 必须先执行导出操作后才可以下载
      TaskResult({
        taskId: this.info.taskId,
      })
        .then(({ data }) => {
          if (data === 3) {
            dlFile(`${this.exportLink}${this.info.taskId}`, `商品信息变更明细-${this.info.taskNum}`, "xlsx")
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
    align-items: center;
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
