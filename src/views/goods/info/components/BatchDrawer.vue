<template>
<el-drawer :visible="visible" title="批量信息修改" @close="handleClose" size="440px">
  <div class="drawer">
    <el-tabs v-model="activeName" @tab-click="handleTabClick" class="drawer-tabs" v-if="ty === 'add'">
      <el-tab-pane label="手动录入" name="manual" class="tab-pane"></el-tab-pane>
      <el-tab-pane label="上传文件" name="upload" class="tab-pane"></el-tab-pane>
    </el-tabs>
    <div class="drawer-form">
      <el-form :model="formData" label-position="top" ref="form" :rules="rules">
        <el-form-item label="选择店铺" prop="partnerId">
          <el-select v-model="formData.partnerId" @change="formData.taskSubType = 1041" :disabled="ty === 'edit'">
            <el-option
              v-for="(shop, index) of shops"
              :key="index"
              :label="shop.partnerName"
              :value="shop.partnerId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="修改类型" prop="taskSubType">
          <el-radio-group v-model="formData.taskSubType" class="sub-types" @change="handleTaskSubTypeChange">
            <template v-if="ty === 'add'">
              <el-radio
                v-for="(type, index) in subTypeList"
                :label="type.value"
                :disabled="type.disabled && !isTmallShop"
                :key="index">
                {{ type.label }}
              </el-radio>
              <template v-if="groupType === 1">
                <el-radio :label="1043">更新主站主图</el-radio>
                <el-radio :label="1044">更新主站详情</el-radio>
              </template>
            </template>
            <el-radio :label="1049" v-else :disabled="true">定时包邮</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- 主站标题 -->
        <!-- <el-form-item label="主站标题" prop="titleActivity" v-if="formData.taskSubType === 1042">
          <el-input
            v-model="formData.titleActivity"
            style="width:300px">
          </el-input>
        </el-form-item> -->
        <!-- 标题锁定 -->
        <template v-if="formData.taskSubType === 1045 || formData.taskSubType === 1046 || formData.taskSubType === 1047 || formData.taskSubType === 1048 || formData.taskSubType === 1049">
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="datetime"
              placeholder="选择开始时间"
              :disabled="ty === 'edit'">
            </el-date-picker>
          </el-form-item>
          <el-form-item
            label="结束时间"
            prop="endTime"
            :rules="{ required: !formData.longTern, message: '请选择结束时间', trigger: 'change' }">
            <el-date-picker
              v-model="formData.endTime"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="datetime"
              placeholder="选择结束时间"
              :disabled="formData.longTern">
            </el-date-picker>
            <el-checkbox
              v-if="formData.taskSubType === 1045 || formData.taskSubType === 1046 || formData.taskSubType === 1048"
              v-model="formData.longTern"
              style="margin-left: 16px"
              :disabled="disabled">
              长期
            </el-checkbox>
          </el-form-item>
        </template>
        
        <!-- 标题前缀 -->
        <el-form-item label="标题前缀" prop="titlePrefix" v-if="formData.taskSubType === 1046">
          <el-input
            v-model="formData.titlePrefix"
            style="width:300px">
          </el-input>
        </el-form-item>
        <!-- 替换banner -->
        <el-form-item label="banner" prop="banner" v-if="formData.taskSubType === 1047">
          <el-input
            v-model="formData.banner"
            style="width:300px">
          </el-input>
        </el-form-item>
        <!-- 图片模板 -->
        <el-form-item label="图片模板" prop="imgTemplate" v-if="formData.taskSubType === 1048">
          <el-upload
            ref="imgTpl"
            action="#"
            :show-file-list="false"
            :multiple="false"
            :before-upload="uploadImgTplBefore"
            :http-request="uploadImgTplRequest"
            style="width: fit-content;">
            <span slot="trigger" class="pic-upload">上传图片模板</span>
          </el-upload>
          <el-link type="primary" target="_blank" :href="formData.imgTemplate" v-if="formData.imgTemplate">
            {{ formData.imgTemplate }}
          </el-link>
        </el-form-item>
        <!-- 包邮模板 -->
        <el-form-item label="包邮模板" prop="postageId" v-if="formData.taskSubType === 1049">
          <el-input
            v-model="formData.postageId"
            disabled
            style="width:300px">
          </el-input>
        </el-form-item>
        <!--manual-->
        <template v-if="ty === 'add'">
          <template v-if="activeName === 'manual'">
            <el-form-item label="录入商品ID" prop="productIds">
              <template #label>
                <span>录入商品ID</span>
                <div class="label-tip">多个商品ID请用 “换行” 隔开，最多支持100品发布</div>
              </template>
              <el-input placeholder="请输入" type="textarea" :rows="5" v-model="formData.productIds"></el-input>
            </el-form-item>
          </template>
          <!--upload-->
          <template v-else>
            <el-form-item label="下载模板，按格式填写内容">
              <a class="link" @click="getTaskTemplate('商品批量信息修改模板', 'xlsx')">
                <Icon name="excel" class="link-icon"></Icon>
                <span>商品批量信息修改模板</span>
              </a>
            </el-form-item>
            <el-form-item label="上传" prop="uploadFile">
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
            <FileList v-model="fileList"></FileList>
          </template>
        </template>
      </el-form>
    </div>
    <div class="drawer-footer">
      <el-button plain @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handlePublish">发布</el-button>
    </div>
  </div>
</el-drawer>
</template>

<script>
import {
  // fileSuffix,
  acceptTypes,
  excelReader,
} from '@/util';
import {
  UploadFile,
  UploadPicture,
  DownloadTaskTemplate,
  TaskCreate,
} from '@/api/goods/task';
import {
  PostTel,
  PostTelTimeUpdate,
} from '@/api/goods/info';

const fileTypes = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'xls',
  'xlsx',
];

const defaultFormData = {
  partnerId: '',
  taskType: 104,
  taskSubType: 1041,
  productIds: '',
  startTime: '',
  endTime: '',
  longTern: false,
  titlePrefix: '',
  // titleActivity: '',
  banner: '',
  imgTemplate: '',
  postageId: '',
  uploadFile: '',
};

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    pickShop: [String, Number],
    shops: {
      type: Array,
      default: () => [],
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
    const validatePids = (_, value, callback) => {
      if (!/^(?:\d+[\n\r]\s*)*\d+\s*$/.test(value)) {
        callback(new Error('ID格式不正确'))
      } else if (value.trim().split(/[\n\r]\s*/).length > 100) {
        callback(new Error('最多支持发布100品'))
      } else callback();
    };
    return {
      formData: { ...defaultFormData },
      activeName: 'manual',
      isUploadLoading: false,
      uploadStatusMap: {
        pending: {
          icon: 'el-icon-loading',
          label: '上传中...',
        },
        success: {
          icon: 'el-icon-circle-check',
          label: '上传成功',
        },
        fail: {
          icon: 'el-icon-warning-outline',
          label: '上传失败',
        },
      },
      fileList: [],
      rules: {
        partnerId: [
          { required: true, message: '请选择店铺', trigger: 'blur' }
        ],
        productIds: [
          { required: true, message: '请录入商品ID', trigger: 'blur' },
          { validator: validatePids, trigger: 'blur' }
        ],
        uploadFile: [
          { required: true, message: '请上传文件', trigger: 'blur' },
        ],
        startTime: [
          { required: true, message: '请选择开始事件', trigger: 'blur' }
        ],
        titlePrefix: [
          { required: true, message: '请填写标题前缀', trigger: 'blur' }
        ],
        // titleActivity: [
        //   { required: true, message: '请填写主站标题', trigger: 'blur' }
        // ],
        banner: [
          { required: true, message: '请填写banner信息', trigger: 'blur' }
        ],
        imgTemplate: [
          { required: true, message: '请上传活动主图模板', trigger: 'blur' }
        ],
        postageId: [
          { required: true, message: '请填写包邮模板ID', trigger: 'blur' }
        ],
      },
      subTypeList: [
        { label: '全量更新', value: 1041, disabled: false },
        { label: '更新主站标题', value: 1042, disabled: false },
        // { label: '更新主站主图', value: 1043 },
        // { label: '更新主站详情', value: 1044 },
        { label: '标题锁定', value: 1045, disabled: false },
        { label: '标题前缀', value: 1046, disabled: false },
        { label: '替换banner', value: 1047, disabled: true },
        { label: '活动主图', value: 1048, disabled: false },
        { label: '定时包邮', value: 1049, disabled: true },
      ],
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.formData.partnerId = Number(this.pickShop);
        if (this.ty === 'edit') {
          this.formData.taskSubType = 1049;
          this.formData.startTime = this.payload.startTime;
          this.formData.endTime = this.payload.endTime;
          this.getPostTel();
        }
      }
    },
    'formData.taskSubType'() {
      if (this.formData.taskSubType !== 1045 && this.formData.taskSubType !== 1046 && this.formData.taskSubType !== 1048) {
        this.formData.longTern = false
      }
    }
  },
  computed: {
    groupType() {
      const findedShop = this.shops.find(shop => shop.partnerId === this.formData.partnerId);
      return findedShop ? findedShop.groupType : '';
    },
    isTmallShop() {
      return this.groupType === 1;
    },
    disabled() {
      return this.formData.endTime ? true : false
    }
  },
  methods: {
    // 获取包邮模板
    getPostTel() {
      PostTel({ partnerId: this.formData.partnerId })
        .then(({ data }) => {
          this.formData.postageId = data || '';
        })
        .catch(console.warn)
    },
    handleTaskSubTypeChange(v) {
      this.$refs.form.clearValidate();
      if (v === 1049) {
        this.getPostTel()
      }
    },
    // 获取任务模板
    getTaskTemplate(filename, suffix) {
      DownloadTaskTemplate({
        groupType: this.groupType,
        taskType: this.formData.taskType,
        taskSubType: this.formData.taskSubType,
      })
        .then((data) => {
          excelReader(data, filename, suffix);
        })
        .catch(console.warn)
    },
    handleClose() {
      this.$refs.upload && this.$refs.upload.clearFiles();
      this.formData = { ...defaultFormData };
      this.formData.partnerId = Number(this.pickShop);
      this.activeName = 'manual';
      this.$emit('update:visible', false);
    },
    handleTabClick() {
      this.$refs.form.clearValidate();
    },
    uploadImgTplBefore(file) {
      const fileTypes = [
        'image/jpg',
        'image/png',
        'image/jpeg'
      ];
      let message = '';
      if (!acceptTypes(file, ...fileTypes)) {
        message = '仅支持上传jpg/jpeg/png格式图片模板';
      }
      if (message) {
        this.$message.warning(message);
        return false;
      }
    },
    uploadImgTplRequest(options) {
      if (this.uploadLoading) return;
      this.uploadLoading = true;
      const formData = new FormData();
      formData.append('uploadFile', options.file);
      UploadPicture(formData)
        .then(({ data }) => {
          this.formData.imgTemplate = data;
          this.$message.success('上传成功');
        })
        .catch(console.warn)
        .finally(() => {
          this.uploadLoading = false
        })
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
          this.formData.uploadFile = this.fileList.map(item => item.name).join(',');
        })
        .catch((error) => {
          options.onError(error);
          fileItem.status = 'fail';
        })
        .finally(() => {
          this.isUploadLoading = false;
        });
    },
    handlePublish() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const {
            taskType,
            taskSubType,
            partnerId,
            uploadFile,
            ...condition
          } = this.formData;

          const data = {
            taskType,
            taskSubType,
            partnerId,
          };
          const queryCondition = {};
          // if (taskSubType === 1042) {
          //   queryCondition.titleActivity = condition.titleActivity;
          // }

          // 标题锁定、标题前缀、活动主图 结束时间新增“长期”勾选条件
          if (taskSubType === 1045 || taskSubType === 1046 || taskSubType === 1048) {
            if (!condition.longTern) {
              data.startTime = condition.startTime;
              data.endTime = condition.endTime;
              if (new Date(condition.startTime).getTime() > new Date(condition.endTime).getTime()) {
                return this.$message.warning('结束时间不能小于开始时间')
              }
            } else {
              data.startTime = condition.startTime;
              queryCondition.longTern = condition.longTern
            }
          }
          if (taskSubType === 1046) {
            queryCondition.titlePrefix = condition.titlePrefix;
          }
          if (taskSubType === 1047) {
            data.startTime = condition.startTime;
            data.endTime = condition.endTime;
            queryCondition.banner = window.btoa(condition.banner);
            if (new Date(condition.startTime).getTime() > new Date(condition.endTime).getTime()) {
              return this.$message.warning('结束时间不能小于开始时间')
            }
          }
          if (taskSubType === 1048) {
            queryCondition.imgTemplate = condition.imgTemplate;
          }
          if (taskSubType === 1049) {
            data.startTime = condition.startTime;
            data.endTime = condition.endTime;
            queryCondition.postageId = condition.postageId;
            if (new Date(condition.startTime).getTime() > new Date(condition.endTime).getTime()) {
              return this.$message.warning('结束时间不能小于开始时间')
            }
          }
          if (this.activeName === 'manual') {
            queryCondition.productIds = condition.productIds.split(/[\n\r]\s*/).join(',');
          } else {
            data.uploadFile = uploadFile;
          }
          data.queryCondition = JSON.stringify(queryCondition);
          if (this.ty === 'add') {
            TaskCreate(data)
              .then(() => {
                if (data.partnerId === -2) {
                  this.$message.success('任务创建成功，请前往各店铺查看详情');
                } else {
                  this.$message.success('创建任务成功');
                }
                this.handleClose();
                this.$emit('success');
              })
              .catch(console.warn);
          } else {
            const formData = new FormData();
            formData.append('id', this.payload.id);
            formData.append('endTime', condition.endTime);
            PostTelTimeUpdate(formData)
              .then(() => {
                this.$message.success('编辑成功');
                this.handleClose();
                this.$emit('success');
              })
              .catch(console.warn);
          }
        }
      });
    },
  },
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
  .sub-types {
    display: grid;
    grid: auto-flow / repeat(3, 1fr);
    gap: 10px;
    ::v-deep .el-radio {
      margin: 0;
      .el-radio__label {
        padding-left: 5px;
      }
    }
  }
}
.pic-upload{
  display: flex;
  font-size: 12px;
  color: #0061D9;
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
