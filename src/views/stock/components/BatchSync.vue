<template>
<el-drawer
  title="批量同步"
  :visible="drawer"
  @close="handleClose"
  @open="queryForm.productIds = ''"
  size="400px">
  <div class="stock-wrapper">
    <div class="drawer-form">
      <el-form ref="queryForm" label-position="top" :model="queryForm" :rules="rules">
        <el-form-item label="选择店铺" prop="partnerId">
          <el-select placeholder="选择店铺" v-model="queryForm.partnerId" style="width:250px">
            <el-option
              v-for="(shop, index) in shops"
              :label="shop.partnerName"
              :value="shop.partnerId"
              :key="index">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="productIds">
          <template #label>
            <span>录入商品ID</span>
            <div class="label-tip">多个商品ID请用 “换行” 隔开，最多支持100品批量同步</div>
          </template>
          <el-input
            type="textarea"
            v-model="queryForm.productIds"
            :autosize="{ minRows: 5 }">
          </el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="drawer-footer">
      <el-button plain @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleCreateTask">提交</el-button>
    </div>
  </div>
</el-drawer>
</template>

<script>
import {
  BatchStockSync,
} from "@/api/stock"
import{
  local
} from "@/util"

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    shops: {
      type: Array,
      default: () => []
    },
    pickShop: [String, Number],
  },
  data() {
    const validatePids = (_, value, callback) => {
      if (!/^(?:\d+[\n\r]\s*)*\d+\s*$/.test(value)) {
        callback(new Error("ID格式不正确"))
      } else if (value.trim().split(/[\n\r]\s*/).length > 100) {
        callback(new Error("最多支持发布100品"))
      } else callback()
    }
    return {
      queryForm: {
        pratnerId: "",
        productIds: "",
      },
      rules: {
        partnerId: [
          { required: true, message: "请选择店铺", trigger: "change" }
        ],
        productIds: [
          { required: true, message: "请录入商品ID", trigger: "blur" },
          { validator: validatePids, trigger: "blur" }
        ],
      },
      tempProductIds: "",
    }
  },
  computed: {
    drawer: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit("update:visible", val)
      }
    },
    groupType() {
      const findedShop = this.shops.find(shop => shop.partnerId === this.queryForm.partnerId)
      return findedShop ? findedShop.groupType : ""
    },
  },
  watch: {
    pickShop() {
      this.queryForm.partnerId = Number(this.pickShop)
    },
  },
  methods: {
    handleClose() {
      this.$refs.queryForm.clearValidate()
      local.set("ids", this.queryForm.productIds)
      this.drawer = false
    },
    handleCreateTask() {
      this.$refs.queryForm.validate(valid => {
        if (valid) {
          const data = {
            partnerId: this.queryForm.partnerId,
            productIds: this.queryForm.productIds.split(/[\n\r]\s*/).filter(i => i)
          }
          BatchStockSync(data)
            .then(() => {
              this.$message.success("库存批量同步任务提交成功")
              this.handleClose()
              this.$emit("refresh")
            })
            .catch(console.warn)
        }
      })
    },
  },
}
</script>

<style lang="scss">
.v-modal {
  z-index: 2008 !important;
}
.el-drawer__wrapper {
  z-index: 2009 !important;
}
</style>

<style lang="scss" scoped>
.stok-flex {
  display: flex;
  flex-direction: row;
  align-items: center;
  &.center {
    justify-content: center;
  }
}
.stock-ctrl {
  text-align: center;
  padding: 10px 0px;
  border: 1px solid #eee;
  margin: 10px 0px;
  color: #fc5757;
  border-radius: 7px;
  cursor: pointer;
  &:active {
    opacity: 0.8;
  }
}
.stock-wrapper {
  display: flex;
  flex-direction: column;
  padding: 0 24px;
  height: calc(100vh - 62px);
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  .stock-list {
    &-header {
      height: 50px;
      line-height: 50px;
      background: #f3f5f6;
    }
    &-item {
      border: 1px solid #ebeef5;
      border-top: 0px;
      box-sizing: border-box;
    }
  }
  .stock-row {
    &-col {
      height: 50px;
      min-width: 90px;
      text-align: center;
    }
  }
  .stock-name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.stock-lock-tip {
  color: #fc5757;
  width: 60px;
  font-size: 12px;
  white-space: nowrap;
}
.stock-lock-error {
  color: #fc5757;
  width: 220px;
  font-size: 12px;
  overflow: hidden;
  white-space: nowrap;
}
.drawer-tabs {
  flex: none;
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #fff;
}
.drawer-form {
  flex: 1;
  padding: 24px 0;
}
.drawer-footer {
  flex: none;
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 86px;
  background-color: #fff;
  border-top: 1px solid #EEEEEE;
}
.label-tip {
  color: #999999;
  font-size: 12px;
}
.link {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  color: #0061D9;
  text-decoration: none;
  vertical-align: top;
  cursor: pointer;
  .link-icon {
    margin-right: 6px;
    font-size: 20px;
  }
}
</style>