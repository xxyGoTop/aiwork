<template>
  <div class="page">
    <el-form :model="queryForm" ref="queryForm" inline label-width="82px">
      <el-row type="flex" justify="start" style="margin-bottom:15px">
        <el-form-item label="选择店铺">
          <el-select placeholder="选择店铺" v-model="queryForm.partnerId" size="small" style="width:260px">
            <el-option 
              v-for="(shop, index) in shops"
              :label="shop.partnerName"
              :value="shop.partnerId"
              :key="index">
            </el-option>
          </el-select>
        </el-form-item>
      </el-row>
      <el-row type="flex" align="middle" style="margin-bottom:16px">
        <el-form-item label="查询ID" prop="productIds">
          <el-input
            v-model="queryForm.productIds"
            placeholder="请输入查询ID，多个请用“换行”隔开，最多支持100品查询"
            type="textarea"
            :rows="5"
            size="small"
            style="width:500px">
          </el-input>
        </el-form-item>
      </el-row>
    </el-form>
    <el-row type="flex" justify="space-between">
      <div class="btn-left">
        <el-button type="primary" size="small" @click="handleSearch">筛选</el-button>
        <el-button type="info" size="small" @click="handleReset">清空筛选</el-button>
      </div>
      <div class="btn-right">
        <el-button type="primary" size="small" @click="handleBatchSync">批量同步</el-button>
        <!-- <el-button type="primary" size="small" @click="handleBatchQuery">批量查询</el-button> -->
        <el-button type="primary" size="small" @click="handleExportQuery">导出查询结果</el-button>
        <el-button type="primary" size="small" @click="handleExport">库存批量查询</el-button>
      </div>
    </el-row>

    <!-- 采用双table表头，单级表头和多级表头切换问题：
      1、不能采用同一个table;
      2、不能采用v-if，v-else;
      3、建议使用双table，一个v-if(动态创建DOM),一个v-show（预设表格结构);
    -->
    <!-- 天猫店铺 -->
    <el-table
      v-if="groupType === 1"
      :data="tableData"
      v-loading="loading"
      border
      style="width:100%;margin-top:15px">
      <el-table-column label="当当ID" prop="productId" align="center">
        <template #default="{ row }">
          <a :href="`${groupMap[0].link}${row.productId}.html`" target="_blank" class="jump_link">
            {{ row.productId }}
          </a>
        </template>
      </el-table-column>
      <el-table-column label="外平台ID" prop="outerId" align="center" min-width="80">
        <template #default="{ row }">
          <a :href="`${groupMap[groupType].link}${row.outerId}`" target="_blank" class="jump_link">
            {{ row.outerId }}
          </a>
        </template>
      </el-table-column>
      <el-table-column label="是否预售" prop="presale" align="center" min-width="80">
        <template #default="{ row }">
          {{ row.presale ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column label="是否锁库存" prop="locked" align="center" min-width="80">
        <template #default="{ row }">
          {{ row.locked ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column label="外卖场库存数" prop="outerSyncStockQuantity" align="center" min-width="100"></el-table-column>
      <el-table-column label="天津" align="center">
        <el-table-column label="天猫总量" align="center" prop="outerTianjinTotalQuantity"></el-table-column>
        <el-table-column label="天猫可售" prop="outerTianjinSaleQuantity" align="center"></el-table-column>
        <el-table-column label="当当可售" prop="dangTianjinSaleQuantity" align="center">
          <template #default="{ row }">
            <div>
              <Icon v-if="row.tianjinLocked" name="lock" class="lock-icon"></Icon>
              {{ row.dangTianjinSaleQuantity || 0}}
            </div>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="广州" align="center">
        <el-table-column label="天猫总量" prop="outerGuangzhouTotalQuantity" align="center"></el-table-column>
        <el-table-column label="天猫可售" prop="outerGuangzhouSaleQuantity" align="center"></el-table-column>
        <el-table-column label="当当可售" prop="dangGuangzhouSaleQuantity" align="center">
          <template #default="{ row }">
            <div>
              <Icon v-if="row.guangzhouLocked" name="lock" class="lock-icon"></Icon>
              {{ row.dangGuangzhouSaleQuantity || 0}}
            </div>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="无锡" align="center">
        <el-table-column label="天猫总量" prop="outerWuxiTotalQuantity" align="center"></el-table-column>
        <el-table-column label="天猫可售" prop="outerWuxiSaleQuantity" align="center"></el-table-column>
        <el-table-column label="当当可售" prop="dangWuxiSaleQuantity" align="center">
          <template #default="{ row }">
            <div>
              <Icon v-if="row.wuxiLocked" name="lock" class="lock-icon"></Icon>
              {{ row.dangWuxiSaleQuantity || 0}}
            </div>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="总和" align="center">
        <el-table-column label="天猫总量" prop="outerTotalQuantity" align="center"></el-table-column>
        <el-table-column label="天猫可售" prop="outerTotalSaleQuantity" align="center"></el-table-column>
        <el-table-column label="当当可售" prop="dangTotalSaleQuantity" align="center"></el-table-column>
      </el-table-column>
      <el-table-column label="备注" prop="remark" align="center">
        <template #default="{ row }">
          <el-tooltip effect="dark" placement="top">
            <template #content>
              <div style="max-width: 500px">{{row.remark}}</div>
            </template>
            <div class="ellp">{{row.remark}}</div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-popconfirm title="确定全部重新同步吗？" @confirm="handleStockSync(row)">
            <template #reference>
              <div class="button-ctrl-danger">重新同步</div>
            </template>
          </el-popconfirm>
          <p class="sotck-action"><span class="button-ctrl-danger" @click="handleLock(row)">锁库存</span></p>
          <p class="sotck-action"><span class="button-ctrl-danger" @click="handleResult(row)">查看锁库存</span></p>
        </template>
      </el-table-column>
    </el-table>
    <!-- 非天猫店铺 -->
    <el-table
      v-show="groupType !== 1"
      :data="tableData"
      v-loading="loading"
      border
      style="width:100%;margin-top:15px">
      <el-table-column label="当当ID" prop="productId" align="center">
        <template #default="{ row }">
          <a :href="`${groupMap[0].link}${row.productId}.html`" target="_blank" class="jump_link">
            {{ row.productId }}
          </a>
        </template>
      </el-table-column>
      <el-table-column label="外平台ID" prop="outerId" align="center" min-width="80">
        <template #default="{ row }">
          <a :href="`${groupMap[groupType].link}${row.outerId}`" target="_blank" class="jump_link">
            {{ row.outerId }}
          </a>
        </template>
      </el-table-column>
      <el-table-column label="是否预售" prop="presale" align="center" min-width="80">
        <template #default="{ row }">
          {{ row.presale ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column label="是否锁库存" prop="locked" align="center" min-width="80">
        <template #default="{ row }">
          {{ row.locked ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column label="外卖场库存数" prop="outerSyncStockQuantity" align="center" min-width="100"></el-table-column>
      <el-table-column label="当当可售总和" prop="taskCount" align="center" min-width="100">
        <template #default="{ row }">
          {{ row.dangTianjinSaleQuantity + row.dangWuxiSaleQuantity + row.dangGuangzhouSaleQuantity }}
        </template>
      </el-table-column>
      <el-table-column label="当当可售天津" prop="dangTianjinSaleQuantity" align="center">
        <template #default="{ row }">
          <div>
            <Icon v-if="row.tianjinLocked" name="lock" class="lock-icon"></Icon>
            {{ row.dangTianjinSaleQuantity || 0}}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="当当可售无锡" prop="dangWuxiSaleQuantity" align="center">
        <template #default="{ row }">
          <div>
            <Icon v-if="row.wuxiLocked" name="lock" class="lock-icon"></Icon>
            {{ row.dangWuxiSaleQuantity || 0}}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="当当可售广州" prop="dangGuangzhouSaleQuantity" align="center">
        <template #default="{ row }">
          <div>
            <Icon v-if="row.guangzhouLocked" name="lock" class="lock-icon"></Icon>
            {{ row.dangGuangzhouSaleQuantity || 0 }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" align="center">
        <template #default="{ row }">
          <el-tooltip effect="dark" placement="top">
            <template #content>
              <div style="max-width: 500px">{{row.remark}}</div>
            </template>
            <div class="ellp">{{row.remark}}</div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-popconfirm title="确定全部重新同步吗？" @confirm="handleStockSync(row)">
            <template #reference>
              <div class="button-ctrl-danger">重新同步</div>
            </template>
          </el-popconfirm>
          <p class="sotck-action"><span class="button-ctrl-danger" @click="handleLock(row)">锁库存</span></p>
          <p class="sotck-action"><span class="button-ctrl-danger" @click="handleResult(row)">查看锁库存</span></p>
        </template>
      </el-table-column>
    </el-table>
    <!-- pagination -->
    <!-- <el-row type="flex" justify="end" style="margin:20px 0">
      <el-pagination
        background
        hide-on-single-page
        layout="total,prev,pager,next"
        :total="total"
        :page-sizes="[20, 30]"
        :page-size="queryForm.pageSize"
        :current-page="queryForm.page"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange">
      </el-pagination>
    </el-row> -->
    <!-- 补锁编辑 -->
    <lock-stock-drawer
      title="添加锁库存"
      stock-title="补锁锁库存"
      :products="products"
      :shops="shops"
      :lock-form="lockForm"
      :lock-type="{}"
      :visible.sync="visible"
      :doading="stockLoading"
      @refresh="getList">
    </lock-stock-drawer>
    <!-- 导出 -->
    <export-stock-drawer
      :partner-id="queryForm.partnerId"
      :visible.sync="exportVisible">
    </export-stock-drawer>
    <!-- 批量查询 -->
    <batch-stock-drawer
      :partner-id="queryForm.partnerId"
      :visible.sync="batchQueryVisible">
    </batch-stock-drawer>
    <!-- 批量同步 -->
    <BatchSync
      :visible.sync="batchSyncVisible"
      :shops="shops"
      :pickShop="pickShop"
      @refresh="handleSyncQuery"
      >
    </BatchSync>
  </div>
</template>

<script>
import {
  // StockPartners,
  stockQuery,
  stockSync,
  queryStockByProduct,
  exportStockQueryData,
} from "@/api/stock"
import {
  GoodsShops,
} from "@/api/goods/list"
import {
  saveFile,
  local,
} from "@/util"
import { format } from "date-fns"
import LockStockDrawer from "./components/LockStockDrawer"
import ExportStockDrawer from "./components/ExportStockDrawer"
import BatchStockDrawer from "./components/BatchStockDrawer"
import BatchSync from "./components/BatchSync"

export default {
  components: {
    LockStockDrawer,
    ExportStockDrawer,
    BatchStockDrawer,
    BatchSync,
  },
  data() {
    return {
      visible: false,
      batchQueryVisible: false,
      batchSyncVisible: false,
      queryForm: {
        partnerId: "",
        productIds: "",
        // pageSize: 20,
        // page: 1,
      },
      taskType: 203,
      shops: [],
      total: 0,
      tableData: [],
      loading: false,
      lockForm: {
        partnerId: "",
        stockDate: null,
      },
      products: [],
      editStatus: 1,
      stockLoading: false,
      exportVisible: false,
      pickShop: "",
    }
  },
  beforeRouteLeave(_, from , next) {
    this.$store.commit("setPartnerId", this.queryForm.partnerId || "")
    next()
  },
  computed: {
    groupMap() {
      return this.$store.state.groupMap
    },
    groupType() {
      const findedShop = this.shops.find(shop => shop.partnerId === this.queryForm.partnerId)
      return findedShop ? findedShop.groupType : ""
    },
  },
  methods: {
    formatDate(date) {
      return format(date, "yyyy-MM-dd HH:mm:ss")
    },
    // 批量同步
    handleBatchSync() {
      this.batchSyncVisible = true
      if (this.queryForm.partnerId) {
        this.pickShop = `${this.queryForm.partnerId}`
      }
    },
    // 批量同步查询
    handleSyncQuery() {
      const ids = [...new Set(local.get("ids").split(/[\n\r]\s*/).filter(i => i))].join("\n")
      this.queryForm.productIds = ids
      this.getList()
    },
    // 批量查询
    handleBatchQuery() {
      this.batchQueryVisible = true
    },
    getShops() {
      GoodsShops()
        .then(({ data }) => {
          this.shops = data || []
          this.queryForm.partnerId = this.$store.state.partnerId ? this.$store.state.partnerId : this.shops[0].partnerId
          this.getList()
        })
        .catch(console.warn)
    },
    // 查询
    getList() {
      if (this.loading) return
      this.loading = true
      const prods = this.queryForm.productIds.split(/[\n\r]\s*/).filter(i => i)
      const queryParams = {
        partnerId: this.queryForm.partnerId,
        pageSize: this.queryForm.pageSize,
        page: this.queryForm.page,
        productIds: prods + ""
      }
      if (prods.length > 100) {
        return this.$message.warning("最多支持100品查询")
      }
      stockQuery(queryParams)
        .then(({ data, total }) => {
          this.tableData = data
          this.total = total
        })
        .catch(console.warn)
        .finally(() => {
          this.loading = false
        })
    },
    handleSearch() {
      // this.queryForm.page = 1;
      this.getList()
    },
    handleReset() {
      this.$refs.queryForm.resetFields()
    },
    handleExport() {
      this.exportVisible = true
    },
    handleExportQuery() {
      const { partnerId, productIds } = this.queryForm
      if (!productIds) {
        this.$message.error("未输入查询商品ID")
        return
      }
      exportStockQueryData({
        partnerId,
        productId: productIds ? productIds.split(",") : "",
      })
        .then((data) => {
          saveFile(data, "库存查询结果", "xlsx")
        })
        .catch(console.warn)
    },
    handleSizeChange(pagesize) {
      this.queryForm.pageSize = pagesize
      this.getList()
    },
    handleCurrentChange(page) {
      this.queryForm.page = page
      this.getList()
    },
    handleStockSync({ productId, outerDangProductId }) {
      const { partnerId } = this.queryForm
      stockSync({
        partnerId,
        productId,
        outerDangProductId
      }).then(() => {
        this.$message.success("提交成功")
        this.getList()
      })
    },
    handleLock({ productId }) {
      const { partnerId } = this.queryForm
      this.lockForm = {
        partnerId,
      }
      this.visible = true
      this.queryStockByProduct(productId)
    },
    queryStockByProduct(productId) {
      const { partnerId } = this.queryForm
      this.stockLoading = true
      queryStockByProduct({
        partnerId,
        productId,
      }).then(data => {
        this.products = [{ ...data.data }]
      }).finally(() => {
        this.stockLoading = false
      })
    },
    // 查看发布结果
    handleResult(row) {
      const { partnerId } = this.queryForm
      this.$router.push(`/stock/list?partnerId=${partnerId}&productId=${row.productId}`)
    },
  },
  created() {
    this.getShops()
  },
  beforeDestroy() {
    local.remove("ids")
  }
}
</script>

<style lang="scss" scoped>
.search {
  position: relative;
  .search-icon {
    position: absolute;
    top: 12px;
    right: 12px;
    color: #999999;
    cursor: pointer;
    font-size: 14px;
  }
}
.jump_link{
  color: #0061D9;
  text-decoration: none;
}
.lock-icon{
  display:inline-flex;
  position: relative;
  top: 4px;
  font-size: 14px;
  box-sizing: border-box;
  color: #FC5757;
}
.el-table::v-deep {
  .el-table__body-wrapper {
    overflow-x: scroll !important;
  }
}
</style>
