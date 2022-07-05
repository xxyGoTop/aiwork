<template>
  <el-dialog
    title="修改地址映射"
    width="600px"
    :visible="visible"
    @close="handleClose"
    @open="getDangAddress('partner')"
    class="address-dialog">
    <el-form class="drawer-content" :model="mapForm" :rules="mapFormRules" label-width="112px" ref="mapForm">
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
        <span>{{ dangAddress.dangProvinceName || '-' }}，</span>
        <span>{{ dangAddress.dangCityName || '-' }}，</span>
        <span>{{ dangAddress.dangAreaName || '-' }}，</span>
        <span>{{ dangAddress.dangStreetName || '-' }}</span>
      </el-tag>
      <el-form-item label="当当省" prop="dangProvinceName">
        <el-select
          v-model="mapForm.dangProvinceName"
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
    <template #footer>
      <el-row type="flex" justify="end">
        <el-button type="primary" @click="handleEditAddrMap">确定</el-button>
        <el-button @click="handleClose">取消</el-button>
      </el-row>
    </template>
  </el-dialog>
</template>

<script>
import * as Address from '@/api/address';
import {
  hasValue,
} from '@/util.js';

const defaultMapForm = {
  partnerId: '',
  provinceName: '',
  cityName: '',
  areaName: '',
  streetName: '',
  dangProvinceName: '',
  dangCityName: '',
  dangAreaName: '',
  dangStreetName: '',
};

const defaultDangAddress = {
  dangProvinceName: '',
  dangCityName: '',
  dangAreaName: '',
  dangStreetName: '',
};

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    partnerId: {
      type: [Number, String],
      default: '',
    },
    payload: {
      type: String,
      default: '',
    },
  },
  watch: {
    visible(v) {
      if (v) {
        this.mapForm.partnerId = this.partnerId;
        const areas = this.payload.split('-');
        this.mapForm.provinceName = areas[0] || '';
        this.mapForm.cityName = areas[1] || '';
        this.mapForm.areaName = areas[2] || '';
        this.mapForm.streetName = areas[3] || '';
      }
    }
  },
  data() {
    return {
      mapForm: { 
        ...defaultMapForm,
      },
      mapFormRules: {
        dangProvinceName: [
          { required: true, message: '请选择当当省', trigger: 'blur' },
        ],
        dangCityName: [
          { required: true, message: '请选择当当市', trigger: 'blur' },
        ],
        dangAreaName: [
          { required: true, message: '请选择当当区', trigger: 'blur' },
        ],
      },
      dangAddress: { ...defaultDangAddress }, // 仅用于显示当当地址
      dangProvinces: [],
      dangCitys: [],
      dangAreas: [],
      dangStreets: [],
      currAddress: {}, // 当前地址信息
    }
  },
  methods: {
    getDangAddress(type) {
      if (type === 'street') {
        this.dangAddress.dangStreetName = this.mapForm.dangStreetName;
        return;
      }
      const params = {
        partnerId: this.partnerId,
      };
      if (type === 'province') {
        Object.assign(params, {
          dangProvinceName: this.mapForm.dangProvinceName,
        });
        this.dangAreas = [];
        this.dangStreets = [];
        this.mapForm.dangCityName = '';
        this.mapForm.dangAreaName = '';
        this.mapForm.dangStreetName = '';
        this.dangAddress.dangProvinceName = this.mapForm.dangProvinceName;
        this.dangAddress.dangCityName = '';
        this.dangAddress.dangAreaName = '';
        this.dangAddress.dangStreetName = '';
      } else if (type === 'city') {
        Object.assign(params, {
          dangProvinceName: this.mapForm.dangProvinceName,
          dangCityName: this.mapForm.dangCityName,
        });
        this.dangStreets = [];
        this.mapForm.dangAreaName = '';
        this.mapForm.dangStreetName = '';
        this.dangAddress.dangCityName = this.mapForm.dangCityName;
        this.dangAddress.dangAreaName = '';
        this.dangAddress.dangStreetName = '';
      } else if (type === 'area') {
        Object.assign(params, {
          dangProvinceName: this.mapForm.dangProvinceName,
          dangCityName: this.mapForm.dangCityName,
          dangAreaName: this.mapForm.dangAreaName,
        });
        this.mapForm.dangStreetName = '';
        this.dangAddress.dangAreaName = this.mapForm.dangAreaName;
        this.dangAddress.dangStreetName = '';
      }
      Address.getDangAddress(params)
        .then(({data}) => {
          if (type === 'partner') {
            this.dangProvinces = data;
          } else if (type === 'province') {
            this.dangCitys = data;
          } else if (type === 'city') {
            this.dangAreas = data;
          } else if (type === 'area') {
            this.dangStreets = data;
          }
        })
        .catch(console.warn);
    },
    handleEditAddrMap() {
      this.$refs.mapForm.validate(valid => {
        if (valid) {
          const params = {};
          for (const [key, value] of Object.entries(this.mapForm)) {
            if (hasValue(value)) params[key] = value;
          }
          Address.updateDangAddress(params)
            .then(({ data }) => {
              if (data === 1) {
                this.$message.success('绑定成功');
                this.$emit('update:visible', false);
              } else {
                this.$message.warning(data);
              }
            })
            .catch(console.warn);
        }
      });
    },
    handleClose() {
      this.$emit('update:visible', false);
      this.mapForm = { ...defaultMapForm };
      this.dangAddress = { ...defaultDangAddress };
      this.dangProvinces = [];
      this.dangCitys = [];
      this.dangAreas = [];
      this.dangStreets = [];
    },
  }
}
</script>


<style lang="scss" scoped>
.address-dialog::v-deep{
  .el-dialog {
    border-radius: 8px;
    margin-top: 0;
    height: 600px;
    .el-dialog__body{
      height: calc(100% - 120px);
    }
  }
}
</style>