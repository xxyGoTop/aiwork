<template xmlns:>
  <div class="activity-wrapper">
    <el-steps :active="active" space="500px" finish-status="success" align-center>
      <el-step title="基本信息"></el-step>
      <el-step title="商品及锁库存"></el-step>
      <el-step title="促销"></el-step>
      <el-step title="确认提交"></el-step>
    </el-steps>

    <el-row type="flex" justify="start" align="middle">
      <div class="title">促销列表</div>
    </el-row>

    <el-table
      :data="tableData"
      v-loading="loading"
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
        align="center"
        width="300">
        <template slot-scope="scope">
          <router-link :to=" urlName[scope.$index] " class="button-ctrl">
            {{ url[scope.$index] + stageInfo[scope.$index+1]}}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        prop="address"
        label="预计赠送成本">
        <template slot-scope="scope">
          <b :href=" urlName[scope.$index] " target="_blank" aria-readonly="true">
            预计赠送成本 (元)：  {{ totalPrice[scope.$index+1]}}
          </b>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 20px" align="center">
      <el-button size="medium" align="center" @click="Previou">上一步</el-button>
      <el-button size="medium" type="primary" align="center" @click="next">下一步</el-button>
    </div>
  </div>
</template>


<script>
import { GetStageInfo } from "@/api/live"

export default {
  data() {
    return {
      active: 2,
      tableData: [{
        promoType: "活动阶梯赠",
        name: "王小虎",
        address: "预计赠品成本（元）：",
      }, {
        promoType: "单品阶梯赠",
        name: "王小虎",
        address: "预计赠品成本（元）：",
      }, {
        promoType: "单品买赠",
        name: "王小虎",
        address: "预计赠品成本（元）：",
      }],
      urlName: {
        0: "/living/activity/stage/0/" + this.$route.params.liveId,
        1: "/living/product/stage/0/" + this.$route.params.liveId,
        2: "/living/product/single/0/" + this.$route.params.liveId,
      },
      url: {
        0: "设置活动阶梯赠",
        1: "设置单品阶梯赠",
        2: "设置单品买赠",
      },
      stageInfo : {
        1: "",
        2: "",
        3: "",
      },
      totalPrice : {
        1: 0,
        2: 0,
        3: 0,
      },
      liveId : "",
      action : 0 ,
      loading: false,
    }

  },
  created() {
    this.requestActiveDetail()
    this.GetStageInfo()
  },
  methods: {
    requestActiveDetail() {
      const {
        liveId,
      } = this.$route.params
      this.liveId=liveId
    },
    next() {
      if (this.active++ > 3) this.active = 0
      this.$router.push({ path:"/living/submit/"+this.liveId+"/"+this.action  })
    },
    Previou() {
      if (this.active-- < 0) this.active = 0
      this.$router.push({ path:"/living/product/productAndStock/"+this.liveId +"/"+this.action })
    },
    GetStageInfo(){
      this.loading = true
      GetStageInfo({
        liveId:this.liveId
      }).then(data => {
        if (data.data) {
          for (let object of data.data) {
            this.$set(this.stageInfo,Number(object.promoType),"("+object.promoNum+")")
            this.$set(this.totalPrice,Number(object.promoType),object.giftTotalPrice)
          }
        }
      }).finally(() => {
        this.loading = false
      })
    },
  },
}

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

    .title{
      font-size: 16px;
      color: #141414;
    }

    .el-row {
      margin-bottom: 15px;
    }
  }
</style>
