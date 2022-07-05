<template>
<el-drawer
  class="drawer"
  :visible="visible"
  :title="ty === 'single' ? '修改产品信息' : '批量修改产品信息'"
  @close="handleClose"
  size="450px"
  destroy-on-close>
  <el-form :model="formData" label-position="top" ref="form" :rules="rules">
    <el-form-item label="选择店铺" prop="partnerId">
      <el-select v-model="formData.partnerId" style="width:220px">
        <el-option
          v-for="(shop, index) of shops"
          :key="index"
          :label="shop.partnerName"
          :value="shop.partnerId">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="原产品挂靠ID" prop="productIds">
      <el-input
        type="textarea"
        :rows="5"
        v-model="formData.productIds"
        :disabled="true">
      </el-input>
    </el-form-item>
    <el-form-item label="新产品挂靠ID" prop="tmProductId">
      <el-input v-model="formData.tmProductId"></el-input>
    </el-form-item>
  </el-form>
  <div class="drawer-footer">
    <el-button plain @click="handleClose">取消</el-button>
    <el-button type="primary" @click="handleSubmit">确定</el-button>
  </div>
</el-drawer>
</template>

<script>
import {
  CateUpdate,
} from '@/api/goods/category';
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    shops: {
      type: Array,
      default: () => [],
    },
    ty: {
      type: String,
      default: 'single'
    },
    payload: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      formData: {
        partnerId: '',
        productIds: '',
        tmProductId: '',
      },
      rules: {
        partnerId: [
          { required: true, message: '请选择店铺', trigger: 'blur' }
        ],
        tmProductId: [
          { required: true, message: '请输入新产品挂靠ID', trigger: 'blur' },
        ],
      },
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.formData.partnerId = this.payload.partnerId;
        this.formData.productIds = this.payload.productIds;
      }
    },
  },
  methods: {
    handleClose() {
      this.$refs.form.resetFields();
      this.$emit('update:visible', false);
    },
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const data = {
            partnerId: this.formData.partnerId,
            tmProductId: this.formData.tmProductId,
            productInfo: this.payload.productInfo.map(item => ({ productId: item.productId, outerCode: item.outerCode, outerDangProductId: item.outerDangProductId }))
          }
          CateUpdate(data)
            .then(({ code, data }) => {
              if (code == 200) {
                if (data && data.length) {
                  let errMsg = '';
                  data.forEach(e => {
                    if (!e.success) {
                      errMsg += `${e.productId}：${e.remark}<br>`
                    }
                  })
                  const defaultMsg = `共修改商品${data.length}个，其中成功${data.filter(i => i.success).length}个，失败${data.filter(i => !i.success).length}个`;
                  if (errMsg) {
                    return this.$message.error({
                      dangerouslyUseHTMLString: true,
                      message: `${defaultMsg}<br/>${errMsg}`
                    });
                  }
                  this.$message.success('修改成功');
                  this.handleClose();
                  this.$emit('success');
                }
              }
            })
            .catch(console.warn)
        }
      });
    },
  },
}
</script>

<style lang="scss" scoped>
.drawer-footer {
  flex: none;
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 86px;
  background-color: #fff;
  border-top: 1px solid #EEEEEE;
}
.drawer ::v-deep .el-drawer__body {
  padding: 16px;
}
</style>
