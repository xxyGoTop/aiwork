<template>
  <div class="page">
    <el-form :model="queryForm" ref="queryForm" inline label-width="82px" style="margin-bottom: 16px">
      <el-form-item label="选择店铺">
        <el-select placeholder="选择店铺" v-model="queryForm.partnerId" size="small" style="width:191.6px" class="shop-select">
          <el-option 
            v-for="(shop, index) in shops"
            :label="shop.partnerName"
            :value="shop.partnerId"
            :key="index">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="创建人" prop="operator">
        <el-input type="text" v-model="queryForm.operator" placeholder="请输入任务创建人" size="small" style="width:191.6px"></el-input>
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
          style="width:350px;">
        </el-date-picker>
      </el-form-item>
      <el-row type="flex" justify="start">
        <el-form-item label="商品ID" prop="productIds">
          <el-input
            v-model="queryForm.productIds"
            placeholder="请输入当当ID或外平台ID，多个用英文逗号分隔，最多支持100品查询"
            type="textarea"
            :rows="5"
            style="width: 350px">
          </el-input>
        </el-form-item>
      </el-row>
    </el-form>
    <el-row type="flex" justify="start">
      <el-button type="primary" size="small" @click="handleSearch">筛选</el-button>
      <el-button type="info" size="small" @click="handleReset">清空筛选</el-button>
    </el-row>
    <!-- table -->
    <el-table :data="listInfo" v-loading="loading" border style="width:100%;margin-top:15px">
      <el-table-column label="当当ID" prop="productId" align="center"></el-table-column>
      <el-table-column label="外平台ID" prop="outerCode" align="center"></el-table-column>
      <el-table-column label="任务编号" prop="taskId" align="center"></el-table-column>
      <el-table-column label="改前价格" prop="priceBefore" align="center"></el-table-column>
      <el-table-column label="改后价格" prop="priceAfter" align="center"></el-table-column>
      <el-table-column label="商品状态" prop="productStatus" align="center"></el-table-column>
      <el-table-column label="开始时间" prop="startTime" align="center"></el-table-column>
      <el-table-column label="结束时间" prop="endTime" align="center"></el-table-column>
      <el-table-column label="创建人" prop="operator" align="center"></el-table-column>
      <el-table-column label="创建时间" prop="creationDate" align="center"></el-table-column>
      <el-table-column label="备注" prop="remark" align="center"></el-table-column>
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
        :current-page.sync="queryForm.pageIndex"
        @current-change="getList">
      </el-pagination>
    </el-row>
  </div>
</template>

<script>
import {
  GoodsShops,
} from '@/api/goods/list';
import {
  UpdatePriceList,
} from '@/api/goods/price';
import { format } from 'date-fns';
import { hasValue } from '@/util';

export default {
  data() {
    return {
      queryForm: {
        partnerId: '',
        creationDateStart: '',
        creationDateEnd: '',
        pageSize: 10,
        pageIndex: 1,
        operator: '',
        productIds: '',
      },
      creationDate: [],
      // 任务状态
      statusList: [
        { status: '', name: '不限' },
        { status: 0, name: '初始化' },
        { status: 1, name: '处理中' },
        { status: 2, name: '解析进行中' },
        { status: 3, name: '待处理' },
        { status: 10, name: '部分成功' },
        { status: 11, name: '全部成功' },
        { status: 12, name: '解析完成' },
        { status: 20, name: '部分失败' },
        { status: 21, name: '全部失败' },
        { status: 22, name: '解析失败' },
        { status: 30, name: '系统异常' },
        { status: 25, name: '已过期' },
        //商品改价任务才会使用
        { status: 40, name: '恢复中' },
      ],
      shops: [],
      total: 0,
      listInfo: [],
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
    getShops() {
      GoodsShops()
        .then(({ data }) => {
          if (data?.length) {
            this.shops = data.filter(item => (item.groupType === 1 || item.groupType === 2 || item.groupType === 3));
            const matchPartner = this.shops.find(item => item.partnerId === this.$store.state.partnerId);
            this.queryForm.partnerId = matchPartner ? matchPartner.partnerId : this.shops[0].partnerId;
            this.getList();
          } else {
            this.shops = [];
          }
        })
        .catch(console.warn);
    },
    // 查询
    getList() {
      if (this.queryForm.productIds) {
        if (!/^[\d,]*$/.test(this.queryForm.productIds)) {
          return this.$message.warning('输入id格式错误，多个用英文逗号分隔')
        }
        const ids = this.queryForm.productIds.split(',').filter(i => i);
        if (ids.length > 100) return this.$message.warning('最多支持100品查询')
      }
      if (this.loading) return
      this.loading = true;
      this.creationDate = this.creationDate || [];
      const queryParams = {
        ...this.queryForm,
        creationDateStart: this.creationDate[0],
        creationDateEnd: this.creationDate[1]
      };
      const params = Object.create(null);
      for (const [key, value] of Object.entries(queryParams)) {
        if (hasValue(value)) {
          params[key] = value;
        }
      }
      UpdatePriceList(params)
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
      this.creationDate = [];
    },
  },
  created() {
    this.getShops();
  },
}
</script>
