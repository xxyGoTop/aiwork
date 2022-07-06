<template>
<div class="page">
  <el-form inline :model="formModel" ref="form">
    <el-form-item label="合作方">
      <el-select v-model="formModel.partnerId" clearable placeholder="请选择合作方" @change="getOuterAddress('partner')">
        <el-option
          v-for="pt in partners"
          :key="pt.value"
          :label="pt.label"
          :value="pt.value">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="合作地址">
      <el-select
        v-model="formModel.provinceName"
        :disabled="!provinces.length"
        placeholder="请选择省"
        clearable
        @change="getOuterAddress('province')"
        style="width: 100px">
        <el-option
          v-for="addr of provinces"
          :key="addr"
          :label="addr"
          :value="addr">
        </el-option>
      </el-select>-
      <el-select
        v-model="formModel.cityName"
        :disabled="!citys.length"
        placeholder="请选择市"
        clearable
        @change="getOuterAddress('city')"
        style="width: 150px">
        <el-option
          v-for="addr of citys"
          :key="addr"
          :label="addr"
          :value="addr">
        </el-option>
      </el-select>-
      <el-select
        v-model="formModel.areaName"
        :disabled="!areas.length"
        placeholder="请选择区"
        clearable
        style="width: 200px">
        <el-option
          v-for="addr of areas"
          :key="addr"
          :label="addr"
          :value="addr">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="状态" label-width="55px">
      <el-select v-model="formModel.status" clearable placeholder="请选择状态">
        <el-option
          v-for="status in statusMap"
          :key="status.value"
          :label="status.label"
          :value="status.value">
        </el-option>
      </el-select>
    </el-form-item>
  </el-form>
  <el-row type="flex" justify="space-between" style="margin: 16px 0">
    <el-row type="flex">
      <el-button type="primary" @click="getList(1)">查询</el-button>
      <el-button type="info" @click="handleResetForm">重置</el-button>
    </el-row>
    <el-button type="primary" @click="addAddrVisible = true">新增外部地址</el-button>
  </el-row>
  <el-table :data="tableData">
    <el-table-column label="第三方" prop="partnerName"></el-table-column>
    <el-table-column label="第三方省" prop="provinceName"></el-table-column>
    <el-table-column label="第三方市" prop="cityName"></el-table-column>
    <el-table-column label="第三方区" prop="areaName"></el-table-column>
    <el-table-column label="第三方街道" prop="streetName"></el-table-column>
    <el-table-column label="当当省" prop="dangProvinceName"></el-table-column>
    <el-table-column label="当当市" prop="dangCityName"></el-table-column>
    <el-table-column label="当当区" prop="dangAreaName"></el-table-column>
    <el-table-column label="当当街道" prop="dangStreetName"></el-table-column>
    <el-table-column label="状态">
      <template #default="{ row }">
        <el-tag :type="statusMap[row.status].type">{{statusMap[row.status].label}}</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作">
      <template #default="{ row }">
        <div class="button-ctrl" @click="handleMapAddr(row)">{{row.status === 0 ? '绑定映射' : '修改映射'}}</div>
        <el-popconfirm :title="`确认设置状态为${row.status === 1 ? '无效' : '有效'}吗？`" @confirm="handleInvalid(row)" v-if="row.status !== 0">
          <div class="button-ctrl" slot="reference">设置{{row.status === 1 ? '无效' : '有效'}}</div>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
  <el-row type="flex" justify="end" style="margin-top: 16px;">
    <el-pagination
      @size-change="() => getList()"
      @current-change="getList"
      background
      :page-sizes="[10, 20, 50, 100]"
      :page-size.sync="formModel.pageSize"
      :current-page.sync="formModel.curPage"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </el-row>

  <el-drawer title="新增外部地址" :visible.sync="addAddrVisible" size="458px" @close="handleCloseDrawer('add')">
    <el-form class="drawer-content" :model="addForm" :rules="addFormRules" label-width="110px" ref="addForm">
      <el-form-item label="合作方" prop="partnerId">
        <el-select v-model="addForm.partnerId" placeholder="请选择合作方" style="width: 300px">
          <el-option
            v-for="pt in partners"
            :key="pt.value"
            :label="pt.label"
            :value="pt.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="第三方省ID" prop="provinceId">
        <el-input v-model="addForm.provinceId" style="width: 300px"></el-input>
      </el-form-item>
      <el-form-item label="第三方省名称" prop="provinceName">
        <el-input v-model="addForm.provinceName" style="width: 300px"></el-input>
      </el-form-item>
      <el-form-item label="第三方市ID" prop="cityId">
        <el-input v-model="addForm.cityId" style="width: 300px"></el-input>
      </el-form-item>
      <el-form-item label="第三方市名称" prop="cityName">
        <el-input v-model="addForm.cityName" style="width: 300px"></el-input>
      </el-form-item>
      <el-form-item label="第三方区ID" prop="areaId">
        <el-input v-model="addForm.areaId" style="width: 300px"></el-input>
      </el-form-item>
      <el-form-item label="第三方区名称" prop="areaName">
        <el-input v-model="addForm.areaName" style="width: 300px"></el-input>
      </el-form-item>
      <el-form-item label="第三方街道ID" prop="streetId">
        <el-input v-model="addForm.streetId" style="width: 300px"></el-input>
      </el-form-item>
      <el-form-item label="第三方街道名称" prop="streetName">
        <el-input v-model="addForm.streetName" style="width: 300px"></el-input>
      </el-form-item>
    </el-form>
    <el-row type="flex" justify="end" class="drawer-footer">
      <el-button type="primary" @click="handleAddAddress">确定</el-button>
      <el-button @click="addAddrVisible = false">取消</el-button>
    </el-row>
  </el-drawer>

  <el-drawer :title="`${currAddress.status === 0 ? '绑定' : '修改'}地址映射`" :visible.sync="mapAddrVisible" size="458px" @open="getDangAddress('partner')" @close="handleCloseDrawer('map')">
    <el-form class="drawer-content" :model="mapForm" :rules="mapFormRules" label-width="110px" ref="mapForm">
      <el-form-item label="合作方">
        <el-input disabled :value="mapForm.partnerId" style="width: 300px"></el-input>
      </el-form-item>
      <el-form-item label="第三方省名称">
        <el-input disabled :value="mapForm.provinceName" style="width: 300px"></el-input>
      </el-form-item>
      <el-form-item label="第三方市名称">
        <el-input disabled :value="mapForm.cityName" style="width: 300px"></el-input>
      </el-form-item>
      <el-form-item label="第三方区名称">
        <el-input disabled :value="mapForm.areaName" style="width: 300px"></el-input>
      </el-form-item>
      <el-form-item label="第三方街道名称">
        <el-input disabled :value="mapForm.streetName" style="width: 300px"></el-input>
      </el-form-item>
      <el-tag style="margin-bottom: 20px">
        当当地址：
        <span>{{dangAddress.dangProvinceName || '-'}}，</span>
        <span>{{dangAddress.dangCityName || '-'}}，</span>
        <span>{{dangAddress.dangAreaName || '-'}}，</span>
        <span>{{dangAddress.dangStreetName || '-'}}</span>
      </el-tag>
      <el-form-item label="当当省" prop="dangProvinceName">
        <el-select
          v-model="mapForm.dangProvinceName"
          :disabled="!dangProvinces.length"
          style="width: 300px"
          @change="getDangAddress('province')">
          <el-option
            v-for="addr of dangProvinces"
            :key="addr"
            :label="addr"
            :value="addr">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="当当市" prop="dangCityName">
        <el-select
          v-model="mapForm.dangCityName"
          :disabled="!dangCitys.length"
          style="width: 300px"
          @change="getDangAddress('city')">
          <el-option
            v-for="addr of dangCitys"
            :key="addr"
            :label="addr"
            :value="addr">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="当当区" prop="dangAreaName">
        <el-select
          v-model="mapForm.dangAreaName"
          :disabled="!dangAreas.length"
          style="width: 300px"
          @change="getDangAddress('area')">
          <el-option
            v-for="addr of dangAreas"
            :key="addr"
            :label="addr"
            :value="addr">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="当当街道" prop="dangStreetName">
        <el-select
          v-model="mapForm.dangStreetName"
          :disabled="!dangStreets.length"
          clearable
          style="width: 300px"
          @change="getDangAddress('street')">
          <el-option
            v-for="addr of dangStreets"
            :key="addr"
            :label="addr"
            :value="addr">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-row type="flex" justify="end" class="drawer-footer">
      <el-button type="primary" @click="handleEditAddrMap">确定</el-button>
      <el-button @click="mapAddrVisible = false">取消</el-button>
    </el-row>
  </el-drawer>
</div>
</template>

<script>
import * as Address from "@/api/address"
import {
  hasValue,
} from "@/util.js"

const defaultFormModel = {
  curPage: 1,
  pageSize: 10,
  partnerId: "",
  provinceName: "",
  cityName: "",
  areaName: "",
  status: "",
}

const defaultAddForm = {
  partnerId: "",
  provinceId: "",
  provinceName: "",
  cityId: "",
  cityName: "",
  areaId: "",
  areaName: "",
  streetId: "",
  streetName: "",
}

const defaultMapForm = {
  partnerId: "",
  provinceName: "",
  cityName: "",
  areaName: "",
  streetName: "",
  dangProvinceName: "",
  dangCityName: "",
  dangAreaName: "",
  dangStreetName: "",
}

const defaultDangAddress = {
  dangProvinceName: "",
  dangCityName: "",
  dangAreaName: "",
  dangStreetName: "",
}

export default {
  data() {
    return {
      total: 0,
      partners: [],
      provinces: [],
      citys: [],
      areas: [],
      statusMap: [
        { label: "初始化", value: "0", type: "" },
        { label: "有效", value: "1", type: "success" },
        { label: "失效", value: "2", type: "info" },
      ],
      formModel: { ...defaultFormModel },
      tableData: [],
      addAddrVisible: false,
      mapAddrVisible: false,
      addFormRules: {
        partnerId: [
          { required: true, message: "请选择合作方", trigger: "blur" },
        ],
        provinceId: [
          { required: true, message: "请输入第三方省Id", trigger: "blur" },
        ],
        provinceName: [
          { required: true, message: "请输入第三方省名称", trigger: "blur" },
        ],
        cityId: [
          { required: true, message: "请输入第三方市Id", trigger: "blur" },
        ],
        cityName: [
          { required: true, message: "请输入第三方市名称", trigger: "blur" },
        ],
        areaId: [
          { required: true, message: "请输入第三方区Id", trigger: "blur" },
        ],
        areaName: [
          { required: true, message: "请输入第三方区名称", trigger: "blur" },
        ],
      },
      mapFormRules: {
        dangProvinceName: [
          { required: true, message: "请选择当当省", trigger: "blur" },
        ],
        dangCityName: [
          { required: true, message: "请选择当当市", trigger: "blur" },
        ],
        dangAreaName: [
          { required: true, message: "请选择当当区", trigger: "blur" },
        ],
      },
      addForm: { ...defaultAddForm },
      mapForm: { ...defaultMapForm },
      dangAddress: { ...defaultDangAddress }, // 仅用于显示当当地址
      dangProvinces: [],
      dangCitys: [],
      dangAreas: [],
      dangStreets: [],
      currAddress: {}, // 当前地址信息
    }
  },
  methods: {
    getPartners() {
      Address.getPartners()
        .then(({data}) => {
          this.partners = data
        })
        .catch(console.warn)
    },
    getList(page) {
      if (page) {
        this.formModel.curPage = page
      }
      const params = {}
      for (const [key, value] of Object.entries(this.formModel)) {
        if (hasValue(value)) params[key] = value
      }
      Address.getAddressList(params)
        .then(({data}) => {
          this.total = data.total
          this.tableData = data.result
        })
        .catch(console.warn)
    },
    handleResetForm() {
      this.formModel = { ...defaultFormModel }
      this.provinces = []
      this.citys = []
      this.areas = []
    },
    getOuterAddress(type) {
      const params = {
        partnerId: this.formModel.partnerId,
      }
      if (type === "partner") {
        this.provinces = []
        this.citys = []
        this.areas = []
        this.formModel.provinceName = ""
        this.formModel.cityName = ""
        this.formModel.areaName = ""
        if (!this.formModel.partnerId) return
      } else if (type === "province") {
        this.citys = []
        this.areas = []
        this.formModel.cityName = ""
        this.formModel.areaName = ""
        if (!this.formModel.provinceName) return
        params.provinceName = this.formModel.provinceName
      } else if (type === "city") {
        this.areas = []
        this.formModel.areaName = ""
        if (!this.formModel.cityName) return
        params.provinceName = this.formModel.provinceName
        params.cityName = this.formModel.cityName
      }
      Address.getOuterAddress(params)
        .then(({data}) => {
          if (type === "partner") {
            this.provinces = data
          } else if (type === "province") {
            this.citys = data
          } else if (type === "city") {
            this.areas = data
          }
        })
        .catch(console.warn)
    },
    getDangAddress(type) {
      if (type === "street") {
        this.dangAddress.dangStreetName = this.mapForm.dangStreetName
        return
      }
      if (!this.mapForm.partnerId) return
      const params = {
        partnerId: this.mapForm.partnerId,
      }
      if (type === "province") {
        Object.assign(params, {
          dangProvinceName: this.mapForm.dangProvinceName,
        })
        this.dangAreas = []
        this.dangStreets = []
        this.mapForm.dangCityName = ""
        this.mapForm.dangAreaName = ""
        this.mapForm.dangStreetName = ""
        this.dangAddress.dangProvinceName = this.mapForm.dangProvinceName
        this.dangAddress.dangCityName = ""
        this.dangAddress.dangAreaName = ""
        this.dangAddress.dangStreetName = ""
      } else if (type === "city") {
        Object.assign(params, {
          dangProvinceName: this.mapForm.dangProvinceName,
          dangCityName: this.mapForm.dangCityName,
        })
        this.dangStreets = []
        this.mapForm.dangAreaName = ""
        this.mapForm.dangStreetName = ""
        this.dangAddress.dangCityName = this.mapForm.dangCityName
        this.dangAddress.dangAreaName = ""
        this.dangAddress.dangStreetName = ""
      } else if (type === "area") {
        Object.assign(params, {
          dangProvinceName: this.mapForm.dangProvinceName,
          dangCityName: this.mapForm.dangCityName,
          dangAreaName: this.mapForm.dangAreaName,
        })
        this.mapForm.dangStreetName = ""
        this.dangAddress.dangAreaName = this.mapForm.dangAreaName
        this.dangAddress.dangStreetName = ""
      }
      Address.getDangAddress(params)
        .then(({data}) => {
          if (type === "partner") {
            this.dangProvinces = data
          } else if (type === "province") {
            this.dangCitys = data
          } else if (type === "city") {
            this.dangAreas = data
          } else if (type === "area") {
            this.dangStreets = data
          }
        })
        .catch(console.warn)
    },
    handleMapAddr(row) {
      this.mapAddrVisible = true
      this.currAddress = row
      this.mapForm = {
        id: row.addressMapId,
        partnerId: row.partnerId,
        provinceName: row.provinceName,
        cityName: row.cityName,
        areaName: row.areaName,
        streetName: row.streetName,
        dangProvinceName: "",
        dangCityName: "",
        dangAreaName: "",
        dangStreetName: "",
      }
      this.dangAddress = {
        dangProvinceName: row.dangProvinceName,
        dangCityName: row.dangCityName,
        dangAreaName: row.dangAreaName,
        dangStreetName: row.dangStreetName,
      }
    },
    handleInvalid(row) {
      const params = {
        id: row.addressMapId,
        status: row.status,
        // partnerId: row.partnerId
      }
      Address.updateStatusById(params)
        .then(({ data }) => {
          if (data === 1) {
            this.$message.success("状态更新成功")
            this.getList()
          } else {
            this.$message.warning(data)
          }
        })
        .catch(console.warn)
    },
    handleAddAddress() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          const params = {}
          for (const [key, value] of Object.entries(this.addForm)) {
            if (hasValue(value)) params[key] = value
          }
          Address.addOuterAddress(params)
            .then(({ data }) => {
              if (data === 1) {
                this.$message.success("添加成功")
                this.addAddrVisible = false
                this.getList(1)
              } else {
                this.$message.warning(data)
              }
            })
            .catch(console.warn)
        }
      })
    },
    handleEditAddrMap() {
      this.$refs.mapForm.validate(valid => {
        if (valid) {
          const params = {}
          for (const [key, value] of Object.entries(this.mapForm)) {
            if (hasValue(value)) params[key] = value
          }
          Address.updateDangAddress(params)
            .then(({ data }) => {
              if (data === 1) {
                this.$message.success("绑定成功")
                this.mapAddrVisible = false
                this.getList(1)
              } else {
                this.$message.warning(data)
              }
            })
            .catch(console.warn)
        }
      })
    },
    handleCloseDrawer(type) {
      if (type === "add") {
        this.addForm = { ...defaultAddForm }
      } else if (type === "map") {
        this.mapForm = { ...defaultMapForm }
        this.dangAddress = { ...defaultDangAddress }
        this.dangProvinces = []
        this.dangCitys = []
        this.dangAreas = []
        this.dangStreets = []
      }
    },
  },
  created() {
    this.getPartners()
    this.getList()
  },
}
</script>

<style lang="scss" scoped>
.drawer-content {
  padding: 16px;
}
.drawer-footer {
  padding: 16px;
}
</style>
