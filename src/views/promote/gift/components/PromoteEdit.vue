<template>
  <el-drawer
    :visible="visible"
    :title="payload.type === 'detail' ? '查看赠品详情' : '编辑赠品促销'"
    @close="handleClose"
    size="500px"
    class="drawer">
    <el-form :model="giftForm" ref="giftForm" :rules="rules" inline label-width="82px" :disabled="disabled">
      <el-form-item label="选择店铺" prop="partnerId">
        <el-select placeholder="选择店铺" v-model="giftForm.partnerId" size="small" style="width:220px" class="shop-select">
          <el-option
            v-for="(shop, index) in shops"
            :label="shop.partnerName"
            :value="shop.partnerId"
            :key="index">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker
          v-model="giftForm.startTime"
          type="datetime"
          size="small"
          placeholder="开始时间"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss"
          :picker-options="pickerStartOptions"
          style="height:38px">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker
          v-model="giftForm.endTime"
          type="datetime"
          size="small"
          placeholder="结束时间"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss"
          :picker-options="pickerEndOptions"
          style="height:38px">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="主商品" required>
        <div class="set-main-prod">
          <el-form-item label="优惠条件"  style="width:100%">
            <el-radio-group v-model="giftForm.discountType">
              <el-radio :label="1">满件</el-radio>
              <el-radio :label="2" disabled>满元</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="优惠门槛" prop="threshold"  style="width:100%">
            <el-row type="flex" align="middle">
              <span>满</span>
              <el-input
                v-model="giftForm.threshold"
                placeholder="请输入"
                style="width:120px">
                <template #suffix>
                  <span>{{ giftForm.discountType === 1 ? '件' : '元' }}</span>
                </template>
              </el-input>
            </el-row>
          </el-form-item>
        </div>
      </el-form-item>
      <el-form-item required class="set-gift">
        <template #label>
          <label>设置赠品</label>
          <span class="label-tips">（最多添加20个赠品）</span>
        </template>
        <template>
          <el-table :data="giftDetails" style="width:100%">
            <el-table-column label="赠品ID" width="120" align="center">
              <template #default="{ row }">
                <el-input style="width: 100px" v-model="row.giftProductId" @blur="handleGetGiftInfo(row)"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="商品名称" width="130" prop="giftProductName" align="center">
              <template #default="{ row }">
                <div class="productName" :title="row.giftProductName" v-if="row.giftProductName">
                  {{ row.giftProductName }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="数量" align="center">
              <template #default="{ row }">
                <el-input style="width: 80px" v-model="row.giftCount"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60">
              <template #default="{ $index }">
                <el-button type="text" @click="handleRemoveRow($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="add-promote" @click="handleAddGift" v-if="!disabled && giftDetails.length < 20">
            <i class="el-icon-plus"></i>添加
          </div>
        </template>
      </el-form-item>
      <el-form-item label="设置主品" prop="mainProducts">
        <el-input
          type="textarea"
          :autosize="{ minRows: 5 }"
          v-model="giftForm.mainProducts"
          placeholder="请输入主品ID，最多添加20个主品，多个主品请用回车换行隔开。"
          style="width:413px"
          v-if="payload.type === 'edit'">
        </el-input>
        <el-table :data="mainProducts" style="width:450px" v-else>
          <el-table-column label="主品ID" width="140" align="center">
            <template #default="{ row }">
              <el-input style="width: 100px" v-model="row.productId" disabled></el-input>
            </template>
          </el-table-column>
          <el-table-column label="商品名称" prop="productName" align="center">
            <template #default="{ row }">
              <div class="productName" :title="row.productName" v-if="row.productName">
                {{ row.productName }}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>

    <el-row type="flex" justify="center" style="margin-top:120px">
      <el-button type="primary" size="small" @click="hanldleSubmitGift" v-if="payload.type === 'edit'">提交</el-button>
      <el-button type="info" size="small" @click="handleClose">{{ payload.type === 'edit' ? '取消' : '关闭' }}</el-button>
    </el-row>
  </el-drawer>
</template>

<script>
import {
  GoodsShops,
} from '@/api/goods/list';
import {
  GiftActDetail,
  GiftActUpdate,
  GiftInfoGet
} from '@/api/promote/gift';
import {
  hasValue,
  filterSpace
} from '@/util';

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    payload: {
      type: Object,
      default: () => ({})
    },
  },
  watch: {
    visible(val) {
      val && this.getShops()
    }
  },
  data() {
    const validateProductIds = (_, value, callback) => {
      if (!value.match(/^[\d\n\r\s]*$/)) {
        callback(new Error('主品ID输入格式错误'))
      } else {
        const ids = value.trim().split(/[\n\r]/).filter(item => item);
        if (ids.length > 20) {
          callback(new Error('最多可添加20个主品'))
        } else {
          callback()
        }
      }
    };
    return {
      giftForm: {
        partnerId: '',
        startTime: '',
        mainProducts: '',
        endTime: '',
        threshold: '',
        discountType: 1,
      },
      shops: [],
      giftDetails: [
        { giftProductId: '', giftProductName: '', giftCount: '' }
      ],
      mainProducts: [],
      pickerStartOptions: {
        disabledDate(date) {
          return date.getTime() < (new Date().getTime() - 24 * 3600 * 1000)
        },
      },
      pickerEndOptions: {
        disabledDate(date) {
          return date.getTime() < (new Date().getTime() - 24 * 3600 * 1000)
        },
      },
      rules: {
        partnerId: [
          { required: true, message: '请选择店铺', trigger: 'blur' }
        ],
        startTime: [
          { required: true, message: '请选择开始时间', trigger: 'blur' }
        ],
        mainProducts: [
          { required: true, message: '请输入主商品ID', trigger: 'blur' },
          { validator: validateProductIds, trigger: 'blur' }
        ],
        endTime: [
          { required: true, message: '请选择结束时间', trigger: 'blur' }
        ],
        discountType: [
          { required: true, message: '请选择优惠条件', trigger: 'change' }
        ],
        threshold: [
          { required: true, message: '请输入优惠门槛', trigger: 'blur' }
        ],
      },
    }
  },
  computed: {
    disabled() {
      return this.payload.type === 'detail'
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
      this.giftDetails = [{ giftProductId: '', giftProductName: '', giftCount:'' }];
      this.$refs.giftForm.resetFields();
      this.$refs.giftForm.clearValidate();
    },
    getShops() {
      GoodsShops()
        .then(({ data }) => {
          this.shops = data && data.length ? data.filter(shop => shop.groupType === 1) : [];
          this.getEditDetail();
        })
        .catch(console.warn);
    },
    // 赠品详情
    getEditDetail() {
      GiftActDetail(this.payload.taskId)
        .then(({ data }) => { 
          if (this.payload.type === 'detail') {
            this.giftForm = {
              ...data,
              mainProducts: ''
            };
            this.mainProducts = data.mainProducts;
          } else {
            this.giftForm = {
              ...data,
              mainProducts: data.mainProducts.length ? data.mainProducts.map(item => item.productId).join('\n') : ''
            }
          }
          this.giftDetails = data.giftDetails;
        })
        .catch(console.warn)
    },
    // 增加赠品行
    handleAddGift() {
      this.giftDetails.push({
        giftProductId: '',
        giftProductName: '',
        giftCount: ''
      })
    },
    // 删除赠品行
    handleRemoveRow(index) {
      this.giftDetails.splice(index, 1);
    },
    // 获取赠品信息
    handleGetGiftInfo(row) {
      const pid = filterSpace(row.giftProductId);
      if (!hasValue(pid)) return
      GiftInfoGet(this.giftForm.partnerId, row.giftProductId)
        .then(({ data }) => {
          row.giftProductId = data.productId;
          row.giftProductName = data.productName;
        })
        .catch(console.warn)
    },
    giftUpdateEdit() {
      const data = {
        taskId: this.payload.taskId,
        ...this.giftForm
      };
      if (data.mainProducts) {
        const ids = data.mainProducts.trim().split(/[\n\r]/).filter(item => item);
        data.mainProducts = ids.join(',');
      }
      if (this.giftDetails.length) {
        const giftDetails = this.giftDetails.filter(item => (item.giftProductId && item.giftProductName && hasValue(item.giftCount)));
        if (!giftDetails.length) {
          return this.$message.warning('至少填写完整一条赠品信息')
        } else {
          const isCount = giftDetails.every(item => `${item.giftCount}`.match(/^[\d]*$/));
          if (!isCount) {
            return this.$message.warning('存在某条赠品数量非数字，请重新填写')
          }
        }
        data.giftDetails = giftDetails;
      } else return this.$message.warning('至少填写完整一条赠品信息')
      GiftActUpdate(data)
        .then(() => {
          this.$message.success('赠品促销编辑成功');
          this.handleClose();
          this.$emit('refresh');
        })
        .catch(console.warn)
    },
    // 提交
    hanldleSubmitGift() {
      this.$refs.giftForm.validate(valid => {
        if (valid) {
          this.giftForm.threshold = this.giftForm.threshold + '';
          if (this.giftForm.discountType === 1) {
            if (!this.giftForm.threshold.match(/^[\d]*$/)) {
              return this.$message.warning('满件数需为不小于零的整数')
            }
            if (!Number.isInteger(+this.giftForm.threshold)) {
              return this.$message.error('满件数需为不小于零的整数')
            } else {
              if (+this.giftForm.threshold < 0) {
                return this.$message.error('满件数需为不小于零的整数')
              }
            }
          } else {
            if (!this.giftForm.threshold.match(/^[\d.]*$/)) {
              return this.$message.warning('满元数需为大于等于零的数字')
            }
            if (+this.giftForm.threshold < 0) {
              return this.$message.error('满元数不能小于零')
            }
          }
          const diffTime = new Date(this.giftForm.endTime).getTime() - new Date(this.giftForm.startTime).getTime();
          if (diffTime < 15 * 60 * 1000) {
            return this.$message.error('开始时间和结束时间最小差值15分钟')
          }
          this.giftUpdateEdit()
        }
      })
    }
  },
}
</script>

<style lang="scss" scoped>
.promote-title{
  font-size: 16px;
  margin-bottom: 16px;
  font-weight: 600;
}
.add-promote {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  margin: 8px 10px 16px;
  border: 1px dashed #C1C1C1;
  border-radius: 5px;
  font-size: 14px;
  color: #999999;
  cursor: pointer;
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
  }
  .el-input__suffix {
    line-height: inherit;
  }
}
.set-main-prod {
  margin-left: 70px;
}
.set-gift::v-deep{
  .el-form-item__label{
    width: 450px !important;
    text-align: left;
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
</style>