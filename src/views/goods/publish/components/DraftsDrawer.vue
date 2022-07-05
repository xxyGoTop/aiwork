<template>
  <el-drawer
    title="草稿箱"
    :visible="visible"
    size="800px"
    @close="handleClose"
    class="eldrawer">
    <el-form :model="queryForm" ref="queryForm" inline label-width="82px">
      <el-form-item label="选择店铺">
        <el-select placeholder="选择店铺" v-model="queryForm.partnerId" @change="handleSearch" style="width:191.6px" class="shop-select">
          <el-option 
            v-for="(shop, index) in shops"
            :label="shop.partnerName"
            :value="shop.partnerId"
            :key="index">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="查询ID" prop="productId">
        <el-input v-model="queryForm.productId" clearable placeholder="请输入当当ID或外平台ID"></el-input>
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
          style="width:350px;"
          clearable>
        </el-date-picker>
      </el-form-item>
    </el-form>
    <el-row type="flex" justify="space-between" style="margin:16px 0">
      <div class="btn-left">
        <el-button type="primary" size="small" @click="handleSearch">筛选</el-button>
        <el-button type="info" size="small" @click="handleReset">清空筛选</el-button>
      </div>
      <el-row type="flex" justify="start">
        <el-button
          type="primary"
          size="small"
          @click="handleExport">
          导出
        </el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="!selection.length"
          @click="handlePublish('batch')">
          批量发布
        </el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="!selection.length"
          @click="handleRemove('batch')">
          批量删除
        </el-button>
      </el-row>
    </el-row>

    <!-- table -->
    <el-table
      ref="draftsTable"
      :data="listInfo"
      v-loading="loading"
      border
      style="width:100%;"
      row-key="id"
      @selection-change="handleSelectionChange">
      <el-table-column type="selection" :reserve-selection="true" align="center" width="50"></el-table-column>
      <el-table-column label="当当ID" prop="productId" align="center"></el-table-column>
      <el-table-column label="商品名称" prop="productName" align="center"></el-table-column>
      <el-table-column label="商品状态" prop="salseStatusStr" align="center"></el-table-column>
      <el-table-column label="创建时间" prop="creationDateStr" align="center"></el-table-column>
      <el-table-column label="修改时间" prop="lastChangedDateStr" align="center"></el-table-column>
      <el-table-column label="备注" prop="remark" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handlePublish('single', row)">重新发布</el-button>
          <el-button type="text" size="small" @click="handleRemove('single', row)">删除草稿</el-button>
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
  </el-drawer>
</template>

<script>
import {
  GetDraftsList,
  ExportDraftsList,
  BatchDraftsDel,
  BatchPub,
} from '@/api/goods/publish';

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    pickShop: [String, Number],
    shops: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      queryForm: {
        partnerId: '',
        productId: '',
        creationDateBegin: '',
        creationDateEnd: '',
        pageSize: 10,
        pageNum: 1,
      },
      creationDate: [],
      listInfo: [],
      total: 0,
      loading: false,
      selection: [],
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.queryForm.partnerId = +this.pickShop;
        this.handleSearch();
      }
    }
  },
  methods: {
    // 关闭
    handleClose() {
      this.$emit('update:visible', false);
      this.handleReset();
      this.$refs.draftsTable && this.$refs.draftsTable.clearSelection();
    },
    // 选择
    handleSelectionChange(selection) {
      this.selection = selection;
    },
    // 查询
    getList() {
      if (this.loading) return
      this.loading = true;
      this.creationDate = this.creationDate || [];
      const queryParams = {
        ...this.queryForm,
        creationDateBegin: this.creationDate[0],
        creationDateEnd: this.creationDate[1]
      };
      const params = Object.create(null);
      for (const [key, value] of Object.entries(queryParams)) {
        if (value) {
          params[key] = value;
        }
      }
      GetDraftsList(params)
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
    },
    // 发布
    handlePublish(ty, row) {
      const data = {
        partnerId: this.queryForm.partnerId,
      };
      if (ty === 'batch') {
        data.ids = this.selection.map(i => i.id);
      } else {
        data.ids = [row.id];
      }
      BatchPub(data)
        .then(() => {
          this.$message.success('创建发布任务成功');
          this.$refs.draftsTable.clearSelection();
          this.getList();
        })
        .catch(console.warn);
    },
    // 删除
    handleRemove(ty, row) {
      const data = Object.create(null);
      if (ty === 'batch') {
        data.partnerId = this.queryForm.partnerId;
        data.ids = this.selection.map(i => i.id);
      } else {
        data.partnerId = row.partnerId;
        data.ids = [row.id]
      }
      BatchDraftsDel(data)
        .then(() => {
          this.$message.success('删除成功');
          this.$refs.draftsTable.clearSelection();
          this.getList();
        })
        .catch(console.warn)
    },
    // 导出
    handleExport() {
      const data = {
        partnerId: this.queryForm.partnerId,
        taskType: 120,
        queryCondition: JSON.stringify({
          productId: this.queryForm.productId,
          creationDateBegin: this.creationDate[0] || '',
          creationDateEnd: this.creationDate[1] || '',
          selectedIds: this.selection.map(i => i.id).join(',')
        })
      }
      ExportDraftsList(data)
        .then(() => {
          this.$message.success('导出任务已生成，请前往下载中心查看');
        })
        .catch(console.warn)
    },
  }
}
</script>

<style lang="scss" scoped>
.eldrawer::v-deep .el-drawer__body{
  padding: 16px;
  box-sizing: border-box;
}
</style>