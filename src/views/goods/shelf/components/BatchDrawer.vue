<template>
<el-drawer :visible="visible" title="批量上下架" @close="handleClose" size="400px">
  <div class="drawer">
    <el-tabs v-model="activeName" @tab-click="handleTabClick" class="drawer-tabs">
      <el-tab-pane label="手动录入" name="manual" class="tab-pane"></el-tab-pane>
      <el-tab-pane label="上传文件" name="upload" class="tab-pane"></el-tab-pane>
    </el-tabs>
    <div class="drawer-form">
      <el-form :model="formData" label-position="top" ref="form" :rules="rules">
        <el-form-item label="选择店铺" prop="partnerId">
          <el-select v-model="formData.partnerId" @change="handleResetField">
            <el-option
              v-for="(shop, index) of shops"
              :key="index"
              :label="shop.partnerName"
              :value="shop.partnerId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品ID类型" prop="productIdType" v-if="isTmallShop">
          <el-select v-model="formData.productIdType" @change="formData.shelfType = ''">
            <el-option label="当当ID" :value="1"></el-option>
            <el-option label="外平台ID" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="上下架类型" prop="shelfType">
          <el-select v-model="formData.shelfType">
            <el-option label="上架" :value="1"></el-option>
            <el-option label="下架" :value="2"></el-option>
            <template v-if="formData.productIdType === 2">
              <el-option label="定时上架" :value="3"></el-option>
              <el-option label="定时下架" :value="4"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="定时时间" prop="startTime" v-if="formData.shelfType === 4 || formData.shelfType === 3">
          <el-date-picker
            v-model="formData.startTime"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetime">
          </el-date-picker>
        </el-form-item>
        <!--manual-->
        <template v-if="activeName === 'manual'">
          <el-form-item prop="productIds">
            <template #label>
              <span>录入商品ID</span>
              <div class="label-tip">多个ID之间请用 “换行” 隔开，最多支持100品发布</div>
            </template>
            <el-input placeholder="请输入" type="textarea" :rows="5" v-model="formData.productIds"></el-input>
          </el-form-item>
        </template>
        <!--upload-->
        <template v-else>
          <el-form-item label="下载模板，按格式填写内容">
            <a class="link" @click="getTaskTemplate('商品批量上下架模板', 'xlsx')">
              <Icon name="excel" class="link-icon"></Icon>
              <span>商品批量上下架模板</span>
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
          <FileList v-model="fileList"  @change="handleRemoveFile"></FileList>
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

/*上下架子任务类型
  1061: 上架，1062：下架，1063：定时上架，1064：定时下架
*/

const defaultFormData = {
  taskType: 106,
  partnerId: "",
  productIdType: "",
  startTime: "",
  shelfType: "",
  productIds: "",
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
      if (!/^(?:\d+[\n\r]\s*)*\d+\s*$/.test(value)) {
        callback(new Error("ID格式不正确"))
      } else if (value.trim().split(/[\n\r]\s*/).length > 100) {
        callback(new Error("最多支持发布100品"))
      } else callback()
    }
    return {
      isUploadLoading: false,
      activeName: "manual",
      formData: { ...defaultFormData },
      rules: {
        partnerId: [
          { required: true, message: "请选择店铺", trigger: "blur" }
        ],
        shelfType: [
          { required: true, message: "请选择上下架", trigger: "blur" }
        ],
        productIdType:  [
          { required: true, message: "请选择商品ID类型", trigger: "blur" }
        ],
        startTime:  [
          { required: true, message: "请选择定时时间", trigger: "blur" }
        ],
        productIds: [
          { required: true, message: "请录入商品ID", trigger: "blur" },
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
      this.formData.partnerId = +this.pickShop
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
    handleRemoveFile() {
      this.fileList = []
      this.formData.uploadFile = ""
    },
    handleResetField() {
      this.formData.productIdType = ""
      this.formData.startTime = ""
      this.formData.shelfType = ""
    },
    handleClose() {
      this.$refs.upload && this.$refs.upload.clearFiles()
      this.formData = { ...defaultFormData }
      this.formData.partnerId = +this.pickShop
      this.activeName = "manual"
      this.$refs.form.clearValidate()
      this.$emit("update:visible", false)
    },
    handleTabClick() {
      this.$refs.form.clearValidate()
    },
    // 获取任务模板
    getTaskTemplate(filename, suffix) {
      DownloadTaskTemplate({
        groupType: this.groupType,
        taskType: this.formData.productIdType === 2 ? "106_1" : this.formData.taskType,
        // taskSubType: this.formData.taskSubType,
      })
        .then(data => {
          saveFile(data, filename, suffix)
        })
        .catch(console.warn)
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
      const fd = new FormData()
      fd.append("uploadFile", options.file)
      const fileItem = {
        name: options.file.name,
        status: "pending",
      }
      this.fileList = [fileItem]
      UploadFile(fd)
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
            uploadFile,
            shelfType,
            productIdType,
            startTime,
            ...condition
          } = this.formData
          if (productIdType === 2) {
            if (new Date(startTime).getTime() < (Date.now() + 30 * 60 * 1000)) {
              return this.$message.warning("创建定时上下架任务须晚于当前时间30分钟")
            }
          }
          const data = {
            taskType,
            partnerId,
          }
          switch (shelfType) {
          case 1:
            data.taskSubType = 1061
            break
          case 2:
            data.taskSubType = 1062
            break
          case 3:
            data.taskSubType = 1063
            break
          case 4:
            data.taskSubType = 1064
            break
          }
          const queryCondition = {}
          if (this.isTmallShop) {
            if (productIdType === 2) data.startTime = startTime
            queryCondition.productIdType = productIdType
          }
          queryCondition.shelfType = shelfType
          if (this.activeName === "manual") {
            condition.productIds = condition.productIds.split(/[\n\r]\s*/).join(",")
            Object.assign(queryCondition, condition)
          } else {
            data.uploadFile = uploadFile
          }
          data.queryCondition = JSON.stringify(queryCondition)
          TaskCreate(data)
            .then(() => {
              if (data.partnerId === -2) {
                this.$message.success("任务创建成功，请前往各店铺查看详情")
              } else {
                this.$message.success("创建任务成功")
              }
              this.handleClose()
              this.$emit("success")
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
