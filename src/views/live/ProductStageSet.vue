<template>
  <div class="activity-wrapper">
    <el-row type="flex" justify="start" align="middle">
      <div class="title">单品阶梯赠</div>
    </el-row>
    <div v-for="(t, index) in list" :key="index" style="margin-bottom: 30px">
      <div style="margin-bottom: 15px;margin-left: 0">
        <label style="display: inline-block; font-size: 15px">{{index+1}}.</label>
        <label>商品编码<span style="font-size: 14px">{{mainProductId}}</span>,赠送以下商品</label>
      </div>
      <el-table
        :data="t.giftProductInfoVoList"
        v-loading="loading"
        border
        style="width:100%; margin:0 auto">
        <el-table-column >
          <template slot="header">
            <el-row type="flex" justify="space-between" align="middle">
              <div class="flex-left">
                <my-input :stage='t.stageStartIndex' :index="index" :disabled="action === '1'" @change="changeStageStart"></my-input>
                <span style='margin-left: 20px'>至</span>
                <my-input :stage='t.stageEndIndex' :index="index" :disabled="action === '1'" @change="changeStageEnd" style='margin-left: 20px;'></my-input>
                <span style='margin-left: 10px'>单送商品</span>
              </div>
              <div class="flex-right" v-if="action !== '1'">
                <div
                  @click="deleteStage(index)"
                  class="button-ctrl">
                  删除阶梯
                </div>
                <div class="button-ctrl" style='margin-right: 20px' @click="addGiftProduct(index)">
                  添加赠品
                </div>
              </div>
            </el-row>
          </template>
          <el-table-column width="100">
            <template slot-scope="scope">
              {{scope.$index + 1}}
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            prop="giftProductId"
            label="赠品ID"
            width="100">
          </el-table-column>
          <el-table-column
            align="center"
            prop="giftProductName"
            label="赠品信息">
            <template slot-scope="scope">
              <div style="text-align: left;">{{ scope.row.giftProductName }}</div>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            prop="giftProductPrice"
            label="当当价（元）"
            width="200">
            <template slot-scope="scope">
              {{ scope.row.giftProductPrice }}元
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            prop="ddStockNum"
            label="当当库存"
            width="200">
          </el-table-column>
          <el-table-column
            align="center"
            prop="num"
            label="每单赠赠品数量"
            width="160">
            <template slot="header">
              <span style="padding-right: 2px;">每单赠赠品数量</span>
              <el-tooltip effect="dark" content="赠品数量是指满足赠送要求时，每单所赠送的数量" placement="right">
                <i class="el-icon el-icon-question"></i>
              </el-tooltip>
            </template>
            <template slot-scope="scope">
              <el-input-number v-model="scope.row.num" :min="1" :max="5" :disabled="action === '1'"></el-input-number>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            prop="action"
            width="150"
            label="操作"
            v-if="action !== '1'">
            <template slot-scope="scope">
              <ediv
                @click="deleteGiftProduct(index,scope.row)"
                class="button-ctrl">
                删除
              </ediv>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>
    </div>
    <div style="text-align: left" v-if="action !== '1'">
      <el-button size="medium" type="primary" @click="addStage">添加一级阶梯优惠</el-button>
    </div>
    <div style="text-align: center" v-if="action !== '1'">
      <el-button size="medium" type="primary" @click="save">保存</el-button>
      <el-button size="medium" @click="cancel">取消</el-button>
    </div>
  </div>
</template>

<script>
import MyInput from "./components/MyInput"
import { StageGiftInfoList, GiftInfo, SaveProductStage } from "@/api/live"

export default {
  components: {
    MyInput,
  },

  data: () => {
    return {
      list: [],
      loading: false,
      giftProductIds: "",
      mainProductId: "",
    }
  },

  computed: {
    action: function() {
      return this.$route.params.action
    }
  },

  created() {
    this.getStageGiftList()
  },

  methods: {
    changeStageStart(obj) {
      const { value, index } = obj
      const list = this.list
      const stage = list[index]
      this.$set(this.list, index, { ...stage, stageStartIndex: value })
    },
    changeStageEnd(obj) {
      const { value, index } = obj
      const list = this.list
      const stage = list[index]
      this.$set(this.list, index, { ...stage, stageEndIndex: value })
    },
    getStageGiftList() {
      const {
        liveId,
        mainProductId
      } = this.$route.params
      this.mainProductId = mainProductId
      StageGiftInfoList({
        liveId: liveId,
        promoType: 2,
        mainProductIds: mainProductId
      }).then(data => {
        if (data.data && data.data.length) {
          this.list = data.data.map(d => ({ ...d, mainProductId: mainProductId, promoType: 2 }))
        } else {
          this.list = []
        }
      })
    },
    deleteStage(index) {
      this.list.splice(index, 1)
    },
    deleteGiftProduct(index, row) {
      let giftProductInfoVoList = this.list[index]["giftProductInfoVoList"]
      let gIndex = giftProductInfoVoList.indexOf(row)
      giftProductInfoVoList.splice(gIndex, 1)
      if (giftProductInfoVoList.length === 0) {
        this.list.splice(index, 1)
      }
    },
    addStage(){
      const {
        liveId,
        mainProductId
      } = this.$route.params
      this.list.push({
        giftProductInfoVoList: [],
        liveId: liveId,
        mainProductId: mainProductId,
        promoType: 2,
        stageEndIndex: null,
        stageStartIndex: null,
      })
    },
    handleReset() {
      this.$refs.form.resetFields()
    },
    addGiftProduct (index) {
      let _this = this
      const h = _this.$createElement
      _this.$msgbox({
        title: "添加商品",
        message: h("div", {
          attrs: {
            class: "el-textarea",
          },
        }, [
          h("textarea", {
            attrs: {
              class: "el-textarea__inner",
              autocomplete: "off",
              rows: 8,
              id:"giftProductIds",
              placeholder: "请输入要添加的商品ID，多个商品ID请用英文逗号隔开",
            },
            value: _this.giftProductIds,
            on: { input: _this.onCommentInputChange }
          })
        ]),
        showCancelButton: true,
        closeOnClickModal: false,
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        beforeClose: (action, _, done) => {
          if (action === "confirm") {
            if (_this.giftProductIds === "" || _this.giftProductIds === undefined) {
              this.$message.error("请至少维护一个商品")
            }else {
              GiftInfo(
                { productIds: _this.giftProductIds }
              ).then(data => {
                if (data.code !== 200) {
                  this.$message.error(data.message)
                } else {
                  let gift = data.data
                  let giftProductInfoVoList = this.list[index]["giftProductInfoVoList"]
                  let giftProductIds = giftProductInfoVoList.map(g => g.giftProductId)
                  gift.forEach((v) => {
                    if (giftProductIds.indexOf(v.giftProductId) === -1) {
                      giftProductInfoVoList.push(v)
                    }
                  })
                  done()
                }
              })
            }
            //done();
          } else {
            done()
          }
        }
      }).finally(()=>{
        _this.giftProductIds = ""
        document.getElementById("giftProductIds").value = ""
      })
    },
    onCommentInputChange() {
      this.giftProductIds = document.getElementById("giftProductIds").value
    },
    save() {
      const {
        liveId,
      } = this.$route.params
      SaveProductStage(this.list, {
        promoType: 2,
        liveId,
      }).then(data => {
        if (data.code === 200 && data.data !== "SYSTEM_ERROR") {
          this.$message.success("保存成功")
          this.$router.back()
        }
      })
    },
    cancel() {
      this.$router.back()
    }
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
  .el-row {
    margin-bottom: 15px;
  }
  .el-table th>.cell {
    width: 100%;
  }
}
</style>
