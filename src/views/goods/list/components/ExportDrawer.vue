<template>
<el-drawer :visible="visible" title="商品导出" @close="handleClose" size="720px">
  <div class="drawer">
    <el-tabs v-model="activeName" @tab-click="handleTabClick" class="drawer-tabs">
      <el-tab-pane label="手动录入" name="manual" class="tab-pane"></el-tab-pane>
      <el-tab-pane
        label="上传文件"
        name="upload"
        class="tab-pane"
        v-if="formData.taskSubType === 1013 || formData.taskSubType === 1016 || formData.taskSubType === 1025">
      </el-tab-pane>
    </el-tabs>
    <div class="drawer-form">
      <el-form :model="formData" label-position="top" ref="form" :rules="rules">
        <el-form-item label="选择店铺" prop="partnerId">
          <el-select v-model="formData.partnerId"  @change="handleShopChange">
            <el-option
              v-for="(shop, index) of shops"
              :key="index"
              :label="shop.partnerName"
              :value="shop.partnerId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="导出类型" prop="taskSubType">
          <el-select v-model="formData.taskSubType" @change="handleExportTypes">
            <el-option
              v-for="(type, index) of exportTypes"
              :key="index"
              :label="type.label"
              :value="type.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="导出字段" prop="fields" v-if="formData.taskSubType === 1011 || formData.taskSubType === 1012 || formData.taskSubType === 1013 || formData.taskSubType === 1020">
          <el-checkbox-group v-model="formData.fields" class="export-fields" :disabled="formData.taskSubType === 1020">
            <el-checkbox
              v-for="(field) of exportFields"
              :key="field.value"
              :label="field.value">
              {{field.label}}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <template v-if="formData.taskSubType === 1013 || formData.taskSubType === 1016 || formData.taskSubType === 1025">
          <!--manual-->
          <template v-if="activeName === 'manual'">
            <el-form-item label="录入商品ID" prop="productIds">
              <template #label>
                <span>录入商品ID</span>
                <div class="label-tip">多个商品ID请用 “换行” 隔开，最多支持录入50品</div>
              </template>
              <el-input placeholder="请录入ID" type="textarea" :rows="5" v-model="formData.productIds"></el-input>
            </el-form-item>
          </template>
          <!--upload-->
          <template v-else>
            <el-form-item label="下载模板，按格式填写内容">
              <a class="link" @click="getTaskTemplate('商品批量导出模板', 'xlsx')">
                <Icon name="excel" class="link-icon"></Icon>
                <span>商品批量导出模板</span>
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

// taskType: 101 商品导出
const defaultFormData = {
  taskType: 101,
  taskSubType: 1011,
  partnerId: "",
  productIds: "",
  fields: [],
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
    // 已选择商品
    selectedShopIds: {
      type: Array,
      default: () => [],
    },
    // 查询条件
    queryParams: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    const validatePids = (_, value, callback) => {
      if (!/^(?:\d+[\n\r]\s*)*\d+\s*$/.test(value)) {
        callback(new Error("ID格式不正确"))
      } else if (value.trim().split(/[\n\r]\s*/).length > 50) {
        callback(new Error("最多支持发布50品"))
      } else callback()
    }
    const validateFields = (_, value, callback) => {
      if (!value.length) {
        callback(new Error("请选择导出字段"))
      } else callback()
    }
    return {
      isUploadLoading: false,
      activeName: "manual",
      formData: { ...defaultFormData },
      rules: {
        partnerId: [
          { required: true, message: "请选择店铺", trigger: "change" }
        ],
        taskSubType: [
          { required: true, message: "请选择导出类型", trigger: "change" }
        ],
        productIds: [
          { required: true, message: "请录入商品ID", trigger: "blur" },
          { validator: validatePids, trigger: "blur" }
        ],
        uploadFile: [
          { required: true, message: "请上传文件", trigger: "blur" },
        ],
        fields: [
          { required: true, message: "请选择导出字段", trigger: "blur" },
          { validator: validateFields, trigger: "blur" }
        ],
      },
      fileList: [],
    }
  },
  watch: {
    pickShop() {
      this.formData.partnerId = Number(this.pickShop)
    },
    fileList: {
      deep: true,
      handler(val) {
        this.formData.uploadFile = val.map(item => item.name).join(",")
      },
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
    isPddShop() {
      return this.groupType === 2
    },
    isDouyinShop() {
      return this.groupType === 3
    },
    pddOrDouyin() {
      return this.isPddShop || this.isDouyinShop
    },
    // 导出类型
    exportTypes() {
      const types = [
        { label: "导出当前选择商品", value: 1011, },
        { label: "导出筛选条件下所有商品", value: 1012, },
        { label: "上传商品ID导出", value: 1013, },
        { label: "导出动销品", value: 1015, },
        { label: "导出白底图", value: 1016, },
        { label: "导出商品图片", value: 1025, }
      ]
      if (this.isPddShop) {
        types.push({ label: "导出拼多多建议价", value: 1017 })
        types.push({ label: "热销商品ISBN", value: 1018, })
      }
      if (this.isTmallShop) {
        types.push({ label: "导出在售商品", value: 1019, })
      } else {
        types.push({ label: "导出在售商品", value: 1014, })
      }
      if (this.pddOrDouyin) {
        types.splice(4, 0, { label: "导出规格商品", value: 1020 })
      }
      return types
    },
    exportFields() {
      const options = [
        { label: "当当ID", value: "needProductId", },
        { label: this.pddOrDouyin ? "外平台SPUID" : "外平台ID", value: "needOuterCode", },
        { label: this.pddOrDouyin ? "外平台SKUID" : "SKUID字段", value: "needOuterSkuId", },
        { label: "商品名称", value: "needProductName", },
        { label: "是否预售", value: "needOuterPresale", },
        // { label: '商品库存', value: 'needStock', },
        // { label: '当当三仓库存', value: 'needDdStock', },
        { label: "外卖场销量", value: "needSaleQuantity", },
        { label: "外卖场销售金额", value: "needSaleAmount", },
        { label: "商品定价", value: "needPrice", },
        { label: "商品当当价", value: "needDdPrice", },
        { label: "商品外平台价", value: "needOuterPrice", },
        { label: "商品状态", value: "needSaleStatus", },
        { label: "商品发布时间", value: "needPublishDate", },
        { label: "商品主站分类", value: "needDdCategory", },
        { label: "商品外平台分类", value: "needOuterCategory", },
      ]
      if (this.isTmallShop) {
        options.push(...[
          { label: "天猫三仓可售", value: "needOuterSaleStock", },
          { label: "天猫三仓总量", value: "needOuterTotalStock", },
          { label: "天猫三仓占用", value: "needOuterOccupied", },
        ])
      } else if (this.isPddShop) {
        options.push(...[
          { label: "商品进价", value: "needImportPrice" },
          { label: "商品ISBN", value: "needStandardId" },
          { label: "当当SPUID", value: "needDangDangSPUId" },
          { label: "款式", value: "needStyle" },
          { label: "版本", value: "needVersion" },
        ])
      } else if (this.isDouyinShop) {
        options.push(...[
          { label: "当当SPUID", value: "needDangDangSPUId" },
          { label: "款式", value: "needStyle" },
          { label: "版本", value: "needVersion" },
        ])
      }
      return options
    },
  },
  methods: {
    handleRemoveFile() {
      this.fileList = []
      this.formData.uploadFile = ""
    },
    // 导出类型
    handleExportTypes(v) {
      if (v === 1020) {
        this.formData.fields = this.exportFields.map(item => item.value)
      }
    },
    // 选择店铺
    handleShopChange() {
      this.formData.taskSubType = 1011
      this.formData.fields = []
      this.$refs.form.clearValidate()
    },
    // 获取任务模板
    getTaskTemplate(filename, suffix) {
      DownloadTaskTemplate({
        groupType: this.groupType,
        taskType: this.formData.taskType,
        taskSubType: this.formData.taskSubType,
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
          fileItem.name = data
          fileItem.status = "success"
          this.$message.success("上传成功")
        })
        .catch((error) => {
          options.onError(error)
          fileItem.status = "fail"
        })
        .finally(() => {
          this.isUploadLoading = false
        })
    },
    async handlePublish() {
      if (this.isPublishing) return
      this.isPublishing = true
      try {
        await this.$refs.form.validate()
        const {
          taskType,
          taskSubType,
          partnerId,
          uploadFile,
          ...condition
        } = this.formData

        const data = {
          taskType,
          taskSubType,
          partnerId,
        }
        let queryCondition = {}
        if (taskSubType === 1011 || taskSubType === 1020) {
          if (this.selectedShopIds.length === 0) {
            return this.$message.warning("请在列表页选择商品")
          }
          queryCondition.ids = this.selectedShopIds
        }
        if (taskSubType === 1012) {
          Object.entries(this.queryParams).forEach(([key, value]) => {
            queryCondition[key] = value
          })
        }
        if (taskSubType === 1011 || taskSubType === 1012 || taskSubType === 1013 || taskSubType === 1020) {
          this.exportFields.forEach(field => {
            if (condition.fields.find(item => item === field.value)) {
              queryCondition[field.value] = true
            } else {
              queryCondition[field.value] = false
            }
          })
        }
        if (taskSubType === 1013) {
          if (this.activeName === "manual") {
            queryCondition.productIds = condition.productIds.split(/[\n\r]\s*/)
          } else {
            data.uploadFile = uploadFile
          }
        }
        if (taskSubType === 1016 || taskSubType === 1025) {
          if (this.activeName === "manual") {
            queryCondition = condition.productIds.split(/[\n\r]\s*/)
          } else {
            data.uploadFile = uploadFile
          }
        }
        data.queryCondition = JSON.stringify(queryCondition)
        await TaskCreate(data)
        this.$message.success("正在导出中，请前往下载中心查看导出状态")
        this.handleClose()
      } catch (error) {
        console.warn(error)
      } finally {
        this.isPublishing = false
      }
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
  .export-fields {
    display: grid;
    grid: auto-flow / repeat(5, 1fr);
    ::v-deep .el-checkbox {
      margin: 0;
    }
  }
}
.drawer-footer {
  flex: none;
  position: sticky;
  bottom: 0;
  z-index: 1;
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
