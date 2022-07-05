<template>
<div class="page">
  <el-form inline>
    <el-form-item label="选择店铺">
      <el-select placeholder="选择店铺" v-model="queryForm.partnerId">
        <el-option 
          v-for="(partner, index) in partners"
          :label="partner.partnerName"
          :value="partner.partnerId"
          :key="index">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="店铺ID">
      <el-input v-model="queryForm.shopId"></el-input>
    </el-form-item>
    <el-form-item label="店铺名称">
      <el-input v-model="queryForm.shopName"></el-input>
    </el-form-item>
    <el-button type="primary" @click="getList(1)">查询</el-button>
    <el-button type="info" @click="handleReset">重置</el-button>
  </el-form>
  <el-table :data="tableData">
    <el-table-column label="店铺ID" prop="shopId"></el-table-column>
    <el-table-column label="店铺名称" prop="shopName"></el-table-column>
    <el-table-column label="库存同步比例" prop="stockRate"></el-table-column>
    <el-table-column label="操作">
      <template #default="{ row }">
        <div class="button-ctrl" @click="handleShowEdit(row)">编辑</div>
      </template>
    </el-table-column>
  </el-table>
  <el-row type="flex" justify="end" style="margin-top: 16px">
    <el-pagination
      @size-change="() => getList"
      @current-change="getList"
      :current-page.sync="queryForm.pageNum"
      :page-size.sync="queryForm.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
  </el-row>

  <el-dialog :visible.sync="visible" title="库存比例修改" @close="hansleClose">
    <el-form :model="editForm" :rules="rules" ref="editForm">
      <el-form-item label="店铺名称">
        <el-input :value="currShopName" disabled></el-input>
      </el-form-item>
      <el-form-item label="库存比例" prop="stockRate">
        <el-input v-model.number="editForm.stockRate" autocomplete="off">
          <template #suffix><span style="line-height: 38px">%</span></template>
        </el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleModify">确定</el-button>
    </template>
  </el-dialog>
</div>
</template>

<script>
import {
  // StockPartners,
  queryStockRate,
  updateStockRate,
} from '@/api/stock';
import {
  GoodsShops,
} from '@/api/goods/list';
import {
  hasValue,
} from '@/util';

export default {
  data() {
    return {
      partners: [],
      queryForm: {
        partnerId: '',
        shopId: '',
        shopName: '',
        pageNum: 1,
        pageSize: 20,
      },
      visible: false,
      currShopName: '',
      editForm: {
        partnerId: '',
        shopId: '',
        stockRate: '',
      },
      rules: {
        stockRate: [
          { required: true, message: '请输入库存比例', trigger: 'blur' },
          { type: 'integer', message: '库存比例必须为整数'},
          { type: 'integer', min: 5, max: 90, message: '库存比例数值必须大于5小于90' },
        ],
      },
      total: 0,
      tableData: [],
    };
  },
  beforeRouteLeave(_, from , next) {
    this.$store.commit('setPartnerId', this.queryForm.partnerId || '');
    next()
  },
  methods: {
    getPartners() {
      GoodsShops()
        .then(({ data }) => {
          this.partners = data || [];
          if (this.partners.length) {
            this.queryForm.partnerId = this.$store.state.partnerId ? this.$store.state.partnerId : this.partners[0].partnerId;
            this.getList();
          }
        })
        .catch(console.warn);
    },
    getList(page) {
      if (page) {
        this.queryForm.pageNum = page;
      }
      const params = {};
      for (const [key, value] of Object.entries(this.queryForm)) {
        if (hasValue(value)) params[key] = value;
      }
      queryStockRate(params)
        .then(({ data, total }) => {
          this.total = total;
          this.tableData = data || [];
        })
        .catch(console.warn);
    },
    handleReset() {
      Object.assign(this.queryForm, {
        shopId: '',
        shopName: '',
        pageNum: '',
        pageSize: '',
      });
    },
    handleShowEdit(row) {
      this.currShopName = row.shopName;
      this.editForm = {
        partnerId: this.queryForm.partnerId,
        shopId: row.shopId,
        stockRate: Number.parseFloat(row.stockRate.trim()),
      };
      this.visible = true;
    },
    hansleClose() {
      this.currShopName = '';
      this.editForm = {
        partnerId: '',
        shopId: '',
        stockRate: '',
      }
    },
    handleModify() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          updateStockRate(this.editForm)
            .then(() => {
              this.$message.success('更新成功，10分钟后生效');
              this.visible = false;
              this.getList();
            })
            .catch(console.warn);
        }
      });
    },
  },
  created() {
    this.getPartners();
  },
}
</script>
