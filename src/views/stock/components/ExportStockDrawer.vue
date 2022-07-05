<template>
<el-drawer
  title="批量导出"
  :visible.sync="drawer"
  @close="handleClose()"
  size="300px">
  <div class="stock-wrapper">
    <el-tabs v-model="activeName" class="drawer-tabs">
      <el-tab-pane label="上传文件" name="upload" class="tab-pane"></el-tab-pane>
    </el-tabs>
    <div class="drawer-form">
      <!--upload-->
      <el-form>
        <template>
          <el-form-item label="下载模板，按格式填写内容">
            <a class="link" @click="getTaskTemplate('导入模板', 'xlsx')">
              <Icon name="excel" class="link-icon"></Icon>
              <span>导入模板</span>
            </a>
          </el-form-item>
          <el-form-item label="上传" prop="uploadFile">
            <el-upload
              class="upload"
              ref="upload"
              action="#"
              drag
              style="max-width: 400px"
              :multiple="false"
              :show-file-list="false"
              :before-upload="uploadBefore"
              :http-request="uploadRequest">
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip">只能上传 xls/xlsx 格式文件，且不超过10M</div>
            </el-upload>
          </el-form-item>
          <FileList v-model="fileList"></FileList>
        </template>
      </el-form>
    </div>
    <div class="drawer-footer">
      <el-button plain @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleCreateTask">提交</el-button>
    </div>
  </div>
</el-drawer>
</template>

<script>
import {
  UploadFile,
  DownloadTaskTemplate,
  TaskCreate,
} from '@/api/goods/task';
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
      default: false,
    },
    taskType: {
      type: Number,
      default: 203,
    },
    partnerId: [Number,  String],
  },
  data() {
    return {
      activeName: 'upload',
      queryForm: {
        taskType: 203,
        uploadFile: '',
      },
      fileList: [],
      isUploadLoading: false,
      isQueryLoading: false,
      loading: false,
    }
  },
  computed: {
    drawer: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
  },
  methods: {
    handleCreateTask() {
      if (!hasValue(this.partnerId)) {
        return this.$message.warning('请选择店铺');
      }
      const {
        taskType,
        uploadFile,
      } = this.queryForm;
      TaskCreate({
        taskType,
        partnerId: this.partnerId,
        uploadFile,
      }).then(() => {
        this.$message.success('正在导出中，请前往下载中心查看导出状态');
        this.handleClose();
      }).finally(() => {
        this.loading = false;
      })
    },
    handleClose() {
      this.$refs.upload && this.$refs.upload.clearFiles();
      this.fileList = [];
      this.drawer = false;
    },
    // 获取任务模板
    getTaskTemplate(filename, suffix) {
      DownloadTaskTemplate({
        groupType: 1,
        taskType: this.queryForm.taskType,
        taskSubType: '',
      })
        .then((data) => {
          saveFile(data, filename, suffix);
        })
        .catch(console.warn)
    },
    uploadBefore(file) {
      let message = '';
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
      const formData = new FormData();
      formData.append('uploadFile', options.file);
      const fileItem = {
        name: options.file.name,
        status: 'pending',
      };
      this.fileList = [fileItem];
      UploadFile(formData)
        .then(({ data }) => {
          options.onSuccess(data, options.file, [options.file]);
          fileItem.status = 'success';
          fileItem.name = data;
          this.$message.success('上传成功');
          this.queryForm.uploadFile = this.fileList.map(item => item.name).join(',');
        })
        .catch((error) => {
          options.onError(error);
          fileItem.status = 'fail';
        })
        .finally(() => {
          this.isUploadLoading = false;
        });
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
