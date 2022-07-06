<template>
<el-drawer
  :visible="visible"
  :title="isAdd ? '新增价格预警' : '编辑价格预警'"
  @close="handleClose"
  size="450px">
  <div class="drawer">
    <el-tabs v-model="activeName" @tab-click="handleTabClick" class="drawer-tabs" v-if="isAdd">
      <el-tab-pane label="手动录入" name="manual" class="tab-pane"></el-tab-pane>
      <el-tab-pane label="上传文件" name="upload" class="tab-pane"></el-tab-pane>
    </el-tabs>
    <div class="drawer-form">
      <el-form :model="formData" label-position="top" ref="form" :rules="rules">
        <el-form-item label="选择店铺" prop="partnerId">
          <el-select v-model="formData.partnerId" :disabled="!isAdd" style="width:220px">
            <el-option
              v-for="(shop, index) of shops"
              :key="index"
              :label="shop.partnerName"
              :value="shop.partnerId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="任务名称" prop="taskName">
          <el-input type="text" v-model="formData.taskName" placeholder="请输入任务名称" style="width:220px"></el-input>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            :disabled="!isAdd"
            v-model="formData.startTime"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetime"
            placeholder="选择开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item
          label="结束时间"
          prop="endTime">
          <el-date-picker
            v-model="formData.endTime"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetime"
            placeholder="选择结束时间">
          </el-date-picker>
        </el-form-item>
        <template v-if="isAdd">
          <!--manual-->
          <template v-if="activeName === 'manual'">
            <el-form-item label="价格预警商品ID" prop="productIds">
              <el-input
                placeholder="请输入商品ID，多个商品请用‘回车换行’隔开，最多支持100品发布"
                type="textarea"
                :rows="isAdd ? 5 : 2"
                v-model="formData.productIds"
                :disabled="!isAdd">
              </el-input>
            </el-form-item>
          </template>
          <!--upload-->
          <template v-else>
            <el-form-item label="下载模板，按格式填写内容">
              <a class="link" @click="getTaskTemplate('价格预警批量模板', 'xlsx')">
                <Icon name="excel" class="link-icon"></Icon>
                <span>价格预警批量模板</span>
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
            <FileList v-model="fileList" @change="handleRemoveFile"></FileList>
          </template>
        </template>
      </el-form>
    </div>
    <div class="drawer-footer">
      <el-button plain @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </div>
  </div>
</el-drawer>
</template>

<script>
import {
  // fileSuffix,
  acceptTypes,
  saveFile,
} from "@/util"
import {
  UploadFile,
  DownloadTaskTemplate,
  TaskEdit,
  TaskCreate,
} from "@/api/goods/warning"

const fileTypes = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "xls",
  "xlsx",
]

const defaultFormData = {
  partnerId: "",
  taskName: "",
  taskType: 111,
  taskSubType: 1111,
  productIds: "",
  startTime: "",
  endTime: "",
  uploadFile: "",
}

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
    isAdd: {
      type: Boolean,
      default: true
    },
    payload: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const validatePids = (_, value, callback) => {
      if (!/[\d,]/.test(value)) {
        callback(new Error("ID格式不正确"))
      } else if (value.split(/[\n\r]\s*/).filter(item => item).length > 100) {
        callback(new Error("最多支持发布100品"))
      } else callback()
    }
    return {
      formData: { ...defaultFormData },
      activeName: "manual",
      isUploadLoading: false,
      uploadStatusMap: {
        pending: {
          icon: "el-icon-loading",
          label: "上传中...",
        },
        success: {
          icon: "el-icon-circle-check",
          label: "上传成功",
        },
        fail: {
          icon: "el-icon-warning-outline",
          label: "上传失败",
        },
      },
      fileList: [],
      rules: {
        partnerId: [
          { required: true, message: "请选择店铺", trigger: "blur" }
        ],
        productIds: [
          { required: true, message: "请录入商品ID", trigger: "blur" },
          { validator: validatePids, trigger: "blur" }
        ],
        uploadFile: [
          { required: true, message: "请上传文件", trigger: "blur" },
        ],
        startTime: [
          { required: true, message: "请选择开始时间", trigger: "blur" }
        ],
        endTime: [
          { required: true, message: "请选择结束时间", trigger: "blur" }
        ],
        taskName: [
          { required: true, message: "请输入任务名称", trigger: "blur" }
        ]
      },
    }
  },
  watch: {
    visible(val) {
      if (val) {
        if (!this.isAdd) {
          const [startTime, endTime] = this.payload.timeZone.split("~")
          this.formData.partnerId = this.payload.partnerId
          this.formData.taskName = this.payload.taskName
          this.formData.startTime = startTime,
          this.formData.endTime = endTime
        } else {
          this.formData.partnerId = Number(this.pickShop)
        }
      }
    },
  },
  computed: {
    groupType() {
      const findedShop = this.shops.find(shop => shop.partnerId === this.formData.partnerId)
      return findedShop ? findedShop.groupType : ""
    },
  },
  methods: {
    handleRemoveFile() {
      this.fileList = []
      this.formData.uploadFile = ""
    },
    // 获取任务模板
    getTaskTemplate(filename, suffix) {
      DownloadTaskTemplate({
        taskType: 111,
      })
        .then((data) => {
          saveFile(data, filename, suffix)
        })
        .catch(console.warn)
    },
    handleClose() {
      this.$refs.upload && this.$refs.upload.clearFiles()
      this.formData = { ...defaultFormData }
      this.formData.partnerId = Number(this.pickShop)
      this.activeName = "manual"
      this.$emit("update:visible", false)
    },
    handleTabClick() {
      this.$refs.form.clearValidate()
    },
    uploadBefore(file) {
      let message = ""
      if (file.size > 10 * 1024 * 1024) {
        message = "文件不能大于10M"
      }
      if (!acceptTypes(file, ...fileTypes)) {
        message = "只能上传 xls/xlsx 格式文件"
      }
      // 文件是否通过检测
      if (message) {
        this.$message.warning(message)
        return false
      }
    },
    uploadRequest(options) {
      this.isUploadLoading = true
      const formData = new FormData()
      formData.append("uploadFile", options.file)
      const fileItem = {
        name: options.file.name,
        status: "pending",
      }
      this.fileList = [fileItem]
      UploadFile(formData)
        .then(({ data }) => {
          options.onSuccess(data, options.file, [options.file])
          fileItem.status = "success"
          fileItem.name = data
          this.$message.success("上传成功")
          this.formData.uploadFile = this.fileList.map(item => item.name).join(",")
        })
        .catch((error) => {
          options.onError(error)
          fileItem.status = "fail"
        })
        .finally(() => {
          this.isUploadLoading = false
        })
    },
    // 新增
    handleAddTask() {
      const {
        taskName,
        taskType,
        taskSubType,
        partnerId,
        startTime,
        endTime,
        uploadFile,
        ...condition
      } = this.formData

      const data = {
        taskType,
        taskSubType,
        taskName,
        partnerId,
        startTime,
        endTime,
      }
      if (this.activeName === "manual") {
        data.productInfoList = condition.productIds.split(/[\n\r]\s*/).filter(item => item).map(item => ({ productId: item }))
      } else {
        data.uploadFile = uploadFile
      }
      TaskCreate(data)
        .then(() => {
          this.$message.success("创建任务成功")
          this.handleClose()
          this.$emit("success")
        })
        .catch(console.warn)
    },
    // 编辑
    handleEditTask() {
      const data = {
        taskNum: this.payload.taskNum,
        taskName: this.formData.taskName,
        updateEndDate: this.formData.endTime,
      }
      TaskEdit(data)
        .then(() => {
          this.$message.success("编辑成功")
          this.handleClose()
          this.$emit("success")
        })
        .catch(console.warn)
    },
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (new Date(this.formData.startTime).getTime() > new Date(this.formData.endTime).getTime()) {
            return this.$message.error("结束时间不能小于开始时间")
          }
          if (this.isAdd) {
            this.handleAddTask()
          } else {
            this.handleEditTask()
          }
        }
      })
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
