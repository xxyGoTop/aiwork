<template>
<el-drawer
  :visible="visible"
  title="批量发布"
  @close="handleClose"
  :size="subType === 1023 ? '800px' : '400px'">
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
        <!--manual-->
        <template v-if="activeName === 'manual'">
          <el-form-item v-if="subType === 1023">
            <template #label>
              <span class="required-label">发布商品</span>
            </template>
            <el-table :data="queryCondition">
              <el-table-column min-width="120">
                <template #header>
                  <span class="required-label">当当ID</span>
                </template>
                <template #default="{ row }">
                  <el-form :model="row" ref="productRef">
                    <el-form-item
                      :rules="{ required: true, message: '当当ID不能为空', trigger: 'blur' }"
                      prop="productId">
                      <el-input v-model="row.productId"></el-input>
                    </el-form-item>
                  </el-form>
                </template>
              </el-table-column>
              <el-table-column min-width="120">
                <template #header>
                  <span class="required-label">SPUID</span>
                </template>
                <template #default="{ row }">
                  <el-form :model="row" ref="spuRef">
                    <el-form-item
                      :rules="{ required: true, message: 'SPUID不能为空', trigger: 'blur' }"
                      prop="spuProductId">
                      <el-input v-model="row.spuProductId"></el-input>
                    </el-form-item>
                  </el-form>
                </template>
              </el-table-column>
              <el-table-column width="120px">
                <template #header>
                  <span class="required-label">SPU/SKU值</span>
                </template>
                <template #default="{ row }">
                  <el-form :model="row" ref="skuRef">
                    <el-form-item
                      :rules="{ required: true, message: 'SPU或SKU值不能为空', trigger: 'blur' }"
                      prop="spuOrSku">
                      <el-select v-model="row.spuOrSku">
                        <el-option label="spu" value="spu"></el-option>
                        <el-option label="sku" value="sku"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-form>
                </template>
              </el-table-column>
              <el-table-column width="120">
                <template #header>
                  <span class="required-label">款式</span>
                </template>
                <template #default="{ row }">
                  <el-form :model="row" ref="styleRef">
                    <el-form-item
                      :rules="{ required: true, message: '款式不能为空', trigger: 'blur' }"
                      prop="style">
                      <el-input v-model="row.style"></el-input>
                    </el-form-item>
                  </el-form>
                </template>
              </el-table-column>
              <el-table-column label="版本" width="120">
                <template #default="{ row }">
                  <el-input v-model="row.version"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="70">
                <template #default="{ row, $index }">
                  <el-button type="text" size="small" @click="handleRemoveRow(row, $index)" v-if="queryCondition.length > 1">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="add-row" @click="handleAddRow" v-if="queryCondition.length < 20">
              <i class="el-icon-plus"></i>添加
            </div>
          </el-form-item>
          <el-form-item label="录入商品ID" prop="productIds" v-else>
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
            <a class="link" @click="getTaskTemplate(isTmallShop && (subType === 1021 || subType === 1022) ? '天猫-商品批量发布模板' : '商品批量发布模板', 'xlsx')">
              <Icon name="excel" class="link-icon"></Icon>
              <span>{{ isTmallShop && (subType === 1021 || subType === 1022) ? '天猫-商品批量发布模板' : '商品批量发布模板' }}</span>
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
  taskType: 102,
  partnerId: "",
  productIds: "",
  uploadFile: "",
}
/*
  taskSubType: 1021(单品发布) 1022(重复品发布) 1023(spu发布)
*/
// 默认spu数据
const rowProps = {
  productId: "",
  spuOrSku: "",
  spuProductId: "",
  style: "",
  version: "",
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
    // 任务子类型
    subType: {
      type: Number,
      default: 1021,
    }
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
        productIds: [
          { required: true, message: "请录入商品ID", trigger: "blur" },
          { validator: validatePids, trigger: "blur" }
        ],
        uploadFile: [
          { required: true, message: "请上传文件", trigger: "blur" },
        ],
      },
      fileList: [],
      queryCondition: [{...rowProps}],
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
    // 获取任务模板
    getTaskTemplate(filename, suffix) {
      const params = Object.create(null)
      if (this.subType === 1023) {
        params.taskSubType = 1023
      } else {
        params.groupType = this.groupType
        params.taskType = this.formData.taskType
        params.taskSubType = this.subType
      }
      // if (this.isTmallShop) params.taskSubType = this.subType;
      DownloadTaskTemplate(params)
        .then((data) => {
          // 解析下载excel
          excelReader(data, filename, suffix)
        })
        .catch(console.warn)
    },
    handleClose() {
      this.$refs.upload && this.$refs.upload.clearFiles()
      this.formData = { ...defaultFormData }
      this.formData.partnerId = Number(this.pickShop)
      this.activeName = "manual"
      this.$emit("update:visible", false)
      this.fileList = []
      this.formData.uploadFile = ""
      this.queryCondition = [{...rowProps}]
      this.$refs.productRef && this.$refs.productRef.clearValidate()
      this.$refs.spuRef && this.$refs.spuRef.clearValidate()
      this.$refs.skuRef && this.$refs.skuRef.clearValidate()
      this.$refs.styleRef && this.$refs.styleRef.clearValidate()
    },
    handleTabClick() {
      this.$refs.form.clearValidate()
    },
    // 添加行
    handleAddRow() {
      if (this.queryCondition.length < 20) {
        this.queryCondition.push({...rowProps})
      }
    },
    // 删除行
    handleRemoveRow(row, $index) {
      this.queryCondition.splice($index, 1)
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
    handleRemoveFile() {
      this.fileList = []
      this.formData.uploadFile = ""
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
            uploadFile,
            ...condition
          } = this.formData

          const data = {
            taskType,
            partnerId,
            taskSubType: this.subType
          }

          if (this.activeName === "manual") {
            if (this.subType === 1023) {
              const satisfyItem = this.queryCondition.filter(item => (item.productId && item.spuOrSku && item.spuProductId && item.style))
              if (!satisfyItem.length) {
                return this.$message.warning("至少填写完整一条发布商品信息")
              } else {
                data.queryCondition = JSON.stringify(satisfyItem)
              }
            } else {
              data.queryCondition = JSON.stringify(condition.productIds.split(/[\n\r]\s*/))
            }
          } else {
            data.uploadFile = uploadFile
          }
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
.el-table{
  ::v-deep {
    .el-form-item__error{
      position: relative;
    }
  }
}
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
.required-label::before{
  content: '*';
  color: #F56E88;
  margin-right: 4px;
}
.add-row {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  margin: 8px 0 16px;
  border: 1px dashed #C1C1C1;
  border-radius: 3px;
  font-size: 14px;
  color: #fc5757;
  cursor: pointer;
}
</style>
