<template>
  <el-drawer
    :title="payload.type === 'add' ? '添加特例品' : '删除特例品'"
    size="500px"
    :visible="visible"
    @close="handleClose">
    <div class="drawer">
      <el-tabs v-model="activeName" @tab-click="handleTabClick" class="drawer-tabs" v-if="payload.type === 'add'">
        <el-tab-pane label="手动录入" name="manual" class="tab-pane"></el-tab-pane>
        <el-tab-pane label="上传文件" name="upload" class="tab-pane"></el-tab-pane>
      </el-tabs>
      <div class="drawer-form">
        <el-form :model="productForm" ref="productForm" :rules="rules" label-position="top">
          <template v-if="activeName === 'manual'">
            <el-form-item label="特例品" prop="productIds">
              <el-input
                type="textarea"
                v-model="productForm.productIds"
                :autosize="{ minRows: 5 }"
                :placeholder="`请输入特例品ID，多个ID之间用回车隔开，最多支持输入100品`">
              </el-input>
            </el-form-item>
          </template>
          <template v-else>
            <el-form-item label="下载模板，按格式填写内容">
              <a class="link" @click="getTaskTemplate">
                <Icon name="excel" class="link-icon"></Icon>
                <span>{{ payload.type === 'add' ? '特例品批量新增模板' : '特例品批量删除模板' }}</span>
              </a>
            </el-form-item>
            <el-form-item label="上传">
              <el-upload
                class="upload"
                ref="upload"
                action="#"
                drag
                :multiple="false"
                :show-file-list="false"
                :before-upload="uploadBefore"
                :http-request="uploadRequest">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                <div class="el-upload__tip">只能上传 xls/xlsx 格式文件，且不超过10M</div>
              </el-upload>
            </el-form-item>
            <FileList v-model="fileList" @change="handleRemoveFile"></FileList>
          </template>
        </el-form>
      </div>
      <div class="drawer-footer">
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button type="info" @click="handleClose">取消</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import {
  BatchAddProduct,
  BatchDelProduct,
  BatchTemplate
} from '@/api/words/list';
import { UploadFile } from '@/api/goods/task';
import {
  acceptTypes,
  saveFile,
  hasValue,
} from '@/util';

const fileTypes = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'xls',
  'xlsx',
];

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    payload: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    const validateLen = (_, value, callback) => {
      if (hasValue(value) && value.indexOf('\n' || '\r') > -1) {
        this.productIds = value.split(/[\n\r]\s*/).filter(item => item);
        if (this.productIds.length > 100) {
          this.productIds = [];
          callback(new Error('每次最多只能输入100品'))
        } else callback()
      } else {
        this.productIds = [value];
        callback()
      }
    }
    return {
      isUploadLoading: false,
      activeName: 'manual',
      fileList: [],
      productForm: {
        productIds: '',
        taskType: '',
        taskSubType: '',
        uploadFile: ''
      },
      productIds: [],
      rules: {
        productIds: [
          { required: true, message: '请输入特例品ID', trigger: 'blur' },
          { validator: validateLen, trigger: 'blur' }
        ],
      },
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
      this.fileList = [];
      this.productForm.uploadFile = '';
      this.productForm = {
        productIds: '',
        taskType: '',
        taskSubType: '',
        uploadFile: ''
      };
      this.productIds = [];
      this.$refs.productForm.clearValidate();
      this.activeName = 'manual';
      this.$refs.upload && this.$refs.upload.clearFiles();
    },
    // 添加
    addProductIds() {
      const data = {
        taskType: 109,
        taskSubType: 1093,
      };
      if (this.activeName === 'manual') {
        data.queryCondition = JSON.stringify({
          productIds: this.productIds.length ? this.productIds.join(',') : ''
        })
      } else {
        data.uploadFile = this.productForm.uploadFile;
        data.queryCondition = JSON.stringify({
          productIds: ''
        })
      }
      BatchAddProduct(data)
        .then(() => {
          this.$message.success('特例品添加任务创建成功');
          this.handleClose();
          this.$emit('refresh');
        })
        .catch(console.warn)
    },
    // 删除
    delProductIds() {
      const data = Object.create(null);
      if (this.activeName === 'manual') {
        data.productIds = this.productIds
      } else {
        data.uploadFile = this.productForm.uploadFile
      }
      BatchDelProduct(data)
        .then(() => {
          this.$message.success('删除成功');
          this.handleClose();
          this.$emit('refresh');
        })
        .catch(console.warn)
    },
    // 获取任务模板
    getTaskTemplate() {
      BatchTemplate({ downloadType: 'specialProduct' })
        .then(data => {
          saveFile(data, this.payload.type === 'add' ? '特例品批量新增模板' : '特例品批量删除模板', 'xlsx');
        })
        .catch(console.warn)
    },
    handleTabClick() {
      this.$refs.productForm.clearValidate();
    },
    uploadBefore(file) {
      let message = '';
      // if (/[\u4e00-\u9fa5]/.test(file.name)) {
      //   message = '文件名不能含有中文';
      // }
      if (file.size > 10 * 1024 * 1024) {
        message = '文件不能大于10M';
      }
      if (!acceptTypes(file, ...fileTypes)) {
        message = '只能上传 xls/xlsx 格式文件';
      }
      // 文件是否通过检测
      if (message) {
        this.$message.warning(message);
        return false;
      }
    },
    uploadRequest(options) {
      this.isUploadLoading = true;
      const productForm = new FormData();
      productForm.append('uploadFile', options.file);
      const fileItem = {
        name: options.file.name,
        status: 'pending',
      };
      this.fileList = [fileItem];
      UploadFile(productForm)
        .then(({ data }) => {
          options.onSuccess(data, options.file, [options.file]);
          fileItem.status = 'success';
          fileItem.name = data;
          this.$message.success('上传成功');
          this.productForm.uploadFile = this.fileList.map(item => item.name).join(',');
        })
        .catch((error) => {
          options.onError(error);
          fileItem.status = 'fail';
        })
        .finally(() => {
          this.isUploadLoading = false;
        });
    },
    // 删除文件
    handleRemoveFile() {
      this.productForm.uploadFile = '';
    },
    // 提交
    handleSubmit() {
      this.$refs.productForm && this.$refs.productForm.validate(valid => {
        if (valid) {
          if (!this.productForm.uploadFile && this.activeName === 'upload') {
            return this.$message.warning('请上传文件')
          }
          if (this.payload.type === 'add') {
            this.addProductIds()
          } else {
            this.delProductIds()
          }
        }
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.drawer {
  display: flex;
  flex-direction: column;
  padding: 0 24px;
  height: calc(100vh - 62px);
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  .el-radio{
    margin-top: 10px;
  }
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
