<template>
<div class="goods">
  <div class="goods-content">
    <el-form :model="formData" ref="queryForm" inline label-width="82px">
      <el-row type="flex" justify="start" style="margin-bottom:15px">
        <el-col :span="8">
          <el-form-item label="选择店铺">
            <el-select placeholder="选择店铺" v-model="formData.partnerId" size="small" style="width:191.6px">
              <el-option 
                v-for="(shop, index) in shops"
                :label="shop.partnerName"
                :value="shop.partnerId"
                :key="index">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="商品编号" prop="productId">
            <el-input v-model="formData.productId" placeholder="请输入商品编号" type="text" size="small" style="width:191.6px"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="创建人" prop="creator">
            <el-input type="text" v-model="formData.creator" placeholder="请输入任务创建人" size="small" style="width:191.6px"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row type="flex" justify="start" align="middle" style="margin-bottom:16px">
        <el-col :span="8">
          <el-form-item label="任务编号" prop="taskNum">
            <el-input v-model="formData.taskNum" placeholder="请输入任务编号" type="text" size="small" style="width:191.6px"></el-input>
          </el-form-item>
        </el-col>
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
      </el-row>
    </el-form>
    <el-row type="flex" justify="space-between" style="margin-bottom: 15px">
      <div class="btn-left">
        <el-button type="primary" size="small" @click="handleSearch">筛选</el-button>
        <el-button type="info" size="small" @click="handleReset">清空筛选</el-button>
      </div>
      <div class="btn-right">
        <!-- <el-button type="primary" size="small" @click="handleAddGoods">新增锁库存</el-button> -->
        <el-button type="info" size="small" @click="batchOperateVisible = !batchOperateVisible" style="background:white;color:black;border-color:#c1c1c1">
          批量操作
        </el-button>
      </div>
    </el-row>
    <el-table :data="list" ref="multipleTable" v-loading="isLoading" @sort-change="handleSortSearch" @selection-change="handleSelect">
      <el-table-column type="selection" width="42"></el-table-column>
      <el-table-column label="当当ID" min-width="100">
        <template #default="{ row }">
          <div>{{row.productId}}</div>
        </template>
      </el-table-column>
      <el-table-column label="外平台ID" min-width="110">
        <template #default="{ row }">
          <a :href="`${groupMap[groupType].link}${row.outerCode}`" target="_blank" style="color: #0061D9;text-decoration:none">
            {{ row.outerCode }}
          </a>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" min-width="120">
        <template #default="{ row }">
          {{row.productName ? row.productName.slice(0, 10) : ''}}
        </template>
      </el-table-column>
      <el-table-column label="锁库存类型" prop="lockStockDesc" align="center" v-if="groupType === 1"></el-table-column>
      <el-table-column label="仓库" prop="warehouseName" width="100">
        <template #header>
          <DropdownSelect
            label="仓库"
            :options="statusOptions"
            :topOffset="19"
            v-model="formData.warehouseId"
            @select="handleSearch">
          </DropdownSelect>
        </template>
      </el-table-column>
      <el-table-column label="锁库存状态" prop="lockStatusName" width="110">
        <template #header>
          <DropdownSelect
            label="锁库存状态"
            :options="presaleOptions"
            :topOffset="19"
            v-model="formData.lockStatus"
            @select="handleSearch">
          </DropdownSelect>
        </template>
      </el-table-column>
      <el-table-column label="任务编号" prop="taskNum" width="100"></el-table-column>
      <el-table-column label="首次锁定值" prop="firstStockCount" width="95"></el-table-column>
      <el-table-column label="锁定总值" prop="stockCount" width="80"></el-table-column>
      <el-table-column label="外卖场库存数" prop="outerStockCount" width="110"></el-table-column>
      <el-table-column label="锁库存时间段" prop="lockStartTime" width="160" sortable>
        <template #default="{ row }">
          <span>{{row.lockStartTime}}~{{row.lockEndTime}}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="lockStartTime" width="150" show-overflow-tooltip>
        <template #default="{ row }">
          <span v-if="row.lockStatus === 2">{{ row.lockRemark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" prop="creator"></el-table-column>
      <el-table-column label="创建时间" prop="creationDate" min-width="120" sortable></el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-row type="flex">
            <div class="button-ctrl-danger" v-if="row.lockStatus === 1" @click="handleBatchLock(1, row)">补锁</div>
            <div class="button-ctrl-danger" v-if="row.lockStatus === 1" @click="handleRemoveLock(row)">解锁</div>
            <div class="button-ctrl-danger" v-if="(row.lockStatus === 2 || row.lockStatus === 11)" @click="handleBatchLock(2, row)">编辑</div>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
    <el-row type="flex" justify="end">
      <el-pagination
        style="margin-top:16px"
        background
        hide-on-single-page
        layout="total, prev, pager, next"
        :total="total"
        :current-page.sync="formData.pageNum"
        :page-size="formData.pageSize"
        @current-change="handleCurrentChange">
      </el-pagination>
    </el-row>
  </div>

  <!-- 批量操作 -->
  <div class="goods-batch" v-show="batchOperateVisible">
    <el-row type="flex" justify="space-between" align="middle">
      <div class="operate-left">
        <span class="checkbox" v-if="count === 0"></span>
        <Icon name="checked" v-else class="checkbox-selected"></Icon>
        <span class="select_count">已选{{ count }}项</span>
        <span class="select_cancel" @click="handleCancelSelect">取消</span>
      </div>
      <div class="operate-right">
        <el-button type="primary" size="small" @click="handleExport()">批量导出</el-button>
        <el-button type="primary" size="small" :disabled="selectOptions.length === 0" @click="handleBatchLock(1)">批量补锁</el-button>
        <el-button type="primary" size="small" :disabled="selectOptions.length === 0" @click="handleRemoveLock()">批量解锁</el-button>
        <!-- <el-button type="primary" size="small" :disabled="selectOptions.length === 0" @click="handleBatchLock(2)">批量编辑</el-button> -->
      </div>
    </el-row>
  </div>
  <!-- 补锁编辑 -->
  <lock-stock-drawer
    title="锁库存"
    stock-title="补锁锁库存"
    :row="selectOptions"
    :products="products"
    :disabled="true"
    :shops="shops"
    :lock-form="lockForm"
    :lock-type="lockType"
    :edit-status="editStatus"
    :edited="edited"
    :visible.sync="visible"
    :doading="stockLoading"
    @refresh="getList">
  </lock-stock-drawer>
</div>
</template>

<script>
import {
  stockLockList,
  // StockPartners,
  releaseStockLock,
  batchQueryStockByProduct,
  exportStockLockData,
} from '@/api/stock';
import {
  GoodsShops,
} from '@/api/goods/list';
import {
  hasValue,
  saveFile,
} from '@/util';
import LockStockDrawer from './components/LockStockDrawer';

export default {
  components: { LockStockDrawer },
  data() {
    return {
      batchOperateVisible: false,
      moreOperateVisible: false,
      visible: false,
      exportVisible: false,
      isLoading: false,
      shops: [],
      total: 0,
      info: {},
      formData: {
        pageNum: 1,
        pageSize: 10,
        creator: '',
        partnerId: '',
        productId: '',
        warehouseId: '',
        stockOrderBy: '',
        orderBy: '',
        lockStatus: '',
        creationDateStart: '',
        creationDateEnd: '',
      },
      lockForm: {
        partnerId: '',
        stockDate: null,
      },
      creationDate: null,
      list: [],
      statusOptions: [
        { label: '不限', value: '' },
        { label: '天津', value: 30 },
        { label: '无锡', value: 17 },
        { label: '广州', value: 25 },
      ],
      presaleOptions: [
        { label: '不限', value: '' },
        { label: '待执行', value: 0 },
        { label: '已解锁', value: 3 },
        { label: '补锁中', value: 10 },
        { label: '锁定成功', value: 1 },
        { label: '锁定异常', value: 2 },
        { label: '其他异常', value: 11 },
      ],
      saleStatusMap: [
        { label: '待上架' },
        { label: '已上架' },
        { label: '被下架' },
      ],
      count: 0,
      selectOptions: [],
      selectedShopIds: [],
      queryParams: {},
      selected: false,
      selectedAll: false,
      products: [],
      editStatus: 1,
      stockLoading: false,
      edited: 0,
      lockType: {},
    };
  },
  computed: {
    productId: function() {
      return this.$route.query.productId || '';
    },
    partnerId: function() {
      return +this.$route.query.partnerId || '';
    },
    groupType() {
      const findedShop = this.shops.find(shop => shop.partnerId === this.formData.partnerId);
      return findedShop ? findedShop.groupType : '';
    },
    groupMap() {
      return this.$store.state.groupMap;
    },
  },
  beforeRouteLeave(_, from , next) {
    this.$store.commit('setPartnerId', this.formData.partnerId || '');
    next()
  },
  methods: {
    hasValue,
    getShops() {
      GoodsShops()
        .then(({ data }) => {
          this.shops = data || [];
          // 初始设置和查询
          if (this.shops.length) {
            this.formData.partnerId = this.$store.state.partnerId ? this.$store.state.partnerId : (this.partnerId || this.shops[0].partnerId);
            this.getList()
          } else {
            this.$message.warning('尚无店铺');
          }
        })
        .catch(console.warn);
    },
    // 销量排序查询
    handleSortSearch({ prop, order }) {
      if (prop === 'creationDate') {
        this.formData.orderBy = order === 'ascending' ? 0 : 1;
        this.handleSearch();
      } else if (prop === 'lockStartTime') {
        this.formData.stockOrderBy = order === 'ascending' ? 0 : 1;
        this.handleSearch();
      }
    },
    getQueryParams() {
      const params = Object.create(null);
      const queryParams = this.formData;
      queryParams.creationDateStart = this.creationDate ? this.creationDate[0] : '';
      queryParams.creationDateEnd = this.creationDate ? this.creationDate[1] : '';
      for (const [key, value] of Object.entries(queryParams)) {
        if (hasValue(value)) {
          params[key] = value;
        }
      }
      return params;
    },
    // 查询
    getList() {
      if (this.isLoading) return;
      this.isLoading = true;
      this.handleCancelSelect();
      const params = this.getQueryParams();
      stockLockList(params)
        .then(({ data, total, }) => {
          this.total = total || 0;
          this.list = data || [];
        })
        .catch(console.warn)
        .finally(() => {
          this.isLoading = false;
        });
    },
    handleSearch() {
      this.formData.pageNum = 1;
      this.getList();
    },
    handleReset() {
      this.$refs.queryForm.resetFields();
      this.formData.productId = '';
      this.creationDate = null;
      this.formData.warehouseId = '';
      this.formData.lockStatus = '';
    },
    // 操作分页
    handleCurrentChange(page) {
      this.formData.pageNum = page;
      this.getList();
    },
    handleAddLock(row) {
      const { partnerId, productId, lockStartTime, lockEndTime } = row;
      this.lockForm = {
        partnerId,
        stockDate: [lockStartTime, lockEndTime],
      }
      this.visible = true;
      this.queryStockByProduct(partnerId, productId);
    },
    handleBatchLock(editStatus, row = '') {
      let productRows = [];
      let lockType = {};
      if (row) {
        productRows = [{ ...row }];
        this.selectOptions = [{ ...row }];
      } else if (editStatus === 1) {
        productRows = this.selectOptions.filter(s => (s.lockStatus === 1));
      } else {
        productRows = this.selectOptions.filter(s => (s.lockStatus === 2 || s.lockStatus === 11));
      }
      productRows.forEach(row => {
        lockType[row.productId] = row.lockType;
      });
      const { partnerId } = productRows.length ? productRows[0] : {};
      let productIds = productRows.map(o => o.productId);
      productIds = [...new Set(productIds)].join(',');
      this.lockType = lockType;
      this.lockForm = { partnerId };
      // 批量编辑异常商品
      if (!productIds && editStatus === 2) return this.$message.warning('请选择锁库存状态异常商品进行操作')
      this.visible = true;
      this.editStatus = editStatus;
      this.edited = editStatus === 2 ? 1 : 0;
      this.queryStockByProduct(partnerId, productIds);
    },
    // 批量获取
    queryStockByProduct(partnerId, productIds) {
      this.stockLoading = true;
      batchQueryStockByProduct({
        partnerId,
        productId: productIds,
      }).then(data => {
        this.products = data.data;
      }).finally(() => {
        this.stockLoading = false;
      })
    },
    // 释放库存
    handleRemoveLock(row = '') {
      const productRows = row ? [{ ...row }] : this.selectOptions;
      this.$alert('确定释放当前选中的锁', '提示', {
        type: 'info',
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        showCancelButton: true,
        callback: (action) => {
          if (action === 'confirm') {
            const productIds = productRows.map(o => ({
              partnerId: o.partnerId,
              productId: o.productId,
              warehouseId: o.warehouseId
            }));
            releaseStockLock(productIds)
              .then(() => {
                this.getList();
              })
              .catch(console.warn);
          }
        }
      })
    },
    // 选择
    handleSelect(selection) {
      if (selection.length > 0) {
        this.count = selection.length;
        this.batchOperateVisible = true;
      } else {
        this.count = 0;
      }
      this.selectOptions = selection;
    },
    // 取消选择 
    handleCancelSelect() {
      this.$refs.multipleTable.clearSelection();
      this.count = 0;
      this.batchOperateVisible = false;
    },
    // 批量导出
    handleExport() {
      let stockLockExports = this.selectOptions.map(o => ({
        partnerId: o.partnerId,
        productId: o.productId,
        warehouseId: o.warehouseId,
      }));
      exportStockLockData(stockLockExports).then(data => {
        saveFile(data, '批量锁库存结果', 'xlsx');
        this.handleCancelSelect();
      })
    }
  },
  created() {
    this.formData.productId = this.productId;
    this.getShops();
  },
};
</script>

<style lang="scss" scoped>
.goods {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  min-height: calc(100vh - 66px);
  box-sizing: border-box;
  .goods-content {
    flex: 1;
    padding: 24px;
  }
  .goods-batch {
    flex: none;
  }
}
.search {
  position: relative;
  margin-right: 16px;
  .search-icon {
    position: absolute;
    top: 12px;
    right: 12px;
    color: #999999;
    cursor: pointer;
    font-size: 14px;
  }
}
.goods-batch{
  position:sticky;
  bottom:0;
  padding: 15px;
  z-index: 10;
  background: #FFFFFF;
  box-shadow: 0 0 14px 0 rgba(0,0,0,0.10);
  box-sizing: border-box;
  .operate-left{
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;
    word-break: keep-all;
    margin-right: 15px;
    .select_count{
      font-size: 14px;
      color: #141414;
      letter-spacing: 0;
      line-height: 22px;
    }
    .select_cancel{
      font-size: 14px;
      color: #0061D9;
      letter-spacing: 0;
      line-height: 22px;
      margin: 0 10px;
      cursor: pointer;
    }
    .checkbox{
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 1px solid #dcdfe6;
      border-radius: 2px;
      background: white;
      margin-right: 5px;
    }
    .checkbox-selected {
      margin-right: 5px;
      background-color: #fc5757;
      color: #fff;
      border-radius: 2px;
      font-size: 14px;
    }
  }
  .operate-right{
    display: flex;
    flex-wrap: nowrap;
  }
}
</style>
