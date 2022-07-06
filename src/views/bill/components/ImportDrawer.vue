<template>
  <div class="data_import_wrap">
    <el-drawer
      title="数据导入"
      size="500px"
      :visible="visible"
      @close="handleClose">
      <div class="upload-wrap">
        <div class="upload-form">
          <el-input
            v-model="uploadForm.fileUrl"
            placeholder="单击输入框或按钮选择上传文件"
            @focus="handleUpload"
            style="min-width:220px;max-width:220px"
            ref="inputUpload">
          </el-input>
          <el-upload
            class="upload"
            ref="upload"
            action="#"
            accept=".xls, .xlsx"
            :multiple="false"
            :show-file-list="true"
            :before-upload="uploadBefore"
            :auto-upload="false"
            :http-request="customUpload">
            <el-button class="import-btn" type="primary" slot="trigger" size="small">选择文件</el-button>
            <el-button class="import-btn" type="primary" size="small" @click="handleDataImport">导入</el-button>
          </el-upload>
        </div>
        <span :style="{ color: '#FC5757', fontSize: '12px', display: isError ? 'block' : 'none', marginBottom: '5px' }">
          <i class="el-icon-info"></i>
          模板不正确
        </span>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import {
  ImportBill
} from "@/api/bill"

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      uploadForm: {
        fileUrl: "",
      },
      file: "",
      isError: false
    }
  },
  methods: {
    handleClose() {
      this.$emit("update:visible", false)
      this.$refs.upload.clearFiles()
      if (this.isError) this.isError = false
      this.file = ""
      this.uploadForm.fileUrl = ""
    },
    handleUpload() {
      if (this.uploadForm.fileUrl) {
        this.uploadForm.fileUrl = ""
      }
      if (this.isError) this.isError = false
      // this.$refs['upload'].$refs['upload-inner'].handleClick();
      this.$refs.upload.$children[0].$refs.input.click()
      this.$refs.inputUpload.blur()
    },
    uploadBefore(file) {
      if (this.isError) this.isError = false
      const fileTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ]
      if (!fileTypes.includes(file.type)) {
        this.isError = true
        return false
      }
      if (file.size > 500 * 1024 * 1024) {
        this.$message.warning("上传文件大小超过500MB")
        return false
      }
      this.file = file
      this.uploadForm.fileUrl = URL.createObjectURL(file)
      return true
    },
    customUpload(options) {
      if (!options.file) {
        this.$message.warning("请先选择上传文件")
        return
      }
      if (this.isError) this.isError = false
      const formData = new FormData()
      formData.append("uploadFile", options.file)
      ImportBill(formData)
        .then(({ code }) => {
          if (code === 200) {
            this.$message.success("文件上传成功")
            this.handleClose()
          }
        })
        .catch(console.warn)
    },
    // 导入
    handleDataImport() {
      this.$refs.upload.submit()
    }
  }
}
</script>

<style lang="scss">
.data_import_wrap{
  .el-drawer__body{
    padding: 16px;
  }
  .el-upload-list{
    position: relative;
    top:35px;
    left: -435px;
  }
}
</style>

<style lang="scss" scoped>
.upload-wrap{
  display: flex;
  flex-direction: column;
}
.upload-form, .upload{
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.import-btn{
  margin: 0 0 0 16px;
  width: 89.13px;
}
</style>