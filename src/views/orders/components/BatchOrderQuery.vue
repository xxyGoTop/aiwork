<template>
<el-drawer
  :visible="visible"
  title="订单批量查询"
  @close="handleClose"
  @open="handleOpen"
  size="400px">
  <div class="drawer">
    <el-tabs v-model="activeName" @tab-click="handleTabClick" class="drawer-tabs">
      <el-tab-pane label="手动录入" name="manual" class="tab-pane"></el-tab-pane>
      <el-tab-pane label="上传文件" name="upload" class="tab-pane"></el-tab-pane>
    </el-tabs>
    <div class="drawer-form">
      <el-form :model="formData" label-position="top" ref="form" :rules="rules">
        <el-form-item label="选择店铺" prop="partnerId">
          <el-select v-model="formData.partnerId">
            <el-option
              v-for="(shop, index) of shops"
              :key="index"
              :label="shop.partnerName"
              :value="shop.partnerId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="订单号类型" prop="orderNumType">
          <el-select v-model="formData.orderNumType" size="small">
            <el-option 
              v-for="(type, ky) in orderTypes"
              :label="type"
              :value="ky"
              :key="ky">
            </el-option>
          </el-select>
        </el-form-item>
        <!--manual-->
        <template v-if="activeName === 'manual'">
          <el-form-item prop="orderIds">
            <template #label>
              <span>录入订单号</span>
              <div class="label-tip">多个订单号请用 “换行” 隔开，最多支持100个订单号查询</div>
            </template>
            <el-input placeholder="请录入" type="textarea" :rows="5" v-model="formData.orderIds"></el-input>
          </el-form-item>
        </template>
        <!--upload-->
        <template v-else>
          <el-form-item label="下载模板，按格式填写内容">
            <a class="link" @click="getTaskTemplate('订单批量查询模板', 'xlsx')">
              <Icon name="excel" class="link-icon"></Icon>
              <span>订单批量查询模板</span>
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
  saveFile,
} from "@/util"
import {
  UploadFile,
  TaskCreate,
  DownloadTaskTemplate
} from "@/api/goods/task"

const fileTypes = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "xls",
  "xlsx",
]

const defaultFormData = {
  taskType: 401,
  partnerId: "",
  orderNumType: "",
  orderIds: "",
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
  },
  data() {
    const validatePids = (_, value, callback) => {
      if (!/^(?:[\d-]+[\n\r]\s*)*[\d-]+\s*$/.test(value)) {
        callback(new Error("多个订单号请用换行隔开"))
      } else if (value.trim().split(/[\n\r]\s*/).length > 100) {
        callback(new Error("最多支持100个订单号查询"))
      } else callback()
    }
    return {
      isUploadLoading: false,
      activeName: "manual",
      formData: { ...defaultFormData },
      orderTypes: {
        1: "当当订单号",
        0: "外平台订单号"
      },
      rules: {
        partnerId: [
          { required: true, message: "请选择店铺", trigger: "blur" }
        ],
        orderNumType: [
          { required: true, message: "请选择查询ID类型", trigger: "blur" }
        ],
        orderIds: [
          { required: true, message: "请录入订单号", trigger: "blur" },
          { validator: validatePids, trigger: "blur" }
        ],
        uploadFile: [
          { required: true, message: "请上传文件", trigger: "blur" },
        ],
      },
      fileList: [],
    }
  },
  watch: {
    pickShop() {
      this.formData.partnerId = Number(this.pickShop)
    },
  },
  computed: {
    groupType() {
      const findedShop = this.shops.find(shop => shop.partnerId === this.formData.partnerId)
      return findedShop ? findedShop.groupType : ""
    },
    isTmallShop() {
      return this.groupType === 1
    },
  },
  methods: {
    // 删除文件
    handleRemoveFile() {
      this.formData.uploadFile = ""
      this.fileList = []
    },
    handleClose() {
      this.$refs.upload && this.$refs.upload.clearFiles()
      this.formData = { 
        ...defaultFormData,
        partnerId: Number(this.pickShop)
      }
      this.activeName = "manual"
      this.$refs.form && this.$refs.form.clearValidate()
      this.$emit("update:visible", false)
    },
    handleOpen() {
      this.$refs.upload && this.$refs.upload.clearFiles()
      this.formData = { 
        ...defaultFormData,
        partnerId: Number(this.pickShop)
      }
      this.activeName = "manual"
      this.$refs.form && this.$refs.form.clearValidate()
    },
    // 获取任务模板
    getTaskTemplate(filename, suffix) {
      DownloadTaskTemplate({
        groupType: this.groupType,
        taskType: this.formData.taskType,
      })
        .then((data) => {
          saveFile(data, filename, suffix)
        })
        .catch(console.warn)
    },
    handleTabClick() {
      this.formData.orderNumType = ""
      this.formData.orderIds = ""
      this.$refs.form.clearValidate()
    },
    uploadBefore(file) {
      let message = ""
      // if (/[\u4e00-\u9fa5]/.test(file.name)) {
      //   message = '文件名不能含有中文';
      // }
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
    handlePublish() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const {
            taskType,
            partnerId,
            orderNumType,
            uploadFile,
            ...condition
          } = this.formData

          const data = {
            taskType,
            partnerId,
          }

          const queryCondition = {}
          queryCondition.orderNumType = orderNumType
          if (this.activeName === "upload") {
            data.uploadFile = uploadFile
          } else {
            const orderIds = condition.orderIds.split(/[\n\r]\s*/).filter(id => id).join(",")
            this.$emit("update:visible", false)
            this.$emit("search", {
              partnerId,
              orderNumType,
              orderIds
            })
            return this.$message.success("手动订单录入查询结果请在列表页查看")
          }
          data.queryCondition = JSON.stringify(queryCondition)
          TaskCreate(data)
            .then(() => {
              this.$message.success("创建任务成功")
              this.handleClose()
            })
            .catch(console.warn)
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
