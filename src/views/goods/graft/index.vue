<template>
  <div class="page">
    <el-form :model="queryForm" ref="queryForm" inline label-width="82px">
      <el-row type="flex" justify="start" style="margin-bottom:15px">
        <el-col :span="8">
          <el-form-item label="选择店铺">
            <el-select placeholder="选择店铺" v-model="queryForm.partnerId" @change="handleSearch" style="width:191.6px">
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
          <el-form-item label="商品编码" prop="productId">
            <el-input v-model="queryForm.productId" placeholder="请输入商品编码" style="width:191.6px"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="创建人" prop="operator">
            <el-input v-model="queryForm.operator" placeholder="请输入创建人" style="width:191.6px"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row type="flex" justify="start" align="middle" style="margin-bottom:16px">
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
    <el-row type="flex" justify="space-between">
      <div class="btn-left">
        <el-button type="primary" size="small" @click="handleSearch">筛选</el-button>
        <el-button type="info" size="small" @click="handleReset">清空筛选</el-button>
      </div>
      <el-button type="primary" size="small" @click="handleGraft('add')">新增商品嫁接</el-button>
    </el-row>
    <!-- table -->
    <el-table :data="graftlist" v-loading="loading" border style="width:100%;margin-top:15px">
      <el-table-column label="当当ID" prop="productId" align="center"></el-table-column>
      <el-table-column label="原始当当ID" prop="graftProductId" align="center"></el-table-column>
      <el-table-column label="外平台SPUID" prop="outerSpuId" align="center" width="120"></el-table-column>
      <el-table-column label="外平台SKUID" prop="outerSkuId" align="center" width="120"></el-table-column>
      <el-table-column label="嫁接状态" align="center" min-width="100">
        <template #default="{ row }">
          <span>{{ statusMap[row.pushStatus] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" prop="operator" align="center"></el-table-column>
      <el-table-column label="创建时间" prop="createDate" align="center"></el-table-column>
      <el-table-column label="更新时间" prop="lastUpdateDate" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handleGraft('edit', row)">更改嫁接</el-button>
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
        :page-size="queryForm.pageSize"
        :current-page.sync="queryForm.pageNum"
        @current-change="getList">
      </el-pagination>
    </el-row>
    <!-- 嫁接编辑 -->
    <GraftEdit
      :visible.sync="visible"
      :shopId="+queryForm.partnerId"
      :shops="shops"
      :ty="graftType"
      :payload="graftRow"
      @refresh="handleSearch">
    </GraftEdit>
  </div>
</template>

<script>
import {
  GoodsShops,
} from '@/api/goods/list';
import {
  GetGraftList,
} from '@/api/goods/graft';
import GraftEdit from './components/GraftEdit';
import { format } from 'date-fns';

export default {
  components: {
    GraftEdit
  },
  data() {
    return {
      visible: false,
      graftType: 'add',
      graftRow: {},
      queryForm: {
        partnerId: '',
        productId: '',
        creationDateBegin: '',
        creationDateEnd: '',
        pageSize: 10,
        pageNum: 1,
        operator: '',
      },
      creationDate: [],
      statusMap: {
        51: '嫁接中',
        1: '嫁接成功',
        '-51': '嫁接失败'
      },
      shops: [],
      total: 0,
      graftlist: [],
      loading: false,
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
    // 获取店铺
    getShops() {
      GoodsShops()
        .then(({ data }) => {
          this.shops = data.filter(item => (item.groupType === 2 || item.groupType === 3 || item.groupType === 4));
          const matchPartner = this.shops.find(item => item.partnerId === this.$store.state.partnerId);
          this.queryForm.partnerId = matchPartner ? matchPartner.partnerId : this.shops[0].partnerId;
          this.getList();
        })
        .catch(console.warn);
    },
    // 查询
    getList() {
      if (this.loading) return
      this.loading = true;
      this.creationDate = this.creationDate || [];
      const params = {
        ...this.queryForm,
        creationDateBegin: this.creationDate[0],
        creationDateEnd: this.creationDate[1]
      };
      GetGraftList(params)
        .then(({ data, total }) => {
          this.graftlist = data || [];
          this.total = total || 0;
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
      this.queryForm.partnerId = this.shops[0].partnerId;
    },
    // 新增、编辑
    handleGraft(ty, row) {
      this.visible = true;
      this.graftType = ty;
      if (ty === 'edit') {
        this.graftRow = {
          productId: row.productId,
          outerDangProductId: row.outerDangProductId,
          outerSpuId: row.outerSpuId,
          outerSkuId: row.outerSkuId,
          productName: row.productName,
          oldGraftProductId: row.graftProductId
        }
      }
    }
  },
  created() {
    this.getShops();
  },
}
</script>
