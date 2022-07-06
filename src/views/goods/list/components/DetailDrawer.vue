<template>
  <el-drawer
    :title="info.productName"
    :visible="visible"
    @close="handleDrawerClose"
    ref="drawer"
    direction="rtl"
    size="750px"
    class="drawer">
    <div class="container">
      <div class="prod_info">
        <div class="prod_item" >
          <span class="prod_label">
            当当ID
          </span>
          <span class="prod_content">
            <a :href="`${groupMap[0].link}${info.productId}.html`" target="_blank" class="id-link">
              {{ info.productId || '-' }}
            </a>
          </span>
        </div>
        <div class="prod_item" >
          <span class="prod_label">
            外部ID
          </span>
          <span class="prod_content tmId" style="display:block;margin-right:5px">
            {{ info.outerCode ? info.outerCode : '-' }}
          </span>
        </div>
        <div class="prod_item" >
          <span class="prod_label">
            SKUID
          </span>
          <span class="prod_content">
            {{info.outerSkuId || '-' }}
          </span>
        </div>
        <div class="prod_item" >
          <span class="prod_label">
            商品状态
          </span>
          <div class="prod_content">
            <span :class="info.saleStatus ? info.saleStatus === 1 ? 'success' : 'info' : 'info'"></span>
            {{ info.saleStatus ? info.saleStatus === 1 ? '已上架' : '已下架'  : ('未上架' || '-') }}
          </div>
        </div>
        <div class="prod_item" >
          <span class="prod_label">
            是否预售
          </span>
          <span class="prod_content">
            {{info.outerPresaleStr || '-' }}
          </span>
        </div>
      </div>
      <el-tabs v-model="activePane" @tab-click="handleTabsToggle" style="margin-top:20px;" class="drawer-tabs">
        <!-- 库存 -->
        <el-tab-pane label="库存" name="storeRemain">
          <!-- 库存同步情况 -->
          <el-row type="flex" justify="space-between" align="middle">
            <div class="title">库存同步情况
              <span class="updateTime">
                上次更新数据于{{ formatDate(new Date(), 'HH:mm') }}
              </span>
            </div>
          </el-row>
          <el-table :data="storeInfos" border show-summary sum-text="总计" style="margin-top:15px">
            <el-table-column label="仓库" align="center">
              <template #default="{ row }">
                <Icon v-if="row.locked" name="lock" class="lock-icon"></Icon>
                {{ row.stockDesc }}
              </template>
            </el-table-column>
            <el-table-column label="总量" prop="totalQuantity" align="center"></el-table-column>
            <el-table-column label="可售" prop="saleQuantity" align="center"></el-table-column>
            <el-table-column label="占用" prop="occupyQuantity" align="center"></el-table-column>
            <el-table-column label="当当可售" prop="ddSaleQuantity" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
              <template #default="{ row }">
                <el-button v-if="row.locked" type="text" size="small" @click="handleUnlockStore" style="border:none">解锁库存</el-button>
                <el-button v-else type="text" size="small" @click="handleLockStore(row)" style="border:none">锁库存</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 锁库存情况 -->
          <el-row type="flex" justify="start" align="middle" style="margin-top:15px">
            <div class="title">锁库存情况
              <span class="updateTime">
                上次更新数据于{{ formatDate(new Date(), 'HH:mm') }}
              </span>
            </div>
          </el-row>
          <el-table :data="lockStoreInfos" border style="margin-top:15px">
            <el-table-column label="仓库" prop="wareHouse" align="center"></el-table-column>
            <el-table-column label="剩余锁定量" prop="remainderLockCount" align="center"></el-table-column>
            <el-table-column label="首次锁定量" prop="firstLockCount" align="center" ></el-table-column>
            <el-table-column label="补锁量" prop="addLockCount" align="center" ></el-table-column>
            <el-table-column label="最小值" prop="lowerQuantity" align="center"></el-table-column>
            <el-table-column label="补锁值" prop="addQuantity" align="center"></el-table-column>
            <el-table-column label="锁定时间" align="center">
              <template #default="{ row }">
                {{ `${row.lockStartTime}~${row.lockEndTime}`}}
              </template>
            </el-table-column>
          </el-table>
          <!-- 主站库存 -->
          <el-row type="flex" justify="start" align="middle" style="margin-top:15px">
            <div class="title">主站库存
              <span class="updateTime">
                上次更新数据于{{ formatDate(new Date(), 'HH:mm') }}
              </span>
            </div>
          </el-row>
          <el-table :data="mainSiteInfos" border style="margin:15px 0">
            <el-table-column label="仓库" prop="warehouseName" align="center"></el-table-column>
            <el-table-column label="库存类型" prop="warehouseTypeDesc" align="center"></el-table-column>
            <el-table-column label="可销售数" prop="saleQuantity" align="center"></el-table-column>
            <el-table-column label="实物库存数" prop="stockQuantity" align="center"></el-table-column>
            <el-table-column label="预售数量" prop="presaleQuantity" align="center"></el-table-column>
            <el-table-column label="占用数" prop="postStockQuantity" align="center"></el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 价格 -->
        <el-tab-pane label="价格" name="price">
          <el-row type="flex" justify="start" align="middle">
            <div class="title">商品价格</div>
          </el-row>
          <el-table :data="priceList" border style="margin-top:10px">
            <el-table-column label="原价" prop="originalPrice" align="center"></el-table-column>
            <el-table-column label="当当价" prop="ddSalePrice" align="center"></el-table-column>
            <el-table-column label="外平台价" prop="outerSalePrice" align="center"></el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 黑名单 -->
        <el-tab-pane label="黑名单" name="blacklist">
          <!-- 价格黑名单 -->
          <el-row type="flex" justify="space-between" align="middle">
            <div class="title">价格同步黑名单</div>
            <el-button type="primary" size="small" @click="handleRouterJump">添加</el-button>
          </el-row>
          <el-table :data="priceBlacklist" border style="margin:10px 0">
            <el-table-column label="开始时间" prop="startTime" align="center"></el-table-column>
            <el-table-column label="结束时间" prop="endTime" align="center"></el-table-column>
            <el-table-column label="状态" prop="status" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
              <template #default="{ row }">
                <el-button type="text" size="small" @click="handleRemovePriceBlacklist(row)" style="border:none">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 库存黑名单 -->
          <el-row type="flex" justify="start" align="middle">
            <div class="title">库存黑名单</div>
          </el-row>
          <el-table :data="storeBlacklist" border style="margin:10px 0">
            <el-table-column label="开始时间" prop="startTime" align="center"></el-table-column>
            <el-table-column label="结束时间" prop="endTime" align="center"></el-table-column>
            <el-table-column label="状态" prop="status" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
              <template #default="{ row }">
                <el-button type="text" size="small" @click="handleRemoveStoreBlacklist(row)" style="border:none">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 商品黑名单 -->
          <el-row type="flex" justify="start" align="middle">
            <div class="title">商品黑名单</div>
          </el-row>
          <el-table :data="prodBlacklist" border style="margin:10px 0">
            <el-table-column label="开始时间" prop="startTime" align="center"></el-table-column>
            <el-table-column label="结束时间" prop="endTime" align="center"></el-table-column>
            <el-table-column label="状态" prop="status" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
              <template #default="{ row }">
                <el-button type="text" size="small" @click="handleRemoveProdBlacklist(row)" style="border:none">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 上架黑名单 -->
          <el-row type="flex" justify="start" align="middle">
            <div class="title">上架黑名单</div>
          </el-row>
          <el-table :data="onshelfBlacklist" border style="margin:10px 0">
            <el-table-column label="开始时间" prop="startTime" align="center"></el-table-column>
            <el-table-column label="结束时间" prop="endTime" align="center"></el-table-column>
            <el-table-column label="状态" prop="status" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
              <template #default="{ $index }">
                <el-button type="text" size="small" @click="handleRemoveShelfBlacklist($index)" style="border:none">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
           <!-- 改价黑名单 -->
          <el-row type="flex" justify="start" align="middle">
            <div class="title">改价黑名单</div>
          </el-row>
          <el-table :data="changePrices" border style="margin:10px 0">
            <el-table-column label="开始时间" prop="startTime" align="center"></el-table-column>
            <el-table-column label="结束时间" prop="endTime" align="center"></el-table-column>
            <el-table-column label="状态" prop="status" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
              <template #default="{ $index }">
                <el-button type="text" size="small" @click="handleRemovePrice($index)" style="border:none">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 销量 -->
        <el-tab-pane label="销量" name="sales">
          <el-row type="flex" justify="space-between" align="middle">
            <div class="title">销售量</div>
            <div style="display:flex;justify-content:end;align-items:center">
              <el-select v-model="dateRange" style="width:100px;"  size="small" @change="handleSelectDate">
                <el-option label="本周" value="7"></el-option>
                <el-option label="上周" value="14"></el-option>
                <el-option label="近一个月" value="30"></el-option>
                <el-option label="近三个月" value="90"></el-option>
              </el-select>
              <el-date-picker
                type="daterange"
                v-model="dateValue"
                range-separator="~"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="small"
                style="width:240px"
                @change="handleGetSaleData">
              </el-date-picker>
            </div>
          </el-row>
          <!-- 折线图 -->
          <div class="dataView">
            <ECharts
              :options="option"
              v-if="option.series[0].data.length"
              ref="chart"
              class="line">
            </ECharts>
            <Empty v-else style="height:400px"></Empty>
          </div>
        </el-tab-pane>
        <!-- 规格天猫 -->
        <el-tab-pane label="规格" name="norms" v-if="info.groupType === 1">
          <el-table :data="normsInfos" border>
            <el-table-column label="SKUID(当当)" prop="productId" ></el-table-column>
            <el-table-column label="SPUID(当当ID)" prop="spuId" ></el-table-column>
            <el-table-column label="商品名称" >
              <template #default="{ row }">
                <el-tooltip :content="row.productName">
                  <div class="ellp-2">{{row.productName}}</div>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="款式" prop="design"></el-table-column>
            <el-table-column label="版本" prop="edition"></el-table-column>
            <el-table-column label="外平台SPUID" prop="outerCode"></el-table-column>
            <el-table-column label="外平台SKUID" prop="outerSkuId"></el-table-column>
            <el-table-column label="物流宝ID" prop="scItemId"></el-table-column>
            <el-table-column label="状态">
              <template #default="{ row }">
                {{ row.saleStatus === 4 ? '已删除' : '正常' }}
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #header="{ column }">
                <div style="display: inline-flex;align-items: center;position: relative;top: 3px;">
                  <span>{{column.label}}</span>
                  <el-tooltip content="删除SKU后系统会将外平台SKU库存拉为0，恢复SKU后系统会自动同步外平台库存" placement="top">
                    <Icon name="question"></Icon>
                  </el-tooltip>
                </div>
              </template>
              <template #default="{ row }">
                <el-button type="text" v-if="row.saleStatus !== 4" @click="handleStyleDel(row)">删除</el-button>
                <el-button type="text" v-else @click="handleStyleRecover(row)">恢复</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <!-- 规格 拼多多、抖音 -->
        <el-tab-pane label="规格" name="norms" v-if="groupType === 2 || groupType === 3">
          <el-table :data="normsInfos" border>
            <el-table-column label="SKUID(当当)" prop="skuid" ></el-table-column>
            <el-table-column label="SPUID(当当ID)" prop="spuid" ></el-table-column>
            <el-table-column label="商品名称" >
              <template #default="{ row }">
                <el-tooltip :content="row.productName">
                  <div class="ellp-2">{{row.productName}}</div>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="款式" prop="style"></el-table-column>
            <el-table-column label="版本" prop="version"></el-table-column>
            <el-table-column label="外平台SPUID" prop="outerSPUId"></el-table-column>
            <el-table-column label="外平台SKUID" prop="outerSKUId"></el-table-column>
            <el-table-column label="状态">
              <template #default="{ row }">
                {{ row.status ? '已删除' : '正常' }}
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #header="{ column }">
                <div style="display: inline-flex;align-items: center;position: relative;top: 3px;">
                  <span>{{column.label}}</span>
                  <el-tooltip content="删除SKU后系统会将外平台SKU库存拉为0，恢复SKU后系统会自动同步外平台库存" placement="top">
                    <Icon name="question"></Icon>
                  </el-tooltip>
                </div>
              </template>
              <template #default="{ row }">
                <el-button type="text" v-if="!row.status" @click="handleStyle(row, 1)">删除</el-button>
                <el-button type="text" v-else @click="handleStyle(row, 2)">恢复</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 日志 -->
        <el-tab-pane label="操作日志" name="log">
          <el-table :data="logInfos" border>
            <el-table-column label="操作类型" prop="optKey" align="center"></el-table-column>
            <el-table-column label="操作员" prop="operator" align="center"></el-table-column>
            <el-table-column label="操作时间" prop="optTime" align="center">
              <template #default="{ row }">
                {{ formatDate(new Date(row.optTime), 'yyyy-MM-dd HH:mm:ss') }}
              </template>
            </el-table-column>
            <el-table-column label="操作结果" prop="optResult">
              <template #default="{ row }">
                <span v-if="row.optResult.length < 50">{{row.optResult}}</span>
                <el-tooltip :content="row.optResult" v-else>
                  <div class="ellp-2">{{row.optResult}}</div>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-drawer>
</template>

<script>
import ECharts from "vue-echarts"
import "echarts/lib/chart/line"
import "echarts/lib/component/tooltip"
import "echarts/lib/component/grid"
import { 
  format,
  subDays,
  getDay
} from "date-fns"
import {
  GoodsPrice,
  GoodsSale,
  GoodsStore,
  GoodsBlackList,
  GoodsOperateLog,
  SpecificationList,
  SpecificationDelete,
  SpecificationRecover,
  PDNormsList,
  PDNormsR,
} from "@/api/goods/list"
import {
  DeleteProduct,
} from "@/api/goods/black"

/* 黑名单类型枚举
  1081 商品黑名单,
  1082 上架黑名单
  1083 库存黑名单
  1084 价格黑名单
*/

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    info: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    ECharts
  },
  data() {
    return {
      activePane: "storeRemain",
      storeInfos: [],
      lockStoreInfos: [],
      mainSiteInfos: [],
      normsInfos: [],
      priceList: [],
      priceBlacklist: [],
      storeBlacklist: [],
      prodBlacklist: [],
      onshelfBlacklist: [],
      changePrices: [],
      logInfos: [],
      dateRange: "7",
      dateValue: [],
      option: {
        tooltip: {
          trigger: "item",
          backgroundColor: "#ffffff",
          extraCssText: "box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);",
          textStyle: {
            color: "#141414",
          },
          formatter: ({ data }) => {
            return `<span style="color:#999999;font-size:12px">${data.name}</span><br />
              订单量：<span style="color:#FC5757">${data.saleQuantity}</span><br />
              销售额：<span style="color:#FC5757">${data.saleAmount}</span>`
          }
        },
        grid: {
          containLabel: true,
          left: 14,
          right: 0,
          top: 30,
          bottom: 0,
        },
        xAxis: {
          type: "category",
          data: [],
          // nameTextStyle: {
          //   fontWeight: 300,
          //   fontSize: 14,
          // },
          // axisLabel: {
          //   color: "#999999",
          //   fontSize: 12
          // },
        },
        yAxis: {
          // name: '销售量',
          // nameLocation: 'end',
          type: "value",
          // nameTextStyle: {
          //   fontWeight: 300,
          //   fontSize: 14,
          // }
        },
        series: [
          {
            data: [],
            type: "line",
            smooth: true,
            lineStyle: {
              color: "#FC5757",
              width: 2
            },
            label: {
              show: true, 
            }
          }
        ]
      }
    }
  },
  computed: {
    groupMap() {
      return this.$store.state.groupMap
    },
    groupType() {
      return this.info.groupType
    }
  },
  watch: {
    visible(val) {
      val && this.handleTabsToggle({ name: "storeRemain" })
    },
  },
  methods: {
    formatDate(value, type) {
      return format(value, type)
    },
    // 关闭drawer
    handleDrawerClose() {
      this.activePane = "storeRemain"
      this.dateValue = []
      this.normsInfos = []
      this.$emit("update:visible", false)
    },
    // 切换tabs
    handleTabsToggle(tab) {
      this.activePane = tab.name
      const params = [this.info.partnerId, this.info.productId, this.info.outerDangProductId]
      switch(this.activePane) {
      case "storeRemain":
        GoodsStore({ partnerId: this.info.partnerId, productId: this.info.productId, outerDangProductId: this.info.outerDangProductId })
          .then(({ data }) => {
            this.mainSiteInfos = data.ddStock || []
            this.storeInfos = data.syncStock || []
            this.lockStoreInfos = data.lockStock || []
          })
          .catch(console.warn)
        break
      case "price":
        GoodsPrice(...[this.info.partnerId, this.info.productId, this.info.outerCode])
          .then(({ data }) => {
            if(!data.originalPrice && !data.ddSalePrice && !data.outerSalePrice) {
              return this.priceList = []
            } else {
              this.priceList = [data]
            }
          })
          .catch(console.warn)
        break
      case "blacklist":
        GoodsBlackList(...params)
          .then(({ data }) => {
            this.priceBlacklist = data.prices || []
            this.storeBlacklist = data.stocks || []
            this.prodBlacklist = data.products || []
            this.onshelfBlacklist = data.onShelves || []
            this.changePrices = data.changePrices || []
          })
          .catch(console.warn)
        break
      case "sales":
        if (this.dateValue.length === 0) {
          this.handleSelectDate(this.dateRange)
        } else {
          this.handleSelectDate(this.dateRange)
        }
        // this.handleGetSaleData();
        break
      case "norms":
        if (this.info.groupType === 2 || this.info.groupType === 3) {
          this.handleGetPDStyle()
        } else if (this.info.groupType === 1) {
          this.handleGetStyle()
        }
        break
      case "log":
        GoodsOperateLog({ partnerId: this.info.partnerId, productId: this.info.productId })
          .then(({ data }) => {
            this.logInfos = data.list
          })
          .catch(console.warn)
        break
      }
    },
    // 规格查询-天猫
    handleGetStyle() {
      const {
        partnerId,
        outerCode,
      } = this.info
      SpecificationList(partnerId, outerCode)
        .then(({ data }) => {
          this.normsInfos = data || []
        })
        .catch(console.warn)
    },
    // 规格查询(拼多多、抖音)
    handleGetPDStyle() {
      const {
        id
      } = this.info
      PDNormsList(id)
        .then(({ data }) => {
          this.normsInfos = data || []
        })
        .catch(console.warn)
    },
    // 规格删除、恢复(拼多多、抖音)
    handleStyle(row, status) {
      PDNormsR({ id: row.id, status })
        .then(() => {
          this.$message.success(status === 1 ? "删除成功" : "恢复成功")
          this.handleGetPDStyle()
        })
        .catch(console.warn)
    },
    // 锁库存
    handleLockStore() {
      this.$router.push("/stock/task")
    },
    // 解锁库存
    handleUnlockStore() {
      this.$router.push("/stock/task")
    },
    // 添加
    handleRouterJump() {
      this.$router.push({
        path: "/goods/black/task"
      })
    },
    // 解除价格黑名单
    handleRemovePriceBlacklist(index) {
      const params = {
        partnerId: this.info.partnerId,
        productId: this.info.productId,
        blackType: 1084
      }
      DeleteProduct(params)
        .then(() => {
          this.$message.success("移除成功")
          this.$delete(this.priceBlacklist, index)
        })
        .catch(console.warn)
    },
    // 解除库存黑名单
    handleRemoveStoreBlacklist(index) {
      const params = {
        partnerId: this.info.partnerId,
        productId: this.info.productId,
        blackType: 1083
      }
      DeleteProduct(params)
        .then(() => {
          this.$message.success("移除成功")
          this.$delete(this.storeBlacklist, index)
        })
        .catch(console.warn)
    },
    // 解除商品黑名单
    handleRemoveProdBlacklist(index) {
      const params = {
        partnerId: this.info.partnerId,
        productId: this.info.productId,
        blackType: 1081
      }
      DeleteProduct(params)
        .then(() => {
          this.$message.success("移除成功")
          this.$delete(this.prodBlacklist, index)
        })
        .catch(console.warn)
    },
    // 移除上架黑名单
    handleRemoveShelfBlacklist(index) {
      const params = {
        partnerId: this.info.partnerId,
        productId: this.info.productId,
        blackType: 1082
      }
      DeleteProduct(params)
        .then(() => {
          this.$message.success("移除成功")
          this.$delete(this.onshelfBlacklist, index)
        })
        .catch(console.warn)
    },
    // 删除改价黑名单
    handleRemovePrice(index) {
      const params = {
        partnerId: this.info.partnerId,
        productId: this.info.productId,
        blackType: 1087
      }
      DeleteProduct(params)
        .then(() => {
          this.$message.success("移除成功")
          this.$delete(this.changePrices, index)
        })
        .catch(console.warn)
    },
    // 选择日期
    handleSelectDate(val) {
      const now = new Date()
      let day = getDay(now)
      if (day === 0) {
        day = 7
      } 
      // else if (day === 1) {
      //   day = 2
      // }
      let tempDate = []
      switch(val) {
      case "7":
        tempDate.push(subDays(now, day - 1))
        tempDate.push(subDays(now, 0))
        this.dateValue = tempDate
        this.handleGetSaleData()
        tempDate = []
        break
      case "14":
        tempDate.push(subDays(now, (6 + day)))
        tempDate.push(subDays(now, day))
        this.dateValue = tempDate
        this.handleGetSaleData()
        tempDate = []
        break
      case "30":
        tempDate.push(subDays(now, 30))
        tempDate.push(subDays(now, 0))
        this.dateValue = tempDate
        this.handleGetSaleData()
        tempDate = []
        break
      case "90":
        tempDate.push(subDays(now, 90))
        tempDate.push(subDays(now, 0))
        this.dateValue = tempDate
        this.handleGetSaleData()
        tempDate = []
        break
      }
    },
    // 规格删除-天猫
    handleStyleDel(row) {
      const {
        partnerId,
      } = this.info
      SpecificationDelete(partnerId, row.id)
        .then(() => {
          this.$message.success("删除成功")
          this.handleGetStyle()
        })
        .catch(console.warn)
    },
    // 规格恢复-天猫
    handleStyleRecover(row) {
      const {
        partnerId,
      } = this.info
      SpecificationRecover(partnerId, row.id)
        .then(() => {
          this.$message.success("恢复成功")
          this.handleGetStyle()
        })
        .catch(console.warn)
    },
    handleGetSaleData() {
      this.dateValue = this.dateValue || []
      const startDate = this.dateValue[0]
      const endDate = this.dateValue[1]
      if (this.dateValue.length === 0) {
        return false
      }
      GoodsSale({
        partnerId: this.info.partnerId,
        productId: this.info.productId,
        startTime: format(startDate, "yyyy-MM-dd"),
        endTime: format(endDate, "yyyy-MM-dd"),
      })
        .then(({ data }) => {
          this.option.series[0].data = data.map(item => {
            return {
              name: format(new Date(item.saleDate), "yyyy-MM-dd"),
              value: item.saleQuantity,
              ...item
            }
          })
          this.option.xAxis.data = data.map(item => {
            return format(new Date(item.saleDate), "yyyy-MM-dd").slice(5, 10)
          })
        })
        .catch(console.warn)
    }
  },
}
</script>

<style lang="scss" scoped>
.drawer ::v-deep {
  .el-drawer__header span{
    color: #141414;
    font-size: 22px;
  }
  .el-input__inner{
    height: 32px !important;
  }
  .el-tab-pane {
    padding: 16px 0;
  }
}
.id-link{
  text-decoration: none;
  color: #0061D9;
}
.container{
  padding: 0 15px;
  box-sizing: border-box;
  height: calc(100vh - 77px);
  .prod_info{
    box-sizing: border-box;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .prod_item{
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      .prod_label{
        color:#999999;
        font-size: 12px;
        margin-bottom: 10px;
      }
      .prod_content{
        color:#141414;
        font-size: 14px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        .success{
          background-color: #6CD092;
          display:inline-block;
          width:6px;
          height:6px;
          margin-right: 3px;
          border-radius: 50%;
        }
        .info{
          background-color: #D2DDEB;
          display:inline-block;
          width: 6px;
          height: 6px;
          margin-right: 3px;
          border-radius: 50%;
        }
      }
      .tmId{
        color: #0061D9;
      }
    }
    .prod_item + .prod_item{
      margin-left: 30px;
    }
  }
  .title{
    font-size: 16px;
    color: #141414;
    .updateTime{
      color:#999999;
      font-size:12px;
      display:inline-block;
      margin-left:5px
    }
  }
  .dataView{
    width:100%;
    height:450px;
    margin: 15px 0;
    box-sizing: border-box;
  }
  .unstate{
    .dot{
      color: #141414;
      display:inline-block;
      width:5px;
      height: 5px;
      border-radius: 50%;
    }
  }
  .state{
    .dot{
      color: #2486FF;
      display:inline-block;
      width:5px;
      height: 5px;
      border-radius: 50%;
    }
  }
  .lock-icon{
    display:inline-flex;
    position: relative;
    top: 4px;
    font-size: 14px;
    box-sizing: border-box;
    color: #FC5757;
  }
}
</style>
