<template>
  <div class="activity-wrapper">
    <el-steps :active="active" space="500px" finish-status="success" align-center v-if="Bsubmit">
      <el-step title="基本信息"></el-step>
      <el-step title="商品及锁库存"></el-step>
      <el-step title="促销"></el-step>
      <el-step title="确认提交"></el-step>
    </el-steps>

    <div class="live-box">
      <div class="arrow" v-loading="loadingInfo">
        <el-form class="my-item-form" size="medium" :model="form" ref="form" label-width="80px">
          <el-row type="flex" justify="start" align="middle">
            <div class="title">基本信息</div>
          </el-row>
          <el-row>
            <el-col :span="20">
              <el-form-item label="直播名称 " prop="liveName">
                <el-input v-model="form.liveName" placeholder="直播名称" style="width: 300px;" readonly></el-input>
              </el-form-item>
              <el-form-item class="date-form" label="创建时间" prop="creationDate">
                <el-date-picker
                  v-model="form.startTime"
                  placeholder="开始时间"
                  format="yyyy-MM-dd HH:mm:ss"
                  dateType="datetimerange"
                  readonly>
                </el-date-picker>
                <span style="margin: 0px 15px;">至</span>
                <el-date-picker
                  aria-readonly="true"
                  v-model="form.endTime"
                  placeholder="结束时间"
                  format="yyyy-MM-dd HH:mm:ss"
                  dateType="datetimerange"
                  readonly>
                </el-date-picker>
              </el-form-item>

              <el-form-item label="直播店铺" prop="platformName">
                <el-input v-model="form.platformName" placeholder="直播店铺" style="width: 300px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="直播类型" prop="liveType">
                <el-input v-model="liveTypes[form.liveType]" placeholder="直播类型" style="width: 300px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="包装耗材" prop="consumableType">
                <el-input v-model="form.consumableType" placeholder="包装耗材" style="width: 300px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="包装类型" prop="packageType">
                <el-input v-model="form.packageType" placeholder="包装类型" style="width: 300px;" readonly></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>

    <div class="live-box live-box_mid">
      <el-row type="flex" justify="start" align="middle">
        <div class="title">商品及预锁库存列表</div>
      </el-row>
      <el-table
        :data="list"
        v-loading="loading"
        style="width: 100%">
        <el-table-column
          align="center"
          prop="productId"
          label="当当商品ID"
          width="120">
        </el-table-column>
        <el-table-column
          align="center"
          prop="platformProductId"
          label="店铺商品ID"
          width="170">
        </el-table-column>
        <el-table-column
          align="center"
          prop="productName"
          label="商品名称">
          <template slot-scope="scope">
            <div style="text-align: left;">{{ scope.row.productName }}</div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="dangStockNum"
          label="当当库存"
          width="160">
        </el-table-column>
        <el-table-column
          align="center"
          prop="preLockNum"
          label="预锁库存"
          width="160">
        </el-table-column>
      </el-table>
    </div>

    <div class="live-box">
      <el-row type="flex" justify="start" align="middle">
        <div class="title">促销列表</div>
      </el-row>
      <el-table
        :data="tableData"
        align="center"
        style="width: 100%">
        <el-table-column
          align="center"
          prop="promoType"
          label="活动类型"
          width="200">
        </el-table-column>
        <el-table-column
          prop="url"
          align="center">
          <template slot-scope="scope">
            <router-link :to="urlName(scope.$index)" class="button-ctrl">
              {{ url[action][scope.$index]}}
              ({{stageInfo[scope.$index+1] || 0}})
            </router-link>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="address"
          label="预计赠送成本">
          <template slot-scope="scope">
            <b target="_blank" aria-readonly="true">
              {{ scope.$index !== 0 ? '预计赠送成本 (元)' : '预计赠送赠品成本 (元)'}}： {{ totalPrice[scope.$index+1]}}
            </b>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div style="margin-top: 20px;" align="center" v-if="Bsubmit">
      <el-button size="medium" align="center" @click="preview">上一步</el-button>
      <el-button size="medium" type="primary" align="center" @click="submit">确认提交</el-button>
    </div>

  </div>
</template>

<script>
  import { GetLiveInfo, GetLiveProductList, GetStageInfo, submitLiveInfo } from '@/api/live';

  export default {
    data: () => {
      return {
        tableData: [{
          promoType: '活动阶梯赠',
          address: '预计赠品成本（元）：',
        }, {
          promoType: '单品阶梯赠',
          address: '预计赠品成本（元）：',
        }, {
          promoType: '单品买赠',
          address: '预计赠品成本（元）：',
        }],
        url: [{
          0: '设置活动阶梯赠',
          1: '设置单品阶梯赠',
          2: '设置单品买赠',
        }, {
          0: '查看活动阶梯赠',
          1: '查看单品阶梯赠',
          2: '查看单品买赠',
        }],
        stageInfo: {
          1: '',
          2: '',
          3: '',
        },
        totalPrice: {
          1: 0,
          2: 0,
          3: 0,
        },
        active: 3,
        loading: false,
        readOnly: true,
        form: {
          liveName: '',
          platformName: '',
          liveType: '',
          consumableType: '',
          packageType: '',
          startTime: '',
          endTime: '',
        },
        orderStatus: {
          1: '待当当确认',
          2: '已完成',
          3: '已取消',
        },

        liveTypes: {
          1: '合作直播',
          2: '店铺直播',
        },
        page: 1,
        pageSize: 20,
        total: 0,
        list: [],
        liveId: '',
        action: 0,
        Bsubmit: true,
        loadingInfo: false,
      };
    },
    computed: {
      urlName() {
        return (index) => {
          let url = '';
          switch(index) {
            case 0:
              url = `/living/activity/stage/${this.action}/` + this.liveId; 
              break;
            case 1:
              url = `/living/product/stage/${this.action}/` + this.liveId; 
              break;
            case 2:
              url = `/living/product/single/${this.action}/` + this.liveId; 
              break;
          }
          return url;
        }
      }
    },
    created() {
      this.requestActiveDetail();
      this.GetStageInfo();
      this.getLiveInfo();
      this.getProductList();
    },
    methods: {
      requestActiveDetail() {
        const {
          liveId,
          action,
        } = this.$route.params;
        this.liveId = liveId;
        if (action === '1') {
          this.action = action;
          this.Bsubmit = false;
          this.active = 4;
        }
      },
      submitLiveInfo() {
        submitLiveInfo({
          'liveId': this.liveId,
        }).then(data => {
          if (data.code === 200) {
            this.$message.success('提交成功');
            this.$router.push('/living/LiveList');
          }
        });
      },
      getLiveInfo() {
        this.loadingInfo = true;
        GetLiveInfo({
          'liveId': this.liveId,
          'curPage': '1',
          'pageSize': 10,
        }).then(data => {
          if (data.code === 200 && data.data !== 'SYSTEM_ERROR') {
            this.form = data.data[0];
          }
        }).catch((e) => {
          console.log(e.toString())
        }).finally(() => {
          this.loadingInfo = false;
        });
      },
      GetStageInfo() {
        GetStageInfo({
          liveId: this.liveId,
        }).then(data => {
          if (data.code === 200) {
            for (let object of data.data) {
              this.$set(this.stageInfo, Number(object.promoType), object.promoNum);
              this.$set(this.totalPrice, Number(object.promoType), object.giftTotalPrice);
            }
          }
        });
      },
      getProductList() {
        const liveId = {
          'liveId': this.liveId,
        };
        this.loading = true;
        GetLiveProductList(liveId).then(data => {
          if (data.code === 200) {
            this.list = data.data || [];
            this.total = data.data.length || 0;
          } else {
            this.list = [];
            this.total = 0;
            this.$message.error(data.message);
          }
        }).finally(() => {
          this.loading = false;
        });
      },
      preview() {
        this.$router.push({ path:'/living/promo/list/'+this.liveId +'/'+this.action })
      },
      submit() {
        this.submitLiveInfo();
      },
    },
  };
</script>

<style lang="scss">
  .flex {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .activity-wrapper {
    padding: 16px;
    background-color: #fff;

    .live-box_mid {
      margin-bottom: 25px;
    }
  }
</style>
