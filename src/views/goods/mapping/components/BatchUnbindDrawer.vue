<template>
<el-drawer :visible="visible" title="批量映射解绑" @close="handleClose" size="750px">
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
        <el-form-item label="绑定类型" prop="productMapUnBindType">
          <el-select v-model="formData.productMapUnBindType">
            <el-option
              v-for="(v, ky) of bindOptions"
              :key="ky"
              :label="v"
              :value="ky">
            </el-option>
          </el-select>
        </el-form-item>
        <!--manual-->
        <template v-if="activeName === 'manual'">
          <el-form-item label="映射解绑ID" prop="productIds">
            <el-input
              :placeholder="isTmallShop ? formData.productMapUnBindType === '1' ? '每一行一个ID，每次最多50个ID\n当当ID 天猫SPUID 天猫SKUID 物流宝ID\n23222 22222 22222 222' : '每一行一个ID，每次最多50个ID\n当当ID 天猫SPUID 物流宝ID\n23222 22222 22222' : '请录入ID(格式：商品ID  外站ID)'"
              type="textarea"
              :rows="5"
              v-model="formData.productIds">
            </el-input>
          </el-form-item>
        </template>
        <!--upload-->
        <template v-else>
          <el-form-item label="下载模板，按格式填写内容">
            <a class="link" @click="getTaskTemplate('商品批量映射解绑模板', 'xlsx')">
              <Icon name="excel" class="link-icon"></Icon>
              <span>商品批量映射解绑模板</span>
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
  // saveFile,
  excelReader,
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
  taskType: 105,
  taskSubType: 1053,
  partnerId: "",
  productMapUnBindType: "",
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
      if (this.isTmallShop) {
        if (this.formData.productMapUnBindType === "1") {
          if (!/^(?:\d+\s+\d+\s+\d+\s+\d+\s*[\n\r]\s*)*\d+\s+\d+\s+\d+\s+\d+\s*$/.test(value)) {
            return callback(new Error("ID格式不正确"))
          }
        } else {
          if (!/^(?:\d+\s+\d+\s+\d+\s*[\n\r]\s*)*\d+\s+\d+\s+\d+\s*$/.test(value)) {
            return callback(new Error("ID格式不正确"))
          }
        }
        if (value.trim().split(/[\n\r]\s*/).length > 50) {
          return callback(new Error("最多支持发布50品"))
        }
      } else {
        if (!/^(?:[0-9a-z]+\s+[0-9a-z]+\s*[\n\r]\s*)*[0-9a-z]+\s+[0-9a-z]+\s*$/.test(value)) {
          return callback(new Error("ID格式不正确"))
        }
        if (value.trim().split(/[\n\r]\s*/).length > 50) {
          return callback(new Error("最多支持发布50品"))
        }
      }
      callback()
    }
    return {
      isUploadLoading: false,
      activeName: "manual",
      formData: { ...defaultFormData },
      rules: {
        partnerId: [
          { required: true, message: "请选择店铺", trigger: "blur" }
        ],
        productIds: [
          { required: true, message: "请录入商品ID", trigger: "blur" },
          { validator: validatePids, trigger: "blur" }
        ],
        productMapUnBindType: [
          { required: true, message: "请选择绑定类型", trigger: "blur" }
        ],
        uploadFile: [
          { required: true, message: "请上传文件", trigger: "blur" },
        ],
      },
      fileList: [],
      bindOptions: {
        1: "有SKU映射解绑",
        0: "无SKU映射解绑"
      },
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
    handleRemoveFile() {
      this.fileList = []
      this.formData.uploadFile = ""
    },
    handleClose() {
      this.$refs.upload && this.$refs.upload.clearFiles()
      this.formData = { ...defaultFormData }
      this.formData.partnerId = Number(this.pickShop)
      this.activeName = "manual"
      this.$emit("update:visible", false)
    },
    // 获取任务模板
    getTaskTemplate(filename, suffix) {
      DownloadTaskTemplate({
        groupType: this.groupType,
        taskType: this.formData.taskType,
        taskSubType: this.formData.taskSubType,
      })
        .then((data) => {
          excelReader(data, filename, suffix)
        })
        .catch(console.warn)
    },
    handleTabClick() {
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
            taskSubType,
            partnerId,
            uploadFile,
            productMapUnBindType,
            ...condition
          } = this.formData

          const data = {
            taskType,
            taskSubType,
            partnerId,
          }
          
          const queryCondition = {}
          queryCondition.productMapUnBindType = productMapUnBindType
          if (this.activeName === "manual") {
            queryCondition.productIds = condition.productIds.split(/\n\r?/).map(lineStr => {
              const [productId, outerCode, outerSkuId = "", scItemId = ""] = lineStr.split(/\s+/).filter(i => i)
              const ids = {
                productId,
                outerCode,
              }
              if (this.isTmallShop) {
                if (productMapUnBindType == 1) ids.outerSkuId = outerSkuId
                ids.scItemId = productMapUnBindType === "1" ? scItemId : outerSkuId
              }
              return ids
            })
          } else {
            data.uploadFile = uploadFile
          }
          data.queryCondition = JSON.stringify(queryCondition)
          TaskCreate(data)
            .then(() => {
              this.$message.success("创建任务成功")
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
