<template>
  <div class="page">
    <el-row type="flex" justify="end" style="margin-bottom:16px">
      <el-button
        type="primary"
        @click="handleOpenDrafts">
        <Icon name="drafts" style="height: 16px;vertical-align: text-top;"></Icon>草稿箱
      </el-button>
    </el-row>
    <el-form :model="queryForm" ref="queryForm" inline label-width="82px">
      <el-row type="flex" justify="start" style="margin-bottom:15px">
        <el-col :span="8">
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
        </el-col>
        <el-col :span="8">
          <el-form-item label="任务编码" prop="taskNum">
            <el-input v-model="queryForm.taskNum" placeholder="请输入任务编码" type="text" size="small" style="width:191.6px"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="创建人" prop="operator">
            <el-input type="text" v-model="queryForm.operator" placeholder="请输入任务创建人" size="small" style="width:191.6px"></el-input>
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
      <el-row type="flex" justify="start">
        <el-button type="primary" size="small" @click="handleAddGoods(1021)">新增商品发布</el-button>
        <el-button type="primary" size="small" @click="handleAddGoods(1022)" v-if="groupType !== -2">重复商品发布</el-button>
        <el-button
          type="primary"
          size="small"
          @click="handleAddGoods(1023)"
          v-if="groupType === 2 || groupType === 3">
          SPU发布
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="handleAddSKU(1024)"
          v-if="groupType === 2 || groupType === 3">
          添加SKU
        </el-button>
      </el-row>
    </el-row>

    <!-- table -->
    <el-table :data="listInfo" v-loading="loading" border style="width:100%;margin-top:15px">
      <el-table-column label="任务编号" prop="taskNum" align="center">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handlePublishResult(row)" style="color: #0061D9;">{{ row.taskNum }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="发布商品数" prop="taskCount" align="center"></el-table-column>
      <el-table-column label="任务状态" prop="status" align="center" min-width="100">
        <template #header>
          <DropdownSelect
            label="任务状态"
            :options="statusList"
            labelKey="name"
            valueKey="status"
            :topOffset="19"
            v-model="queryForm.status"
            @select="handleSearch">
          </DropdownSelect>
        </template>
        <template #default="{ row }">
          <span>{{ row.status }}</span>
          <el-tooltip effect="dark" :content="row.remark" placement="top" v-if="row.subTaskType == 1024 && row.remark">
            <i class="el-icon-question"></i>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="上架成功商品数" prop="successTaskCount" align="center"></el-table-column>
      <el-table-column label="创建人" prop="creator" align="center"></el-table-column>
      <el-table-column label="创建时间" prop="createDate" align="center" sortable min-width="120">
        <template #default="{ row }">
          {{ row.createDate ? formatDate(new Date(row.createDate)) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handlePublishResult(row)">查看发布结果</el-button>
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
        :current-page="queryForm.page"
        @current-change="handleCurrentChange">
      </el-pagination>
    </el-row>
    <!-- 发布浮层 -->
    <BatchDrawer
      :visible.sync="visible"
      :shops="pubShops"
      :pickShop="queryForm.partnerId"
      :sub-type="taskSubType"
      @success="handleSearch">
    </BatchDrawer>
    <!-- 发布详情 -->
    <DetailDrawer
      :visible.sync="detailVisible"
      :info="detailInfo"
      :groupType="groupType">
    </DetailDrawer>
    <!-- 草稿箱 -->
    <DraftsDrawer
      :visible.sync="visibleDrafts"
      :shops="shops"
      :pickShop="queryForm.partnerId"
      @success="handleSearch">
    </DraftsDrawer>
    <!-- 添加sku -->
    <SKUBatchDrawer
      :visible.sync="visibleSKU"
      :shops="SKUShops"
      :pickShop="queryForm.partnerId"
      @success="handleSearch">
    </SKUBatchDrawer>
    <!-- sku详情 -->
    <SKUDetailDrawer
      :visible.sync="detailVisibleSKU"
      :info="detailInfo"
      :groupType="groupType">
    </SKUDetailDrawer>
  </div>
</template>

<script>
import {
  GoodsShops,
} from '@/api/goods/list';
import {
  QueryTaskList,
  TaskStatusList,
} from '@/api/goods/task';
import BatchDrawer from './components/BatchDrawer';
import DetailDrawer from './components/DetailDrawer';
import DraftsDrawer from './components/DraftsDrawer';
import { format } from 'date-fns';
import SKUBatchDrawer from './components/SKUBatchDrawer.vue';
import SKUDetailDrawer from './components/SKUDetailDrawer.vue';

/*子任务类型
  1021：非重复品，1022：重复品，1023：spu发布，1024：sku发布
*/

export default {
  components: {
    BatchDrawer,
    DetailDrawer,
    DraftsDrawer,
    SKUBatchDrawer,
    SKUDetailDrawer
},
  data() {
    return {
      visibleDrafts: false,
      visible: false,
      detailVisible: false,
      visibleSKU: false,
      detailVisibleSKU: false,
      detailInfo: {},
      queryForm: {
        partnerId: '',
        taskNum: '',
        createDateBegin: '',
        createDateEnd: '',
        pageSize: 10,
        page: 1,
        operator: '',
        status: '',
        taskType: 102
      },
      creationDate: [],
      shops: [],
      statusList: [],
      createPerson: [],
      total: 0,
      listInfo: [],
      loading: false,
      taskSubType: 1021,
      // 限制店铺
      pubShops: [],
      SKUShops: [],
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
    // 草稿箱
    handleOpenDrafts() {
      this.visibleDrafts = true;
    },
    formatDate(date) {
      return format(date, 'yyyy-MM-dd HH:mm:ss')
    },
    getShops() {
      GoodsShops()
        .then(({ data }) => {
          this.shops = data || [];
          this.shops.push({
            groupType: -2,
            partnerId: -2,
            partnerName: '拼多多_全平台'
          })
          this.queryForm.partnerId = this.$store.state.partnerId ? this.$store.state.partnerId : this.shops[0].partnerId;
          this.getList();
        })
        .catch(console.warn);
    },
    // 任务状态
    getTaskStatus() {
      TaskStatusList({ taskType: 102 })
        .then(({ data }) => {
          this.statusList = [
            { status: '', name: '不限' },
            ...data,
          ];
        })
        .catch(console.warn)
    },
    // 查询
    getList() {
      if (this.loading) return
      this.loading = true;
      this.creationDate = this.creationDate || [];
      const queryParams = {
        ...this.queryForm,
        createDateBegin: this.creationDate[0],
        createDateEnd: this.creationDate[1]
      };
      const params = Object.create(null);
      for (const [key, value] of Object.entries(queryParams)) {
        if (value) {
          params[key] = value;
        }
      }
      QueryTaskList(params)
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
      this.queryForm.page = 1;
      this.getList()
    },
    handleReset() {
      this.$refs.queryForm.resetFields();
      this.creationDate = [];
    },
    // spu发布
    handleAddGoods(taskType) {
      this.visible = true;
      this.taskSubType = taskType;
      if (taskType === 1023) {
        this.pubShops = this.shops.filter(item => (item.groupType === 2 || item.groupType === 3));
      } else {
        this.pubShops = this.shops;
      }
    },
    // 添加sku
    handleAddSKU() {
      this.visibleSKU = true;
      this.SKUShops = this.shops.filter(item => (item.groupType === 2 || item.groupType === 3));
    },
    handleCurrentChange(page) {
      this.queryForm.page = page;
      this.getList();
    },
    // 查看发布结果
    handlePublishResult(row) {
      let curStatus = '';
      this.statusList.map(item => {
        if (item.name === row.status) {
          curStatus = item.status
        }
      })
      this.detailInfo = Object.assign(row, { partnerId: this.queryForm.partnerId, state: curStatus });
      if (+row.subTaskType === 1024) {
        this.detailVisibleSKU = true;
      } else {
        this.detailVisible = true;
      }
    },
  },
  created() {
    this.getShops();
    this.getTaskStatus();
  },
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
.shop-select {
  width: 195px;
  margin-right: 15px;
}
</style>

