<template>
  <div class="activity-wrapper">
    <el-form class="my-item-form" ref="form" label-width="80px" inline v-if="action !== '1'">
      <el-row type="flex" justify="space-between">
        <div class="flex-left">
          <el-button @click="addProduct">添加主商品</el-button>
        </div>
      </el-row>
    </el-form>
    <el-row type="flex" justify="start" align="middle">
      <div class="title">主商品列表</div>
    </el-row>
    <el-table
      :data="list"
      :header-cell-style="{'background-color': '#f5f7fa'}"
      v-loading="loading"
      style="width: 100%">
      <el-table-column
        align="center"
        prop="mainProductId"
        label="当当商品ID"
        width="150">
      </el-table-column>
      <el-table-column
        align="center"
        prop="mainProductId"
        label="店铺商品ID"
        width="150">
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
        width="150">
      </el-table-column>
      <el-table-column
        align="center"
        prop="platformStockNum"
        label="店铺库存"
        width="150">
      </el-table-column>
      <el-table-column
        align="center"
        prop="action"
        width="225"
        label="操作">
        <template slot-scope="scope">
          <div
            class="button-ctrl"
            @click="handleToSet(scope.row.mainProductId)">
            {{ action === '1' ? '查看单品阶梯赠' : '设置单品阶梯赠' }}({{ scope.row.stageNum}})
          </div>
          <div
            @click="deleteRow(scope.row)"
            class="button-ctrl-danger"
            v-if="action !== '1'">
            删除
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-row type="flex" justify="center" style="margin-top: 20px;">
      <el-button type="primary" size="medium" ref="finish" @click="handleToPromo()" v-if="action !== '1'">保存</el-button>
      <el-button size="medium" @click="handleToPromo" v-if="action !== '1'">取消</el-button>
    </el-row>
  </div>
</template>

<script>

import { MainProductList, DeleteMainProduct, SaveMainProduct } from "@/api/live"

export default {
  data: () => {
    return {
      list: [],
      loading: false,
    }
  },
  computed: {
    action: function() {
      return this.$route.params.action
    }
  },
  created() {
    this.getMainProductList()
  },
  methods: {
    getMainProductList() {
      const {
        liveId
      } = this.$route.params
      this.loading = true
      MainProductList({
        liveId:liveId
      }).then(data => {
        if (data.code !== 200) {
          this.$message.error(data.data.msg)
        } else {
          this.list = data.data
          if (this.list.length > 0) {
            this.$refs.finish.$el.style.display = "inline"
          } else {
            this.$refs.finish.$el.style.display = "none"
          }
        }
      }).finally(() => {
        this.loading = false
      })
    },

    deleteRow(row) {
      this.$confirm("确定取消删除吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.deleteRowData(row)
      })
    },

    deleteRowData(row){
      const {
        liveId
      } = this.$route.params
      DeleteMainProduct({
        liveId: liveId,
        promoType: 2,
        mainProductIds : row.mainProductId
      }).then(data =>{
        if (data.code === 200) {
          this.getMainProductList()
          this.$message.success("已删除数据")
        }
      })
    },

    addProduct () {
      const {
        liveId
      } = this.$route.params
      let _this = this
      const h = _this.$createElement
      _this.$msgbox({
        title: "添加主商品",
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
              id:"mainProduct",
              placeholder: "请输入要添加的商品ID，多个商品ID请用英文逗号隔开",
            },
            value: _this.mainProduct,
            on: { input: _this.onCommentInputChange }
          })
        ]),
        showCancelButton: true,
        closeOnClickModal: false,
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        beforeClose: (action, instance, done) => {
          if (action === "confirm") {
            if (_this.mainProduct === "" || _this.mainProduct === undefined) {
              this.$message.error("请至少维护一个商品")
            }else {
              SaveMainProduct(
                {
                  liveId: liveId,
                  promoType: 2,
                  mainProductIds: _this.mainProduct
                }
              ).then(data => {
                if (data.code !== 200 || data.data === "SYSTEM_ERROR") {
                  this.$message.error(data.message)
                } else {
                  this.getMainProductList()
                  done()
                }
              })
            }
          } else {
            done()
          }
        }
      }).finally(()=>{
        _this.mainProduct = ""
        document.getElementById("mainProduct").value = ""
      })
    },
   
    onCommentInputChange() {
      this.mainProduct = document.getElementById("mainProduct").value
    },

    handleToSet(mainProductId) {
      const {
        liveId,
        action,
      } = this.$route.params
      this.$router.push(`/living/product/stage/set/${action}/${liveId}/${mainProductId}`)
    },

    handleToPromo() {
      this.$router.back()
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
    .el-row {
      margin-bottom: 15px;
    }
  }
</style>
