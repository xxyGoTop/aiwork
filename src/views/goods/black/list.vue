<template>
  <div class="page">
    <el-form
      :model="queryForm"
      ref="queryForm"
      inline
      label-width="84px"
      class="form-grid"
      label-position="left">
      <el-form-item label="选择店铺">
        <el-select placeholder="选择店铺" v-model="queryForm.partnerId" size="small">
          <el-option 
            v-for="(shop, index) in shops"
            :label="shop.partnerName"
            :value="shop.partnerId"
            :key="index">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="商品ID" prop="productId">
        <el-input type="text" v-model="queryForm.productId" placeholder="当当ID或外平台ID" size="small"></el-input>
      </el-form-item>
      <el-form-item label="创建人" prop="creator">
        <el-input type="text" v-model="queryForm.creator" placeholder="请输入任务创建人" size="small"></el-input>
      </el-form-item>
      <el-form-item label="任务状态" prop="status">
        <el-select v-model="queryForm.productBlackStatus" size="small">
          <el-option 
            v-for="(status, ky) in statusList"
            :label="status"
            :value="ky"
            :key="ky">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="creationDate">
        <el-date-picker
          v-model="creationDate"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
          value-format="yyyy-MM-dd HH:mm:ss"
          style="width:220px">
        </el-date-picker>
      </el-form-item>
    </el-form>
    <el-row type="flex" justify="space-between">
      <div class="btn-left">
        <el-button type="primary" size="small" @click="handleSearch">筛选</el-button>
        <el-button type="info" size="small" @click="handleReset">清空筛选</el-button>
      </div>
    </el-row>
    <!-- table -->
    <el-table :data="listInfo" v-loading="loading" border style="width:100%;margin-top:15px">
      <el-table-column label="当当ID" prop="productId" align="center"></el-table-column>
      <el-table-column label="外平台ID" prop="outerCode" align="center"></el-table-column>
      <el-table-column label="类型" align="center">
        <template #header>
          <DropdownSelect
            label="类型"
            :options="blackTypeList"
            :topOffset="19"
            v-model="queryForm.blackModel"
            @select="handleSearch">
          </DropdownSelect>
        </template>
        <template #default="{ row }">
          <span>{{ blackType[row.blackType] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品状态" prop="productBlackStatus" align="center" min-width="100">
        <template #default="{ row }">
          <span>{{ statusList[row.productBlackStatus] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="黑名单时间段" align="center" min-width="150">
        <template #default="{ row }">
          {{ row.blackBeginDate && row.blackEndDate ? formatDate(new Date(row.blackBeginDate)) + ' ~ ' + formatDate(new Date(row.blackEndDate)) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="创建人" prop="creator" align="center"></el-table-column>
      <el-table-column label="创建时间" align="center" min-width="120">
        <template #default="{ row }">
          {{ row.creatTime ? formatDate(new Date(row.creatTime)) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handleRemoveBlack(row)">移除黑名单</el-button>
          <el-button type="text" size="small" @click="handleEditBlack(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- pagination -->
    <el-row type="flex" justify="end" style="margin:20px 0">
      <el-pagination
        background
        hide-on-single-page
        layout="total,prev,pager,next"
        :total="total"
        :page-sizes="[10]"
        :page-size="queryForm.pageSize"
        :current-page.sync="queryForm.pageNum"
        @current-change="getList">
      </el-pagination>
    </el-row>
    <!-- 新增、编辑黑名单 -->
    <black-drawer :visible.sync="visible" :isAdd="isAdd" :pickShop="currentShop" :shops="shops" :payload="payload" @success="getList"></black-drawer>
  </div>
</template>

<script>
import {
  GoodsShops,
} from '@/api/goods/list';
import {
  QueryProductList,
  DeleteProduct,
} from '@/api/goods/black';
import { format } from 'date-fns';
import BlackDrawer from './components/BlackDrawer.vue';

export default {
  components: { BlackDrawer },
  data() {
    return {
      visible: false,
      payload: {},
      queryForm: {
        partnerId: '',
        productId: '',
        blackDateBegin: '',
        blackDateEnd: '',
        pageSize: 10,
        pageNum: 1,
        creator: '',
        productBlackStatus: '1',
        blackModel: ''
      },
      creationDate: [],
      statusList: {
        0: '未开始',
        1: '生效中',
      },
      shops: [],
      total: 0,
      listInfo: [],
      loading: false,
      currentShop: '',
      isAdd: true,
      // 黑名单类型
      blackType: {
        1081: '商品黑名单',
        1082: '上架黑名单',
        1083: '库存黑名单',
        1084: '价格同步黑名单',
        1087: '改价黑名单',
        1086: '上架黑名单',
      },
      blackTypeList: [
        { label: '不限', value: '' },
        { label: '商品黑名单', value: 1081 },
        { label: '上架黑名单', value: '1082,1086' },
        { label: '库存黑名单', value: 1083 },
        { label: '价格同步黑名单', value: 1084 },
        { label: '改价黑名单', value: 1087 },
      ]
    }
  },
  beforeRouteLeave(_, from , next) {
    this.$store.commit('setPartnerId', this.queryForm.partnerId || '');
    next()
  },
  computed: {
    groupType() {
      const findedShop = this.shops.find(shop => shop.partnerId === this.queryForm.partnerId);
      return findedShop ? findedShop.groupType : '';
    },
  },
  methods: {
    formatDate(date) {
      return format(date, 'yyyy-MM-dd HH:mm:ss')
    },
    getShops() {
      GoodsShops()
        .then(({ data }) => {
          this.shops = data || [];
          this.queryForm.partnerId = this.$store.state.partnerId ? this.$store.state.partnerId : this.shops[0].partnerId;
          if (this.queryForm.partnerId === -2) this.queryForm.partnerId = this.shops[0].partnerId
          data.length && this.getList();
        })
        .catch(console.warn);
    },
    // 查询
    getList() {
      if (this.loading) return
      this.loading = true;
      this.creationDate = this.creationDate || [];
      const queryParams = {
        ...this.queryForm,
        blackDateBegin: this.creationDate[0],
        blackDateEnd: this.creationDate[1],
      };
      const params = Object.create(null);
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== '' && value !== undefined) params[key] = value;
      }
      QueryProductList(params)
        .then(({ data, total }) => {
          this.listInfo = data;
          this.total = total;
        })
        .catch(console.warn)
        .finally(() => {
          this.loading = false;
        })
    },
    handleSearch() {
      this.queryForm.pageNum = 1;
      this.getList()
    },
    handleReset() {
      this.$refs.queryForm.resetFields();
      this.creationDate = [];
      this.queryForm.blackModel = '';
    },
    // 移除
    handleRemoveBlack(row) {
      const params = {
        partnerId: this.queryForm.partnerId,
        productId: row.productId,
        blackType: row.blackType
      };
      DeleteProduct(params)
        .then(() => {
          this.$message.success('移除成功');
          this.getList()
        })
        .catch(console.warn)
    },
    // 编辑
    handleEditBlack(row) {
      this.payload = Object.assign(
        {},
        row
      );
      this.visible = true;
      this.isAdd = false;
    },
    // 新增黑名单
    handleAddBlack() {
      this.visible = true;
      this.isAdd = true;
      if (this.queryForm.partnerId) {
        this.currentShop = `${this.queryForm.partnerId}`;
      }
    },
  },
   created() {
    this.getShops();
  },
}
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px 0px;
}
</style>
