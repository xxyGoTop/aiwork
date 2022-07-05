<template>
  <div class="page">
    <el-row type="flex" justify="end" align="center" style="margin-bottom:20px">
      <el-button type="primary" @click="handleAddWords">新增敏感词</el-button>
      <el-button type="primary" @click="handleDelWords">删除敏感词</el-button>
    </el-row>
    <el-collapse accordion>
      <el-collapse-item
        v-for="(item, index) in wordsList"
        :key="index">
        <template slot="title">
          <el-row type="flex" justify="space-between" align="center" class="row">
            <span>{{ item.title }}</span>
            <span>操作</span>
          </el-row>
        </template>
        <div class="content">
          <div class="left" v-if="item.riskList.length">
            <span
              v-for="(word, index) in item.riskList"
              :key="index"
              class="word">
              {{ word }}
              <i v-if="index !== (item.riskList.length - 1)">，</i>
            </span>
          </div>
          <empty v-else class="left"></empty>
          <div class="right">
            <el-input
              v-model="lowRisk"
              style="width: 270px;"
              placeholder="请输入敏感词"
              v-if="item.type === 'lowRisk'">
              <template #append>
                <el-button type="primary" @click="handleSearchWords(item.type)" style="width: 80px;background: #fc5757;color: #fff;">搜索</el-button>
              </template>
            </el-input>
            <el-input
              v-model="highRisk"
              style="width: 270px;"
              placeholder="请输入敏感词"
              v-if="item.type === 'highRisk'">
              <template #append>
                <el-button type="primary" @click="handleSearchWords(item.type)" style="width: 80px;background: #fc5757;color: #fff;">搜索</el-button>
              </template>
            </el-input>
            <template v-if="item.type === 'exception'">
              <el-input
                v-model="pid"
                style="width: 270px;"
                placeholder="请输入特例品ID">
                <template #append>
                  <el-button type="primary" @click="handleSearchWords(item.type)" style="width: 80px;background: #fc5757;color: #fff;">搜索</el-button>
                </template>
              </el-input>
              <el-button type="primary" @click="handleAddException" class="btn">添加</el-button>
              <el-button type="primary" @click="handleDelException" class="btn">删除</el-button>
            </template>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
    <!-- 敏感词 -->
    <words-drawer :visible.sync="visible" :type="dtype" @refresh="handleSearch"></words-drawer>
    <!-- 特列品 -->
    <product-drawer :visible.sync="productVisible" :payload="payload" @refresh="handleSearch"></product-drawer>
  </div>
</template>

<script>
import WordsDrawer from './components/WordsDrawer.vue';
import { QueryWordsList, QueryWords } from '@/api/words/list';
import { hasValue } from '@/util';
import ProductDrawer from './components/ProductDrawer.vue';

export default {
  components: { WordsDrawer, ProductDrawer },
  data() {
    return {
      loading: false,
      visible: false,
      productVisible: false,
      payload: {
        type: 'add',
      },
      highRisk: '',
      lowRisk: '',
      pid: '',
      dtype: 'add',
      groupId: 1,
      wordsList: [
        {
          title: '低风险敏感词：(含有低风险敏感词商品，商品信息中的敏感信息将直接删除)',
          riskList: [],
          type: 'lowRisk'
        },
        {
          title: '高风险敏感词：(含有高风险敏感词商品将直接下架)',
          riskList: [],
          type: 'highRisk'
        },
        {
          title: '特列品：(特列品ID添加后，这些品将不会扫描和替换敏感词)',
          riskList: [],
          type: 'exception'
        }
      ],
      tempRiskList: [],
    }
  },
  methods: {
    handleSearch() {
      if (this.loading) return
      this.loading = true;
      QueryWordsList()
        .then(({ data }) => {
          this.wordsList[0].riskList = data.lowSensitiveList;
          this.wordsList[1].riskList = data.highSensitiveList;
          this.wordsList[2].riskList = data.productIds;
          this.tempRiskList = data.productIds;
        })
        .catch(() => console.warn)
        .finally(() => {
          this.loading = false
        })
    },
    getWords(ty, data) {
      QueryWords(data)
        .then(({ data }) => {
          if (ty === 'lowRisk') {
            this.wordsList[0].riskList = data;
          } else if (ty === 'highRisk') {
            this.wordsList[1].riskList = data;
          } else {
            this.wordsList[2].riskList = data;
          }
        })
        .catch(() => console.warn)
    },
    handleSearchWords(ty) {
      let data = Object.create(null);
      if (ty === 'lowRisk') {
        const lowRisk = this.lowRisk.split('').filter(item => hasValue(item)).join('');
        data.content = lowRisk;
        data.riskLevel = 0;
      } else if (ty === 'highRisk') {
        const highRisk = this.highRisk.split('').filter(item => hasValue(item)).join('');
        data.content = highRisk;
        data.riskLevel = 1;
      }
      switch(ty) {
        case 'lowRisk':
          this.getWords(ty, data)
          break;
        case 'highRisk':
          this.getWords(ty, data)
          break;
        case 'exception':
          if (this.pid) {
            this.wordsList[2].riskList = this.tempRiskList.filter(item => item === +this.pid);
          } else {
            this.wordsList[2].riskList = this.tempRiskList
          }
          break;
      }
    },
    // 敏感词
    handleAddWords() {
      this.visible = true;
      this.dtype = 'add';
    },
    handleDelWords() {
      this.visible = true;
      this.dtype = 'del';
    },
    // 特列品
    handleAddException() {
      this.productVisible = true;
      this.payload = {
        type: 'add'
      }
    },
    handleDelException() {
      this.productVisible = true;
      this.payload = {
        type: 'del'
      }
    },
  },
  created() {
    this.handleSearch()
  }
}
</script>

<style lang="scss" scoped>
$--bold: bold;
$btm: 8px;

.page{
  .row{
    width: 100%;
    padding-right: 150px;
    font-weight: bolder;
  }
  .content{
    display: flex;
    padding: 10px 0px;
    .word{
      color: #141414;
      font-size: 14px;
    }
    .left{
      display: flex;
      align-items: flex-start;
      width: calc(100% - 300px);
      border-right: 1px solid #E4E7ED;
      flex-wrap: wrap;
      word-break: break-word;
    }
    .right{
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-end;
      width: 300px;
      padding: 0 !important;
    }
    .empty{
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 14px;
      color: #909399;
    }
    .btn{
      width: 80px;
      margin-top: 10px;
    }
  }
}
::v-deep {
  .el-collapse-item__content {
    padding: 0 !important;
  }
  .el-collapse-item__header{
    background: #f5f7fa;
    padding-left: 8px;
  }
  .el-collapse-item + .el-collapse-item{
    margin-top: 16px;
  }
}
</style>
<style>

</style>
