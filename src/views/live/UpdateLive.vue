<template>
  <div class="activity-wrapper">
    <div class="arrow" v-loading="loading">
      <el-steps :active="0" space="500px" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品及锁库存"></el-step>
        <el-step title="促销"></el-step>
        <el-step title="确认提交"></el-step>
      </el-steps>
      
      <el-form class="my-item-form" size="medium" :model="form" :rules="rules" ref="form" label-width="80px">
        <el-row>
          <el-main>
            <el-col :span="13">
              <el-form-item label="直播名称" prop="liveName">
                <el-input v-model="form.liveName" style="width: 202px;"></el-input>
              </el-form-item>

              <el-form-item label="开始时间" prop="startTime">
                <el-date-picker
                  v-model="form.startTime"
                  type="datetime"
                  placeholder="选择直播开始时间"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  style="width: 202px;">
                </el-date-picker>
              </el-form-item>

              <el-form-item label="结束时间" prop="endTime">
                <el-date-picker
                  v-model="form.endTime"
                  type="datetime"
                  placeholder="选择直播结束时间"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  style="width: 202px;">
                </el-date-picker>
              </el-form-item>

              <el-form-item label="直播店铺" prop="platformId">
                <el-select v-model="form.platformId" clearable placeholder="请选择">
                  <el-option v-for="item in platformList" :key="item.id" :label="item.name" :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="直播类型" prop="liveType">
                <el-select v-model="form.liveType" clearable placeholder="请选择">
                  <el-option v-for="item in liveTypeList" :key="item.id" :label="item.name" :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="包装耗材" prop="consumableType">
                <el-select v-model="form.consumableType" clearable placeholder="请选择">
                  <el-option v-for="item in consumableTypeList" :key="item" :label="item" :value="item">
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="包装类型" prop="packageType">
                <el-select v-model="form.packageType" clearable placeholder="请选择">
                  <el-option v-for="item in packageTypeList" :key="item" :label="item" :value="item">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-main>
        </el-row>
        <div style="text-align: center">
          <el-button size="medium" type="primary" @click="submit">下一步</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import {
  CreateLiveBasic,
  UpdateLiveInfo,
  GetLiveInfoByLiveId,
} from "@/api/live"

export default {
  data() {
    const checkStartTime = (_, value, callback) => {
      if (!value) {
        return callback(new Error("请选择直播开始时间"))
      }
      this.$refs.form.clearValidate("endTime")
      const { endTime } = this.form
      if (endTime && new Date(value) >= new Date(endTime)) {
        return callback(new Error("开始时间应大于结束时间"))
      }
      callback()
    }
    const checkEndTime = (_, value, callback) => {
      if (!value) {
        return callback(new Error("请选择直播结束时间"))
      }
      this.$refs.form.clearValidate("startTime")
      const { startTime } = this.form
      if (startTime && new Date(startTime) >= new Date(value)) {
        return callback(new Error("结束时间应小于开始时间"))
      }
      callback()
    }
    return {
      loading: false,
      form: {
        liveName: "",
        platformId: "",
        liveType: "",
        consumableType: "",
        packageType: "",
        startTime: "",
        endTime: "",
        liveId:"",
        creationDate:"",
      },
      rules: {
        liveName :[{required: true, message: "请输入直播名称", trigger: "blur"}],
        platformId :[{required: true, message: "请选择", trigger: "blur"}],
        liveType :[{required: true, message: "请选择", trigger: "blur"}],
        consumableType: [{ required: true, message: "请选择", trigger: "blur" }],
        packageType: [{ required: true, message: "请选择", trigger: "blur" }],
        startTime: [{ required: true, validator: checkStartTime, trigger: "change" }],
        endTime: [{ required: true, validator: checkEndTime, trigger: "change" }],
      },
      platformList: [],
      liveTypeList: [],
      packageTypeList: [],
      consumableTypeList: [],
    }
  },
  created() {
    this.getCreateLiveBasic()
    this.getInfo()
  },
  methods: {
    getInfo(){
      const {
        liveId,
      } = this.$route.params
      const formData = new FormData()
      formData.append("liveId", liveId)
      this.loading = true
      GetLiveInfoByLiveId(formData).then(data =>{
        if (data.code === 200) {
          this.form = {
            ...data.data,
          }
        }
      }).finally(() => {
        this.loading = false
      })
    },
    getCreateLiveBasic(){
      CreateLiveBasic().then(data => {
        this.platformList = data.data.platformList
        this.liveTypeList = data.data.liveTypeList
        this.packageTypeList = data.data.packageTypeList
        this.consumableTypeList = data.data.consumableTypeList
      })
    },
    submit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.save()
        } else {
          return false
        }
      })
    },
    save(){
      const {
        liveId,
      } = this.$route.params
      this.form.liveId = liveId
      UpdateLiveInfo(this.form).then(data => {
        if (data.code === 200){
          var platformId = this.form.platformId
          this.$router.push(`/living/product/productAndStock/${liveId}/${platformId}`)
        }
      })
    },
  },
}
</script>

<style lang="scss">
  .flex {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .activity-wrapper {
    padding: 16px;
    background-color: #fff;

    .el-row {
      margin-bottom: 15px;
    }
  }
</style>
