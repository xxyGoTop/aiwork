<template>
  <el-drawer
    :visible="visible"
    :title="ty === 'add' ? '新增商品嫁接' : '更新商品嫁接'"
    @close="handleClose"
    size="750px"
    :destroy-on-close="true"
    class="drawer">
    <el-form :model="graftForm" ref="graftForm" :rules="rules" inline label-width="82px">
      <el-form-item label="选择店铺" prop="partnerId">
        <el-select placeholder="选择店铺" v-model="graftForm.partnerId" :disabled="ty === 'edit'" style="width:220px">
          <el-option
            v-for="(shop, index) in shops"
            :label="shop.partnerName"
            :value="shop.partnerId"
            :key="index">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item required class="set-gift">
        <template #label>
          <label>商品嫁接</label>
          <span class="label-tips">（最多添加20个商品）</span>
          <div class="label-tips" style="width:700px">（天猫商品嫁接时，一个当当ID对应多个外平台ID时，多个外平台ID的物流宝ID均会解绑，请手动到天猫后台绑定物流宝ID）</div>
        </template>
        <el-table
          :data="graftData">
          <el-table-column label="原始当当ID" prop="productId" align="center">
            <template #default="{ row, $index }" v-if="ty === 'add'">
              <el-input
                style="width: 100px"
                v-model="row.productId"
                :disabled="!!row.disabled"
                @blur="handleGetInfo(row, $index)">
              </el-input>
            </template>
          </el-table-column>
          <el-table-column label="外平台SPUID" prop="outerSpuId" align="center"></el-table-column>
          <el-table-column label="外平台SKUID" prop="outerSkuId" align="center"></el-table-column>
          <el-table-column label="商品名称" align="center">
            <template #default="{ row }">
              <div class="productName" :title="row.productName" v-if="row.productName">
                {{ row.productName }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="原始嫁接当当ID" prop="oldGraftProductId" align="center" v-if="ty === 'edit'"></el-table-column>
          <el-table-column label="嫁接当当ID" width="120" align="center">
            <template #default="{ row }">
              <el-input style="width: 100px" v-model="row.graftProductId"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="60" v-if="ty === 'add'">
            <template #default="{ row, $index }">
              <el-button
                type="text"
                @click="handleRemoveRow(row, $index)"
                v-if="graftData.length > 1">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="add-row" @click="handleAddGift" v-if="graftData.length < 20 && ty === 'add'">
          <i class="el-icon-plus"></i>添加
        </div>
      </el-form-item>
    </el-form>

    <el-row type="flex" justify="center" style="margin-top:120px">
      <el-button type="primary" size="small" @click="hanldleSubmitGift" :loading="submitLoading">提交</el-button>
      <el-button type="info" size="small" @click="handleClose">取消</el-button>
    </el-row>
  </el-drawer>
</template>

<script>
import {
  CreateGraftTask,
  EditGraftTask,
  GetGraftInfo,
} from '@/api/goods/graft';
import {
  hasValue,
  filterSpace
} from '@/util';

const graftRow = {
  productId: '',
  graftProductId: '',
  outerSpuId: '',
  outerSkuId: '',
  productName: '',
};

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    shopId: {
      type: Number,
      default: 0
    },
    shops: {
      type: Array,
      default: () => []
    },
    ty: {
      type: String,
      default: 'add'
    },
    payload: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      graftForm: {
        partnerId: '',
      },
      graftData: [],
      rules: {
        partnerId: [
          { required: true, message: '请选择店铺', trigger: 'blur' }
        ],
      },
      submitLoading: false,
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.graftForm.partnerId = this.shopId;
        this.graftData.push(this.ty === 'edit' ? this.payload : {...graftRow});
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
      this.graftData = [];
      this.$refs.graftForm.clearValidate();
    },
    // 增加行
    handleAddGift() {
      this.graftData.push({...graftRow})
    },
    // 删除行
    handleRemoveRow(row, index) {
      console.log(row, index)
      // 多sku捆绑联动删除逻辑
      // if (row.order > 1 && row.order < row.newNum) {
      //   for (let i = 1; i < row.order - 1; i++) {
      //     this.graftData[index - i].newNum = row.newNum - 1;
      //   }
      //   for (let i = 1; i < row.newNum - row.order + 1; i++) {
      //     this.graftData[index + i].newNum = row.newNum - 1;
      //   }
      // } else if (row.order === 1) {
      //   for (let i = 1; i < row.newNum; i++) {
      //     this.graftData[index + i].newNum = row.newNum - 1;
      //   }
      // } else if (row.order === row.newNum) {
      //   for (let i = 1; i < row.newNum; i++) {
      //     this.graftData[index - i].newNum = row.newNum - 1;
      //   }
      // }
      this.graftData.splice(index, 1);
    },
    // 获取商品信息
    handleGetInfo(row, index) {
      const pid = filterSpace(row.productId);
      if (!hasValue(pid)) return
      GetGraftInfo({
        partnerId: this.graftForm.partnerId,
        productId: row.productId
      })
        .then(({ data }) => {
          // 多sku捆绑联动删除逻辑
          // data.forEach((item, i) => {
          //   item.order = i + 1;
          //   item.newNum = data.length;
          //   if (i !== 0) {
          //     item.disabled = true;
          //   }
          // })
          // 由接口数据更新数据行
          if (data && data.length) {
            this.graftData.splice(index, row.newNum ? row.newNum : 1 , ...data);
          }
        })
        .catch(console.warn)
    },
    // 响应消息处理
    processResMsg(promise) {
      console.log(promise);
      promise
        .then(({ data }) => {
          if (Object.keys(data).length) {
            let errMsg = '';
            for (const [key, value] of Object.entries(data)) {
              errMsg += `${key}：${value}\n`
            }
            return this.$message.error(errMsg)
          }
          this.$message({
            message: `商品嫁接任务${ this.ty === 'add' ? '创建' : '更新' }成功`,
            type: 'success',
            duration: 1500,
          });
          setTimeout(() => {
            this.handleClose();
            this.$emit('refresh');
          }, 1500)
        })
        .catch(console.warn)
        .finally(() => {
          this.submitLoading = false;
        })
    },
    // 创建信息
    createGiftRequest() {
      const data = {
        partnerId: this.graftForm.partnerId,
      };
      const giftDetails = this.graftData.filter(item => (item.productId && item.graftProductId));
      if (!giftDetails.length) return this.$message.warning('至少填写完整一条嫁接商品信息')
      data.graftAddDetails = this.graftData.map(item => {
        return {
          oldProductId: item.productId,
          outerDangProductId: item.outerDangProductId,
          graftProductId: item.graftProductId
        }
      })
      if (this.submitLoading) return
      this.submitLoading = true;
      this.ty === 'add' ? this.processResMsg(CreateGraftTask(data)) : this.processResMsg(EditGraftTask(data))
    },
    // 提交
    hanldleSubmitGift() {
      this.$refs.graftForm.validate(valid => {
        if (valid) {
          this.createGiftRequest()
        }
      })
    }
  },
}
</script>

<style lang="scss" scoped>
.add-row {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  margin: 8px 10px 16px;
  border: 1px dashed #C1C1C1;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  color: #fc5757;
}
.time-item{
  position: relative;
  left: -10px;
}
.label-tips{
  color: #606266e6;
  font-size: 12px;
}
.drawer::v-deep {
  .el-drawer__body{
    padding: 16px;
    overflow-x: hidden;
  }
  .el-input__suffix {
    line-height: inherit;
  }
}
.set-gift::v-deep{
  .el-form-item__label{
    width: 450px !important;
    text-align: left;
    position: relative;
    left: 3px;
  }
  .el-form-item__content{
    width: 100%;
  }
}
.productName{
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.block-label{
  padding-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
}
</style>