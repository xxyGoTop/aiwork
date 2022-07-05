<template>
  <el-drawer
    :visible="visible"
    title="新增赠品促销"
    @close="handleClose"
    size="500px"
    class="drawer">
    <el-form :model="giftForm" ref="giftForm" :rules="rules" inline label-width="82px">
      <div class="block-label">基本信息</div>
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
      <el-form-item label="活动名称" prop="taskName">
        <el-input v-model="giftForm.taskName" placeholder="请输入活动名称"  style="width:220px"></el-input>
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
      <div class="block-label">优惠门槛和内容</div>
      <el-form-item label="优惠条件" required style="width:100%">
        <el-radio-group v-model="giftForm.discountType" @change="giftForm.threshold = ''">
          <el-radio :label="1">满件</el-radio>
          <el-radio :label="2" disabled>满元</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="优惠门槛" prop="threshold" style="width:100%">
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
      <el-form-item required class="set-gift">
        <template #label>
          <label>设置赠品</label>
          <span class="label-tips">（最多添加20个赠品）</span>
        </template>
        <el-table :data="giftData" style="width:100%">
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
        <div class="add-promote" @click="handleAddGift" v-if="giftData.length < 20">
          <i class="el-icon-plus"></i>添加
        </div>
      </el-form-item>
      <div class="block-label">选择商品</div>
      <el-form-item label="设置主品" prop="mainProducts">
        <el-input
          type="textarea"
          :autosize="{ minRows: 5 }"
          v-model="giftForm.mainProducts"
          placeholder="请输入主品ID，最多添加20个主品，多个主品请用回车换行隔开。"
          style="width:413px">
        </el-input>
      </el-form-item>
    </el-form>

    <el-row type="flex" justify="center" style="margin-top:120px">
      <el-button type="primary" size="small" @click="hanldleSubmitGift">提交</el-button>
      <el-button type="info" size="small" @click="handleClose">取消</el-button>
    </el-row>
  </el-drawer>
</template>

<script>
import {
  GiftCreate,
  GiftInfoGet
} from '@/api/promote/gift';
import {
  GoodsShops,
} from '@/api/goods/list';
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
  data() {
    const _this = this;
    const validateProductIds = (_, value, callback) => {
      if (!value.match(/^[\d\n\r\s]*$/)) {
        callback(new Error('主品ID输入格式错误'))
      } else {
        const ids = value.trim().split(/[\n\r]/).filter(item => item);
        console.log(value.trim().split(/[\n\r]/), ids)
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
        taskName: '',
        startTime: '',
        mainProducts: '',
        endTime: '',
        threshold: '',
        discountType: 1,
        taskType: 116,
      },
      shops: [],
      giftData: [
        { giftProductId: '', giftProductName: '', giftCount:'' }
      ],
      pickerStartOptions: {
        disabledDate(date) {
          return date.getTime() < (new Date().getTime() - 24 * 3600 * 1000)
        },
      },
      pickerEndOptions: {
        disabledDate(date) {
          return _this.disabledDate(date)
        },
      },
      rules: {
        partnerId: [
          { required: true, message: '请选择店铺', trigger: 'blur' }
        ],
        taskName: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
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
        discountType:  [
          { required: true, message: '请选择优惠条件', trigger: 'change' }
        ],
        threshold:  [
          { required: true, message: '请输入优惠门槛', trigger: 'blur' }
        ],
      },
    }
  },
  watch: {
    visible(val) {
      val && this.getShops()
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
      this.giftData = [{ giftProductId: '', giftProductName: '', giftCount:'' }];
      this.$refs.giftForm.resetFields();
      this.$refs.giftForm.clearValidate();
    },
    disabledDate(date) {
      const end = new Date(this.giftForm.startTime).getTime();
      return date.getTime() < end || !this.giftForm.startTime
    },
    getShops() {
      GoodsShops()
        .then(({ data }) => {
          this.shops = data && data.length ? data.filter(shop => shop.groupType === 1) : [];
          this.giftForm.partnerId = this.payload.partnerId;
        })
        .catch(console.warn);
    },
    // 增加赠品行
    handleAddGift() {
      this.giftData.push({
        giftProductId: '',
        giftProductName: '',
        giftCount: ''
      })
    },
    // 删除赠品行
    handleRemoveRow(index) {
      this.giftData.splice(index, 1);
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
    // 批量添加
    // bacthBeforeUpload(file) {
    //   let message = '';
    //   if (file.size > 500 * 1024 * 1024) {
    //     message = '文件不能大于500M';
    //   }
    //   const fileTypes = [
    //     'application/vnd.ms-excel',
    //     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //     'xls',
    //     'xlsx',
    //   ];
    //   if (!acceptTypes(file, ...fileTypes)) {
    //     message = '只能上传.xlsx, .xls格式文件';
    //   }
    //   // 文件是否通过检测
    //   if (message) {
    //     this.$message.warning(message);
    //     return false;
    //   }
    // },
    // batchUploadRequest(options) {
    //   const formData = new FormData();
    //   formData.append('uploadFile', options.file);
    // },
    // uploadRequest(options) {
    //   this.isUploadLoading = true;
    //   const formData = new FormData();
    //   formData.append('uploadFile', options.file);
      // UploadFile(formData)
      //   .then(({ data }) => {
      //     options.onSuccess(data, options.file, [options.file]);
      //     this.$message.success('上传成功');
      //   })
      //   .catch((error) => {
      //     options.onError(error);
      //   })
      //   .finally(() => {
      //     this.isUploadLoading = false;
      //   });
    // },
    // 创建赠品信息
    createGiftRequest() {
      const {
        taskName,
        startTime,
        endTime,
        partnerId,
        taskType,
        discountType,
        threshold,
        mainProducts
      } = this.giftForm;
      const data = {
        startTime,
        endTime,
        partnerId,
        taskType,
        taskName,
      };
      const queryCondition = Object.create(null);
      queryCondition.discountType = discountType;
      queryCondition.threshold = threshold;
      if (mainProducts) {
        const ids = mainProducts.trim().split(/[\n\r]/).filter(item => item);
        queryCondition.mainProducts = ids.join(',');
      }
      if (this.giftData.length) {
        const giftDetails = this.giftData.filter(item => (item.giftProductId && item.giftProductName && hasValue(item.giftCount)));
        if (!giftDetails.length) {
          return this.$message.warning('至少填写完整一条赠品信息')
        } else {
          const isCount = giftDetails.every(item => item.giftCount.match(/^[\d]*$/));
          if (!isCount) {
            return this.$message.warning('存在某条赠品数量非数字，请重新填写')
          }
        }
        // 赠品数量是否为空
        const isCountNull = this.giftData.some(item => (item.giftProductId && item.giftProductName && !hasValue(item.giftCount)))
        if (isCountNull) return this.$message.warning('赠品数量不能为空')
        queryCondition.giftDetails = giftDetails;
      } else return this.$message.warning('至少填写完整一条赠品信息')
      data.queryCondition = JSON.stringify(queryCondition);
      GiftCreate(data)
        .then(() => {
          this.$message.success('赠品促销任务创建成功');
          this.handleClose();
          this.$emit('refresh');
        })
        .catch(console.warn)
    },
    // 提交
    hanldleSubmitGift() {
      this.$refs.giftForm.validate(valid => {
        if (valid) {
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
          this.createGiftRequest()
        }
      })
    }
  },
}
</script>

<style lang="scss" scoped>
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