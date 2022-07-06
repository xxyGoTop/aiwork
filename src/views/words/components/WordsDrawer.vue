<template>
  <el-drawer
    :title="type === 'add' ? '新增敏感词' : '删除敏感词'"
    size="500px"
    :visible="visible"
    @close="handleClose">
    <div class="drawer">
      <el-tabs v-model="activeName" @tab-click="handleTabClick" class="drawer-tabs" v-if="type === 'add'">
        <el-tab-pane label="手动录入" name="manual" class="tab-pane"></el-tab-pane>
        <el-tab-pane label="上传文件" name="upload" class="tab-pane" ></el-tab-pane>
      </el-tabs>
      <div class="drawer-form">
        <el-form :model="wordsForm" ref="wordsForm" :rules="rules" label-position="top">
          <el-form-item label="选择类型" prop="type">
            <el-select v-model="wordsForm.type">
              <el-option
                v-for="(opt, ky) in typeOptions"
                :key="ky"
                :label="opt"
                :value="ky">
              </el-option>
            </el-select>
          </el-form-item>
          <template v-if="activeName === 'manual'">
            <el-form-item label="敏感词" prop="words">
              <el-input
                type="textarea"
                v-model="wordsForm.words"
                :autosize="{ minRows: 5 }"
                :placeholder="`请输入敏感词，敏感词之间用回车隔开，最多支持输入100个`">
              </el-input>
            </el-form-item>
          </template>
          <template v-else>
            <el-form-item label="下载模板，按格式填写内容">
              <a class="link" @click="getTaskTemplate">
                <Icon name="excel" class="link-icon"></Icon>
                <span>{{ type === 'add' ? '敏感词批量新增模板' : '敏感词批量删除模板' }}</span>
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
          <template v-if="type === 'add'">
            <el-form-item label="处理方式" prop="processType">
              <el-radio-group v-model="wordsForm.processType">
                <el-radio
                  v-for="(ty, ky) in processOptions"
                  :key="ky"
                  :label="ky">
                  {{ ty }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="处理时效性" prop="treatTime" v-if="wordsForm.processType === '2'">
              <el-radio-group v-model="wordsForm.treatTime">
                <el-radio
                  v-for="(ty, ky) in timeOptions"
                  :key="ky"
                  :label="ky">
                  {{ ty }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
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
import { BatchAddWords, BatchDelWords, BatchTemplate  } from "@/api/words/list"
import { UploadFile } from "@/api/goods/task"
import {
  acceptTypes,
  saveFile,
  hasValue
} from "@/util"

const fileTypes = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "xls",
  "xlsx",
]

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: "add"
    },
    data: {
      type: Number,
      default: 1
    }
  },
  data() {
    const validateLen = (_, value, callback) => {
      if (hasValue(value) && value.indexOf("\n" || "\r") > -1) {
        this.wordsArr = value.split(/[\n\r]\s*/).filter(item => item)
        if (this.wordsArr.length > 100) {
          this.wordsArr = []
          callback(new Error("每次最多只能输入100个敏感词"))
        } else callback()
      } else {
        this.wordsArr = [value]
        callback()
      }
    }
    return {
      isUploadLoading: false,
      activeName: "manual",
      fileList: [],
      wordsForm: {
        words: "",
        type: "",
        treatTime: "",
        processType: "",
        taskType: 109,
        taskSubType: 1091,
        uploadFile: ""
      },
      typeOptions: {
        0: "低风险",
        1: "高风险",
      },
      timeOptions: {
        1: "夜间处理（不影响正常售卖）",
        2: "立即处理（可能会影响正常售卖）"
      },
      processOptions: {
        1: "影响新发商品",
        2: "处理全量商品"
      },
      wordsArr: [],
      rules: {
        words: [
          { required: true, message: "请输入敏感词", trigger: "blur" },
          { validator: validateLen, trigger: "blur" }
        ],
        type: { required: true, message: "请选择类型", trigger: "blur" },
        processType: { required: true, message: "请选择处理方式", trigger: "change" },
        treatTime: { required: true, message: "请选择处理时效", trigger: "change" },
      },
    }
  },
  methods: {
    handleClose() {
      this.$emit("update:visible", false)
      this.fileList = []
      this.wordsForm.uploadFile = ""
      this.wordsForm = {
        words: "",
        type: "",
        treatTime: "",
        processType: "",
        taskType: 109,
        taskSubType: 1091,
        uploadFile: ""
      }
      this.wordsArr = []
      this.$refs.wordsForm.clearValidate()
      this.activeName = "manual"
      this.$refs.upload && this.$refs.upload.clearFiles()
    },
    // 添加
    addWords() {
      const data = {
        taskType: 109,
        taskSubType: 1091,
        queryCondition: {
          riskLevel: this.wordsForm.type,
          handleType: this.wordsForm.processType,
          handleTime: this.wordsForm.treatTime
        }
      }
      if (this.activeName === "upload") {
        data.uploadFile = this.wordsForm.uploadFile
        data.queryCondition.words = ""
      } else {
        data.queryCondition.words = this.wordsArr.length ? this.wordsArr.join(",") : ""
      }
      data.queryCondition = JSON.stringify(data.queryCondition)
      BatchAddWords(data)
        .then(() => {
          this.$message.success("敏感词添加任务创建成功")
          this.handleClose()
          this.$emit("refresh")
        })
        .catch(console.warn)
    },
    // 删除
    delWords() {
      const data = {
        contents: this.wordsArr,
        riskLevel: +this.wordsForm.type
      }
      BatchDelWords(data)
        .then(({ code , data }) => {
          if (+code === 200) {
            if (data) {
              this.$message.warning(data)
            } else {
              this.$message.success("删除成功")
              this.handleClose()
              this.$emit("refresh")
            }
          }
        })
        .catch(console.warn)
    },
    // 获取任务模板
    getTaskTemplate() {
      BatchTemplate({ downloadType: "sensitive" })
        .then((data) => {
          saveFile(data, this.type === "add" ? "敏感词批量新增模板" : "敏感词批量删除模板", "xlsx")
        })
        .catch(console.warn)
    },
    handleTabClick() {
      this.$refs.wordsForm.clearValidate()
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
      const wordsForm = new FormData()
      wordsForm.append("uploadFile", options.file)
      const fileItem = {
        name: options.file.name,
        status: "pending",
      }
      this.fileList = [fileItem]
      UploadFile(wordsForm)
        .then(({ data }) => {
          options.onSuccess(data, options.file, [options.file])
          fileItem.status = "success"
          fileItem.name = data
          this.$message.success("上传成功")
          this.wordsForm.uploadFile = this.fileList.map(item => item.name).join(",")
        })
        .catch((error) => {
          options.onError(error)
          fileItem.status = "fail"
        })
        .finally(() => {
          this.isUploadLoading = false
        })
    },
    // 删除文件
    handleRemoveFile() {
      this.wordsForm.uploadFile = ""
    },
    // 提交
    handleSubmit() {
      if (this.type === "add") {
        this.$refs.wordsForm.validate(valid => {
          if (valid) {
            if (!this.wordsForm.uploadFile && this.activeName === "upload") {
              return this.$message.warning("请上传文件")
            }
            this.addWords()
          }
        })
      } else {
        const valids = []
        this.$refs.wordsForm.validateField(["type", "words"], err => {
          valids.push(err)
        })
        if (valids.every(item => !item)) {
          this.delWords()
        }
      }
    }
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
