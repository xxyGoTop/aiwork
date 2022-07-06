<template>
  <div class="activity-wrapper">
    <div class="my-item-notice">
      <h3>官方公告</h3>
      <p class="row">1.活动开始前15分钟开始所有活动内容均不允许改动，请谨慎操作！</p>
      <p>2.同一商品报名多平台多店铺活动时间不能有交叉。</p>
      <p>3.活动开始前15分钟系统根据预锁库存开始锁库存（库存不足时：锁空所有库存；天猫三仓锁库存，优先锁满足库存的仓，均不满足时，则按照优先级先锁天津仓，其次无锡仓，再次广州仓),库存只锁一次，系统不会自动补锁，中途也不能添加补库存，请认真维护；</p>
    </div>

    <el-form class="my-item-form" size="mini" :model="form" ref="form" label-width="70px" inline>
      <el-row>
        <el-form-item label="活动ID" prop="liveId">
          <el-input v-model="form.liveId" placeholder="活动ID" style="width: 150px"></el-input>
        </el-form-item>
        <el-form-item label="直播名称" prop="liveName">
          <el-input v-model="form.liveName" placeholder="" style="width: 150px"></el-input>
        </el-form-item>
        <el-form-item label="直播状态" prop="liveStatus">
          <el-select v-model="form.liveStatus" clearable placeholder="请选择" style="width: 150px">
            <el-option label="全部" value="" checked="true"></el-option>
            <el-option v-for="item in liveStatusList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="直播店铺" prop="platformId">
          <el-select v-model="form.platformId" clearable placeholder="请选择" style="width: 150px">
            <el-option label="全部" value="" checked="true"></el-option>
            <el-option v-for="item in platformList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-row>

      <el-row type="flex">
        <el-form-item class="date-form" label="创建时间" prop="creationDate">
          <el-date-picker
            v-model="form.creationDate"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 380px"
            unlink-panels>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="直播类型" prop="liveType">
          <el-select v-model="form.liveType" clearable placeholder="请选择" style="width: 150px">
            <el-option label="全部" value="" checked="true"></el-option>
            <el-option v-for="item in liveTypeList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <div style="margin-left: 6px;">
          <el-button type="primary" size="mini" @click="handleSearchLiveList">查询</el-button>
          <el-button size="mini" @click="handleReset">重置</el-button>
        </div>
      </el-row>
      <el-row type="flex" justify="space-between">
        <div class="flex-left">
          <el-button type="primary" size="mini" @click="handleCreateNewLive">新建直播</el-button>
        </div>
      </el-row>
    </el-form>
    <el-table
      :data="list"
      v-loading="loading"
      style="width: 100%">
      <el-table-column
        align="center"
        prop="liveId"
        label="活动ID"
        width="120">
      </el-table-column>
      <el-table-column
        align="center"
        prop="liveName"
        label="直播名称"
        show-overflow-tooltip>
        <template slot-scope="scope">
          <div style="text-align: left;">{{ scope.row.liveName }}</div>
        </template>
        <div></div>
      </el-table-column>
      <el-table-column
        align="center"
        prop="liveTime"
        label="直播时间"
        width="165">
        <template slot-scope="scope">
          {{ scope.row.startTime + ' ~ ' + scope.row.endTime }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        prop="status"
        label="直播状态"
        width="80">
        <template slot-scope="scope">
          {{ liveStatusEnum[scope.row.status] }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        prop="platformName"
        label="直播店铺"
        width="150">
      </el-table-column>
      <el-table-column
        align="center"
        prop="liveType"
        label="直播类型"
        width="80">
        <template slot-scope="scope">
          {{ liveTypeEnum[scope.row.liveType] }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        prop="creationDate"
        label="创建时间"
        width="150">
      </el-table-column>
      <el-table-column
        align="center"
        prop="orderAmount"
        label="销售金额（元）"
        width="80">
        <template slot-scope="scope">
          {{ scope.row.orderAmount == null ? "0" : scope.row.orderAmount}}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        prop="orderCount"
        label="订单量（单）"
        width="80">
        <template slot-scope="scope">
          {{ scope.row.orderCount == null ? "0" : scope.row.orderCount}}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="操作"
        width="200">
        　<template slot-scope="scope">
            <div
              v-if="scope.row.status == 0 || scope.row.status == 1" type="primary"
              class="button-ctrl"
              @click="handleUpdateLive(scope.row)"
              style="margin: 5px">
              编辑
            </div>
            <div
              class="button-ctrl"
              @click="handleJumpToLiveDetail(scope.row.liveId)"
              style="margin: 5px">
              查看详情
            </div>
            <div
              class="button-ctrl-danger"
              v-if="scope.row.status == 0"
              style="margin: 5px"
              @click="handleDeleteLive(scope.row.liveId)">
              删除
            </div>
        　</template>
      </el-table-column>
    </el-table>
    <el-row type="flex" justify="end" style="margin-top: 20px;">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page"
        :page-sizes="[10]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next"
        :total="total">
      </el-pagination>
    </el-row>
  </div>
</template>

<script>
import {
  CreateLiveBasic,
  LiveList,
  DeleteLive,
} from "@/api/live"
import {
  subMinutes,
} from "date-fns"


export default {
  data: () => {
    return {
      loading: false,
      form: {
        liveId: "",
        creationDate: "",
        creationDateStart: "",
        creationDateEnd: "",
        liveStatus: "",
        platformId: "",
        liveName: "",
        liveType: "",
      },
      liveStatusEnum: {
        0: "未开始",
        1: "进行中",
        2: "已结束"
      },
      liveTypeEnum: {
        1: "合作直播",
        2: "店铺直播"
      },
      page: 1,
      pageSize: 10,
      total: 0,
      list: [],
      platformList:[],
      liveTypeList:[],
      liveStatusList:[]
    }
  },
  created() {
    this.getLiveList()
    this.getCreateLiveBasic()
  },
  methods: {
    getLiveList(size = 10, page = 1) {
      const { creationDate } = this.form
      if (creationDate && creationDate.length) {
        this.form.creationDateStart = creationDate[0]
        this.form.creationDateEnd = creationDate[1]
      } else {
        this.form.creationDateStart = ""
        this.form.creationDateEnd = ""
      }
      this.form.curPage=page
      this.form.pageSize=size
      this.loading = true
      LiveList({
        ...this.form
      }).then(data => {
        if (data.code === 200) {
          this.list = data.data || []
          this.total = data.total || 0
        } else {
          this.list = []
          this.total = 0
        }
        this.loading = false
      }).finally(() => {
        this.loading = false
      })
    },
    handleDeleteLive(liveId) {
      this.$confirm("确定删除该直播活动吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        DeleteLive({
          liveId
        }).then(data => {
          if (data.code === 200) {
            this.$message.success("删除成功")
          } else {
            this.$message.success("删除失败:" + data.msg)
          }
          this.getLiveList(this.pageSize, this.page)
        }).catch((error) => {
          this.$message.success("删除失败:" + error)
        })
      })
    },
    handleSearchLiveList() {
      this.page = 1
      this.getLiveList(this.pageSize)
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.getLiveList(size, this.page)
    },
    handleCurrentChange(page) {
      this.page = page
      this.getLiveList(this.pageSize, page)
    },
    handleReset() {
      this.$refs.form.resetFields()
    },
    getCreateLiveBasic(){
      CreateLiveBasic().then(({ data }) => {
        this.platformList = data ? data.platformList : []
        this.liveTypeList = data ? data.liveTypeList : []
        this.liveStatusList = data ? data.liveStatusList : []
      })
    },
    handleCreateNewLive() {
      this.$router.push("/living/createLive")
    },
    handleJumpToLiveDetail(liveId) {
      const path = "/living/submit/" + liveId + "/1"
      this.$router.push(path)
    },
    handleUpdateLive(row) {
      const { liveId, startTime } = row
      const sTime = subMinutes(new Date(startTime), 15)
      const path = "/living/updateLive/" + liveId
      if (sTime < new Date()) {
        this.$message.error("活动开始前15分钟开始不允许编辑")
        return
      }
      this.$router.push(path)
    }
  },
}
</script>

<style lang="scss">
.my-item-form{
  .el-input--mini .el-input__inner {
    height: 38px;
  }
  .el-range-editor--mini.el-input__inner {
    height: 38px;
  }
  .el-button {
    height: 38px;
  }
}
  .flex {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .activity-wrapper {
    padding: 16px;
    background-color: #fff;
    .el-row {
      margin-bottom: 15px;
    }
  }
  .my-item-notice {
    padding: 12px;
    background: #f4f4f5;
    border-radius: 6px;
    margin-bottom: 20px;
    h3, p {
      margin: 0;
    }
    h3 {
      font-size: 14px;
    }
    p {
      font-size: 13px;
      padding-left: 35px;
      line-height: 25px;
    }
    p.row {
      color: #fc5757;
    }
  }
</style>
