<template>
  <div class="page">
    <el-form :model="queryForm" ref="queryForm" inline label-width="82px">
      <el-form-item label="选择店铺">
        <el-select placeholder="选择店铺" v-model="queryForm.partnerId">
          <el-option 
            v-for="(shop, index) in shops"
            :label="shop.partnerName"
            :value="shop.partnerId"
            :key="index">
          </el-option>
        </el-select>
      </el-form-item>
      <el-row type="flex" align="middle" style="margin-bottom:16px">
        <el-form-item label="查询ID" prop="productIds">
          <el-input
            v-model="queryForm.productIds"
            placeholder="请输入当当ID或外平台ID，多个请用“换行”隔开，最多支持100品查询"
            type="textarea"
            :rows="5"
            size="small"
            style="min-width:400px">
          </el-input>
        </el-form-item>
      </el-row>
    </el-form>
    <el-row type="flex" justify="space-between">
      <div class="btn-left">
        <el-button type="primary" @click="handleSearch">筛选</el-button>
        <el-button type="info" @click="handleReset">清空筛选</el-button>
      </div>
      <el-button type="primary" @click="handleUpdateInfo('batch')" :disabled="selection.length === 0">批量修改</el-button>
    </el-row>

    <el-table :data="listInfo" v-loading="loading" border style="margin-top:15px" @selection-change="s => selection = s">
      <el-table-column type="selection" align="center" width="50"></el-table-column>
      <el-table-column label="商品ID" prop="productId" align="center"></el-table-column>
      <el-table-column label="外平台ID" prop="outerCode" align="center"></el-table-column>
      <el-table-column label="商品名称" prop="productName" align="center">
        <template #default="{ row }">
          <span :title="row.productName">
            {{ row.productName && row.productName.length > 10 ? `${row.productName.slice(0, 10)}...` : row.productName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="产品挂靠ID" prop="tmProductId" align="center"></el-table-column>
      <el-table-column label="产品类目" prop="outerCategoryName" align="center"></el-table-column>
      <el-table-column label="更新人" prop="cateChanger" align="center"></el-table-column>
      <el-table-column label="最后更新时间" align="center" min-width="120">
        <template #default="{ row }">
          {{ row.cateChangeDate ? formatDate(new Date(row.cateChangeDate)) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handleUpdateInfo('single', row)">修改产品信息</el-button>
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
        :current-page="queryForm.pageIndex"
        @current-change="handleCurrentChange">
      </el-pagination>
    </el-row>
    <!-- 修改信息 -->
    <UpdateCate
      :visible.sync="visible"
      :shops="shops"
      :ty="updateType"
      :payload="editPayload"
      @success="handleSearch">
    </UpdateCate>
  </div>
</template>

<script>
import {
  GoodsShops,
} from '@/api/goods/list';
import {
  GetCateList,
} from '@/api/goods/category';
import UpdateCate from './components/UpdateCate';
import {
  isValid,
} from '@/util';
import { format } from 'date-fns';

export default {
  components: {
    UpdateCate,
  },
  data() {
    return {
      visible: false,
      editPayload: {},
      queryForm: {
        partnerId: '',
        productIds: '',
        pageSize: 15,
        pageIndex: 1,
      },
      shops: [],
      total: 0,
      listInfo: [],
      loading: false,
      updateType: 'single',
      selection: [],
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
          if (data?.length) {
            this.shops = data.filter(item => item.groupType === 1);
            const matchPartner = this.shops.find(item => item.partnerId === this.$store.state.partnerId);
            this.queryForm.partnerId = matchPartner ? matchPartner.partnerId : this.shops[0].partnerId;
          } else {
            this.shops = [];
          }
        })
        .catch(console.warn);
    },
    // 查询
    getList() {
      if (!this.queryForm.productIds) return
      if (!/^[\d\n\r\s]*$/.test(this.queryForm.productIds)) {
        return this.$message.warning('多个ID之间请换行隔开')
      }
      const productIds = this.queryForm.productIds.split(/[\n\r]/).filter(i => i);
      if (productIds.length > 100) {
        return this.$message.warning('最多支持100个ID查询')
      }
      if (this.loading) return
      this.loading = true;
      const params = Object.create(null);
      for (const [key, value] of Object.entries(this.queryForm)) {
        if (isValid(value)) params[key] = value;
      }
      params.productIds = this.queryForm.productIds.split(/[\n\r]/).join(',');
      GetCateList(params)
        .then(({ data, total }) => {
          this.listInfo = data || [];
          this.total = total || 0;
        })
        .catch(console.warn)
        .finally(() => {
          this.loading = false;
        })
    },
    handleSearch() {
      this.queryForm.pageIndex = 1;
      this.getList()
    },
    handleReset() {
      this.$refs.queryForm.resetFields();
    },
    handleCurrentChange(page) {
      this.queryForm.pageIndex = page;
      this.getList()
    },
    // 信息修改
    handleUpdateInfo(ty, row) {
      this.visible = true;
      this.updateType = ty;
      this.editPayload = {
        productIds: ty === 'single' ? [row].map(i => i.tmProductId).join(',') : this.selection.map(i => i.tmProductId).join(','),
        partnerId: this.queryForm.partnerId,
        productInfo: ty === 'single' ? [row] : this.selection
      }
    },
  },
   created() {
    this.getShops();
  },
}
</script>
