<template>
<div class="goods">
  <div class="goods-content">
    <el-row type="flex" justify="end">
      <el-input
        type="textarea"
        :rows="2"
        v-model="keywords"
        placeholder="搜索商品ID，最多100个，多个用“换行”隔开"
        style="width: 290px;">
      </el-input>
      <div class="query-row">
        <el-row type="flex" style="margin-bottom: 12px">
          <el-row type="flex" style="margin-left: 12px">
            <el-select placeholder="选择店铺" v-model="formData.partnerId" @change="handleGetOuterCate" class="shop-select">
              <el-option
                v-for="(shop, index) in shops"
                :label="shop.partnerName"
                :value="shop.partnerId"
                :key="index">
              </el-option>
            </el-select>
            <el-cascader
              class="cate-select"
              placeholder="当当分类"
              v-model="DDcatePath"
              :props="cateProps"
              :options="DDcatesOptions"
              :disabled="catePath.length ? true : false"
              clearable
              @change="handleSearch">
            </el-cascader>
            <el-cascader
              class="cate-select outerSite"
              placeholder="外站分类"
              v-model="catePath"
              :props="cateProps"
              :options="catesOptions"
              :disabled="DDcatePath.length ? true : false"
              clearable
              @change="handleSearch">
            </el-cascader>
          </el-row>
          <el-row type="flex" style="margin-left: 12px">
            <el-button type="primary" size="small" @click="handleSearch" style="height:38px">筛选</el-button>
            <el-button type="info" size="small" @click="handleReset" style="height:38px">清空筛选</el-button>
          </el-row>
        </el-row>
        <el-row type="flex" justify="end" style="margin-left: 12px">
          <el-button type="info" size="small" @click="batchOperateVisible = !batchOperateVisible" style="background:white;color:black;border-color:#c1c1c1;height:38px">
            批量操作
          </el-button>
          <div class="more">
            <div title="更多" @click="handleMore" class="more-trigger">
              <Icon name="more" class="more-icon"></Icon>
            </div>
            <div class="more-operate" v-show="moreOperateVisible">
              <router-link :to="{ name: 'goods-publish' }" class="more-link">
                商品发布<Icon name="link" style="color: #FC5757;"></Icon>
              </router-link>
              <router-link :to="{ name: 'goods-updateinfo' }" class="more-link">
                信息修改<Icon name="link" style="color: #FC5757;"></Icon>
              </router-link>
              <router-link :to="{ name: 'goods-updateprice' }" class="more-link">
                商品改价<Icon name="link" style="color: #FC5757;"></Icon>
              </router-link>
              <router-link :to="{ name: 'goods-map' }" class="more-link">
                商品映射<Icon name="link" style="color: #FC5757;"></Icon>
              </router-link>
              <router-link :to="{ name: 'goods-batchshelf' }" class="more-link">
                上下架<Icon name="link" style="color: #FC5757;"></Icon>
              </router-link>
            </div>
          </div>
        </el-row>
      </div>
    </el-row>

    <el-table :data="list" ref="multipleTable" v-loading="isLoading" element-loading-text="数据加载中" row-key="id" @sort-change="handleSortSearch" @selection-change="handleSelect">
      <el-table-column type="selection" width="42" :reserve-selection="true"></el-table-column>
      <el-table-column label="商品名称 & 当当ID" min-width="140">
        <template #default="{ row }">
          <div @click="handleViewDetail(row)" style="cursor:pointer">
            <div class="ellp-2">{{row.productName}}</div>
            <div style="font-size: 12px;color: #999999;">{{row.productId}}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="groupType !== 1 ? '外部ID' : '天猫ID'" min-width="140">
        <template #default="{ row }">
          <a
            v-if="row.outerCode"
            :href="`${groupMap[groupType].link}${row.outerCode}`"
            target="_blank"
            rel="noopener noreferer"
            style="color: #0061D9;text-decoration:none;flex:none">
            {{ row.outerCode }}
          </a>
        </template>
      </el-table-column>
      <el-table-column label="SKUID" prop="outerSkuId"></el-table-column>
      <el-table-column label="SKU数量" prop="outerSkuNum" v-if="groupType === 1"></el-table-column>
      <el-table-column label="SKU数量" prop="skucount" v-if="groupType === 2 || groupType === 3"></el-table-column>
      <el-table-column label="商品状态" prop="salseStatusStr" width="100">
        <template #header>
          <DropdownSelect
            label="商品状态"
            :options="saleStatusOptions"
            :topOffset="19"
            v-model="formData.saleStatus"
            @select="handleSearch">
          </DropdownSelect>
        </template>
        <template #default="{ row }">
          <el-row type="flex" align="middle">
            <i class="dot" :class="row.saleStatus === 1 ? 'on' : ''"></i>
            <!-- <div v-if="row.saleStatus !== -1">{{saleStatusMap[row.saleStatus].label}}</div> -->
            <span>{{ row.salseStatusStr }}</span>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column label="是否预售" prop="outerPresaleStr" width="100">
        <template #header>
          <DropdownSelect
            label="是否预售"
            :options="presaleOptions"
            :topOffset="19"
            v-model="formData.isPresale"
            @select="handleSearch">
          </DropdownSelect>
        </template>
      </el-table-column>
      <el-table-column label="商品分类" prop="categoryStr" width="100"></el-table-column>
      <el-table-column label="商品价格" prop="price" width="130">
        <template #default="{ row }">
          {{ isValid(row.price) ? row.price : '-'}}
        </template>
      </el-table-column>
      <el-table-column label="商品库存" prop="stock" width="100">
        <template #default="{ row }">
          {{ isValid(row.stock) ? row.stock : '-'}}
        </template>
      </el-table-column>
      <el-table-column label="商品销量" prop="saleQuantity" sortable width="120">
        <template #header="{ column }">
          <div style="display: inline-flex;align-items: center;position: relative;top: 3px;">
            <el-tooltip content="自然月商品销售数量" placement="top">
              <Icon name="question"></Icon>
            </el-tooltip>
            <span>{{column.label}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" prop="publishDateStr" min-width="100"></el-table-column>
      <el-table-column label="操作" min-width="160">
        <template #default="{ row }">
          <el-row type="flex">
            <template v-if="row.saleStatus === 1">
              <div class="button-ctrl-disabled">上架</div>
              <div class="button-ctrl" @click="handleOffShelf(row)">下架</div>
              <div class="button-ctrl-disabled">删除</div>
            </template>
            <template v-else-if="row.saleStatus === 0 || row.saleStatus === 2 || row.saleStatus == -1">
              <div class="button-ctrl" @click="handleOnShelf(row)">上架</div>
              <div class="button-ctrl-disabled">下架</div>
              <el-popconfirm title="确定删除吗？" @confirm="handleRemoveProd(row)">
                <template #reference>
                  <div class="button-ctrl-danger">删除</div>
                </template>
              </el-popconfirm>
            </template>
            <div class="button-ctrl" @click="handleUnBind(row)" v-if="groupType === 1 && row.deleted !== 2">解绑</div>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
    <el-row type="flex" justify="end">
      <el-pagination
        style="margin-top:16px"
        background
        hide-on-single-page
        layout="prev, pager, next"
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
        <el-button type="primary" size="small" icon="el-icon-delete" :disabled="count === 0" @click="handleBatchRemove">批量删除</el-button>
        <el-button type="primary" size="small" @click="handleExport">批量导出</el-button>
      </div>
    </el-row>
  </div>

  <!-- 商品信息弹窗 -->
  <DetailDrawer :visible.sync="detailVisible" :info="info"></DetailDrawer>

  <!-- 导出 -->
  <ExportDrawer
    :visible.sync="exportVisible"
    :shops="shops"
    :pickShop="formData.partnerId"
    :selectedShopIds="selectedShopIds"
    :queryParams="queryParams">
  </ExportDrawer>
</div>
</template>

<script>
import {
  DDCate,
  // DDCateFuzzySearch,
  GoodsDel,
  // GoodsDetail,
  GoodsOffShelf,
  GoodsOnShelf,
  OuterCate,
  // OuterCateFuzzySearch,
  GoodsShops,
  // GoodsPrice,
  // GoodsSale,
  GoodsSearch,
  BatchDelete,
  GetPrice,
  GetStock,
  ProductUnbind,
} from '@/api/goods/list';
import DetailDrawer from './components/DetailDrawer';
import ExportDrawer from './components/ExportDrawer';
import {
  hasValue,
  // filterSpace,
  isValid,
} from '@/util';
/**
taskTypeMap: {
  101: '商品导出',
  102: '商品发布',
  103: '商品改价',
  104: '商品信息修改',
  105: '商品映射',
  106: '商品上下架',
  107: '商品删除',
}

groupType: {
  1: '天猫',
  2: '拼多多',
  3: '抖音',
  4: '快手',
}
*/
export default {
  components: {
    DetailDrawer,
    ExportDrawer,
  },
  data() {
    return {
      batchOperateVisible: false,
      moreOperateVisible: false,
      detailVisible: false,
      exportVisible: false,
      isLoading: false,
      shops: [],
      total: 0,
      info: {},
      formData: {
        pageNum: 1,
        pageSize: 10,
        categoryDepth: '',
        catpath: '',
        isPresale: '',
        outerCategory: '',
        partnerId: '',
        productId: '',
        productName: '',
        saleQuantitySort: 1,
        saleStatus: '',
      },
      list: [],
      DDcatePath: [],
      DDcatesOptions: [],
      catePath: [],
      catesOptions: [],
      cateProps: {
        label: 'name',
        value: 'catpath',
        children: 'children',
        checkStrictly: true,
      },
      saleStatusMap: [
        { label: '待上架', value: 0 },
        { label: '已上架', value: 1 },
        { label: '被下架', value: 2 },
        { label: '上架失败', value: -1 },
      ],
      presaleOptions: [
        { label: '不限', value: '' },
        { label: '非预售', value: 0 },
        { label: '预售', value: 1 },
      ],
      count: 0,
      selectOptions: [],
      selectedShopIds: [],
      queryParams: {},
      tempSelectOptions: [],
      selected: false,
      selectedAll: false,
      currentSelectOptions: [],
      offShelfLock: false,
      delLock: false,
      keywords: ''
    };
  },
  beforeRouteLeave(_, from , next) {
    this.$store.commit('setPartnerId', this.formData.partnerId || '');
    next()
  },
  computed: {
    groupType() {
      const findedShop = this.shops.find(shop => shop.partnerId === this.formData.partnerId);
      return findedShop ? findedShop.groupType : '';
    },
    groupMap() {
      return this.$store.state.groupMap;
    },
    isTMShop() {
      return this.groupType === 1
    },
    // 商品状态
    saleStatusOptions() {
      const options = [
        { label: '不限', value: '' },
        { label: '待上架', value: 0 },
        { label: '已上架', value: 1 },
        { label: '被下架', value: 2 }
      ];
      if (this.groupType === 1) {
        return [
          ...options,
          { label: '上架失败', value: -1 },
        ]
      }
      return options
    },
  },
  methods: {
    isValid,
    getShops() {
      GoodsShops()
        .then(({ data }) => {
          this.shops = data || [];
          // 初始设置和查询
          if (this.shops.length) {
            this.formData.partnerId = this.$store.state.partnerId ? this.$store.state.partnerId : this.shops[0].partnerId;
            // 商品信息跳转查询
            const { productId, partnerId  } = this.$route.query;
            if (productId) this.formData.productId = +productId;
            if (partnerId) this.formData.partnerId = +partnerId;
            this.handleGetOuterCate();
            this.getList()
          } else {
            this.$message.warning('尚无店铺');
          }
        })
        .catch(console.warn);
    },
    // 获取外站分类
    handleGetOuterCate() {
      this.formData.categoryDepth = '';
      this.formData.catpath = '';
      this.formData.outerCategory = '';
      this.DDcatePath = [];
      this.catePath = [];
      this.handleSearch();
      OuterCate({ partnerId: this.formData.partnerId })
        .then(({ data }) => {
          this.catesOptions = this.formatCate(data.category);
        })
        .catch(console.warn);
    },
    // 获取当当分类
    getDDCates() {
      DDCate()
        .then(({ data }) => {
          this.DDcatesOptions = this.formatCate(data);
        })
        .catch(console.warn);
    },
    // 分类最后一级处理
    formatCate(data) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].children.length < 1) {
          data[i].children = undefined
        } else {
          this.formatCate(data[i].children)
        }
      }
      return data
    },
    handleViewDetail(row) {
      this.detailVisible = true;
      this.info = {
        ...row,
        groupType: this.groupType
      };
    },
    // 销量排序查询
    handleSortSearch({ prop, order }) {
      if (prop === 'saleQuantity') {
        this.formData.saleQuantitySort = order ? order === 'ascending' ? 2 : 1 : '';
        this.handleSearch();
      }
    },
    getQueryParams() {
      if (this.catePath.length >= 1) {
        const len = this.catePath.length;
        this.formData.categoryDepth = len;
        this.formData.outerCategory = this.catePath[len - 1];
      }
      if (this.DDcatePath.length >= 1) {
        const len = this.DDcatePath.length;
        this.formData.categoryDepth = len;
        this.formData.catpath = this.DDcatePath[len - 1];
      }
      const queryParams = { ...this.formData };
      if (this.keywords) {
        queryParams.productId = this.keywords.split('\n').filter(item => item).join(',')
        queryParams.productId = queryParams.productId.replace(/\s*/g,"") // 去掉所有空格
      }
      const params = Object.create(null);
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
      const params = this.getQueryParams();
      GoodsSearch(params)
        .then(({ data, total, }) => {
          this.total = total || 0;
          this.list = data || [];
          if (data && data.length) {
            this.getPice(data);
            this.getStock(data);
          }
        })
        .catch(console.warn)
        .finally(() => {
          this.isLoading = false;
          this.formData.catpath = '';
          this.formData.outerCategory = '';
          this.formData.categoryDepth = '';
        });
    },
    // 获取参数
    getPiceAndStockParams(data) {
      const params = {
        partnerId: this.formData.partnerId,
      };
      params.ids = data.map(item => item.id);
      return params
    },
    // 处理价格和库存
    processPriceStock(data, k) {
      if (data && data.length) {
        const idMap = Object.create(null);
        data.forEach(e => {
          idMap[e.id] = e;
        })
        this.list.forEach(item => {
          if (k === 'stock') {
            // 库存
            data.forEach(e => {
              if (item.productId === e.productId) {
                item[k] = `${e['onSaleStock']}/${item[k]}`;
              }
            })
          } else {
            // 价格
            if (this.isTMShop) {
              item.price = idMap[item.id] ? `${idMap[item.id].price}/${isValid(idMap[item.id].ddPrice) ? idMap[item.id].ddPrice : '-'}` : `-/${isValid(idMap[item.id].ddPrice) ? idMap[item.id].ddPrice : '-'}`;
            } else {
              item.price = idMap[item.id] ? `${idMap[item.id].price}/${isValid(item.price) ? item.price : '-'}` : `-/${isValid(item.price) ? item.price : '-'}`;
            }
          }
        })
      } else if (data && data.length === 0) {
        this.list.forEach(item => {
          if (k === 'stock') {
            item[k] = `-/${item[k]}`;
          } else {
            // 价格
            item[k] = `-/${isValid(item[k]) ? item[k] : '-'}`;
          }
        })
      }
    },
    // 价格查询
    getPice(data) {
      const d = this.getPiceAndStockParams(data);
      GetPrice(d)
        .then(({ data }) => {
          this.processPriceStock(data, 'price')
        })
        .catch(console.warn);
    },
    // 库存查询
    getStock(data) {
      const d = this.getPiceAndStockParams(data);
      GetStock(d)
        .then(({ data }) => {
          this.processPriceStock(data, 'stock')
        })
        .catch(console.warn);
    },
    handleSearch() {
      if (this.keywords.trim().split(/[\n\r]\s*/).length > 100) {
        this.$message.warning('最多可支持100个商品id搜索')
        return
      }
      this.formData.pageNum = 1;
      this.getList();
    },
    handleReset () {
      this.keywords = '';
      this.formData.categoryDepth = '';
      this.formData.catpath = '';
      this.formData.outerCategory = '';
      this.DDcatePath = [];
      this.catePath = [];
    },
    // 操作分页
    handleCurrentChange(page) {
      this.formData.pageNum = page;
      this.getList();
    },
    // 上架
    handleOnShelf(row) {
      GoodsOnShelf({
        partnerId: row.partnerId,
        productId: row.productId,
        outerCode: row.outerCode
      })
        .then(() => {
          this.$message.success('上架成功');
          this.getList();
        })
        .catch(console.warn);
    },
    // 下架
    handleOffShelf(row) {
      if (this.offShelfLock) {
        return this.$message.warning('操作处理中，请勿重复操作')
      }
      this.offShelfLock = true;
      GoodsOffShelf({
        partnerId: row.partnerId,
        productId: row.productId,
        outerCode: row.outerCode
      })
        .then(() => {
          this.$message.success('下架成功');
          this.getList();
        })
        .catch(console.warn)
        .finally(() => {
          this.offShelfLock = false
        });
    },
    // 删除
    handleRemoveProd(row) {
      if (this.delLock) {
        return this.$message.warning('操作处理中，请勿重复操作')
      }
      this.delLock = true;
      GoodsDel({
        primaryId: row.id
      })
       .then(() => {
          this.getList();
        })
        .catch(console.warn)
        .finally(() => {
          this.delLock = false;
        });
    },
    // 解绑
    handleUnBind(row) {
      if (this.delUnbind) return this.$message.warning('操作处理中，请勿重复操作')
      this.delUnbind = true;
      ProductUnbind({ id: row.id })
        .then(() => {
          this.$message.success('解绑成功');
          this.getList();
        })
        .catch(console.warn)
        .finally(() => {
          this.delUnbind = false
        });
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
      this.tempSelectOptions = 0;
    },
    // 批量删除
    handleBatchRemove() {
      this.$alert('已上架商品不支持删除', '提示', {
        type: 'info',
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        showCancelButton: true,
        callback: (action) => {
          if (action === 'confirm') {
            const selectOptions = this.selectOptions.map((item) => {
              if (item.saleStatus === 0 || item.saleStatus === 2) {
                return item
              } else if (item.saleStatus === 1) {
                this.$refs.multipleTable.toggleRowSelection(item, false);
              }
            });
            const filterOptions = selectOptions.filter(item => item !== undefined);
            this.count = filterOptions && filterOptions.length > 0 ? filterOptions.length : 0;
            if (filterOptions.length > 0) {
              const ids = filterOptions.map(item => item.id);
              const params = { primaryIds: ids };
              BatchDelete(params)
                .then(() => {
                  this.$message.success('批量删除成功');
                  this.count = 0;
                  this.batchOperateVisible = false;
                  this.handleSearch();
                })
                .catch(console.warn)
            } else {
              return false
            }
          }
        }
      })
    },
    // 更多
    handleMore() {
      this.moreOperateVisible = !this.moreOperateVisible;
    },
    // 批量导出
    handleExport() {
      this.exportVisible = true;
      this.queryParams = this.getQueryParams();
      this.selectedShopIds = this.selectOptions.map(item => item.id);
    }
  },
  created() {
    this.getShops();
    this.getDDCates();
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
    ::v-deep .el-textarea__inner{
      padding: 0px 15px;
      min-height: 41px !important;
    }
    .query-row {
      display: flex;
      align-items: flex-start;
    }
  }
  .goods-batch {
    flex: none;
  }
  ::v-deep .el-input__inner{
    height: 41px !important;
  }
}
.el-button.se-btn.el-button--default.el-button--small{
  border-top: 1px solid #c1c1c1;
  border-bottom: 1px solid #c1c1c1;
  background: white;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  position: relative;
  left: -4px;
  color: #c1c1c1;
  &:hover{
    color: #414141
  }
}
.more {
  position: relative;
  margin-left: 12px;
  .more-trigger {
    display: flex;
    justify-content: center;
    align-items: center;
    width:60px;
    height: 38px;
    border: 1px solid #c1c1c1;
    border-radius: 3px;
    box-sizing: border-box;
    background-color:white;
    cursor: pointer;
  }
  .more-operate {
    position: absolute;
    top: calc(100% + 15px);
    right: 0;
    padding: 10px;
    box-sizing: border-box;
    background: #FFFFFF;
    box-shadow: 0 0 10px 0 rgba(0,0,0,0.12);
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 100;
    .more-link{
      display: flex;
      justify-content: flex-start;
      align-items: center;
      line-height: 22px;
      padding: 5px 10px;
      border-radius: 4px;
      text-decoration: none;
      background-color: rgba(252,87,87,0.08);
      word-break: keep-all;
      font-size: 14px;
      color: #141414;
      letter-spacing: 0;
      cursor: pointer;
      &:hover {
        font-weight: bolder;
      }
    }
    .more-link + .more-link{
      margin-left: 10px;
    }
    &::before{
      content: "";
      position: absolute;
      right: 20px;
      top: -15px;
      width: 0px;
      height: 0px;
      border-top: 0px solid transparent;
      border-right: 10px solid transparent;
      border-left: 20px solid transparent;
      border-bottom: 15px solid rgba(0,0,0,.36);
    }
    &::after{
      content: "";
      position: absolute;
      right: 20px;
      top: -15px;
      width: 0px;
      height: 0px;
      border-top: 0px solid transparent;
      border-right: 10px solid transparent;
      border-left: 20px solid transparent;
      border-bottom: 15px solid #fff
    }
  }
}

.title {
  margin-right: 16px;
  word-break: keep-all;
  .title-name {
    font-size: 16px;
  }
  .title-id {
    margin-left: 12px;
    color: #999999;
  }
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
.shop-select {
  width: 170px;
  ::v-deep .el-input__inner {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
}
.cate-select{
  width: 115px;
  margin-left: -1px;
  ::v-deep .el-input__inner {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}
.outerSite {
  margin-left: -4px;
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
      color: #FC5757;
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
.outer_wrap{
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.searchShop {
  margin-top: -10px;
}
.searchLabel {
  width: 65px;
  text-align: right;
  margin-right: 8px;
  font-size: 14px;
  font-weight: bolder;
  color: #141414;
}
</style>
