<template>
<el-drawer :visible="visible" title="批量商品改价" @close="handleClose" size="850px">
  <div class="drawer">
    <el-tabs v-model="activeName" class="drawer-tabs">
      <el-tab-pane label="手动录入" name="manual" class="tab-pane"></el-tab-pane>
      <el-tab-pane label="上传文件" name="upload" class="tab-pane"></el-tab-pane>
    </el-tabs>
    <div class="drawer-form">
      <el-form :model="formData" label-position="top" ref="form" :rules="rules">
        <el-form-item label="选择店铺" prop="partnerId">
          <el-select v-model="formData.partnerId" @change="handlePartnerChange" style="width: 220px">
            <el-option
              v-for="(shop, index) of shops"
              :key="index"
              :label="shop.partnerName"
              :value="shop.partnerId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="开始时间"
          prop="startTime"
          :rules="{ required: true, message: '请选择开始时间', trigger: 'blur' }">
          <el-date-picker
            v-model="formData.startTime"
            type="datetime"
            :disabled="formData.partnerId === -2 && activeName === 'manual'"
            placeholder="选择开始时间"
            value-format="yyyy-MM-dd HH:mm:ss">
          </el-date-picker>
        </el-form-item>
        <el-form-item
          label="结束时间"
          prop="endTime"
          :rules="{ required: true, message: '请选择结束时间', trigger: 'blur' }">
          <el-date-picker
            v-model="formData.endTime"
            type="datetime"
            :disabled="formData.partnerId === -2 && activeName === 'manual'"
            placeholder="选择结束时间"
            value-format="yyyy-MM-dd HH:mm:ss">
          </el-date-picker>
        </el-form-item>
        <el-form-item
          v-if="!isTmallShop && !isPddDy"
          label="是否可以被覆盖"
          prop="extra"
          :rules="{ required: true, message: '请选择是否可以被覆盖', trigger: 'change' }">
          <el-radio-group v-model="formData.extra">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
          <div>(是否可以被覆盖，勾选“是”：下次该商品改价，将覆盖本次改价结果和时间；勾选“否”：本次改价未结束前，此商品改价均会失败)</div>
        </el-form-item>
        <!--manual-->
        <template v-if="activeName === 'manual'">
          <el-form-item
            label="商品改价"
            prop="queryCondition">
            <el-table :data="formData.queryCondition">
              <el-table-column label="商品ID" width="120">
                <template #default="{ row, $index }">
                  <el-input
                    style="width: 100px"
                    v-model="row.productId"
                    @input="handleGetInfoById(row, $index)"
                    :disabled="formData.partnerId === -2"
                    ></el-input>
                </template>
              </el-table-column>
              <el-table-column label="商品名称" min-width="100">
                <template #default="{ row }">
                  <span v-if="row.productName" :title="row.productName" class="productName">{{ row.productName.slice(0, 10) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="原价" prop="originalPrice"></el-table-column>
              <el-table-column label="当当价" prop="ddSalePrice"></el-table-column>
              <el-table-column label="外平台售价" prop="outerSalePrice" width="100"></el-table-column>
              <el-table-column label="改价价格" width="120" v-if="groupType !== 2">
                <template #default="{ row }">
                  <el-input-number
                    :controls="false"
                    :precision="2"
                    style="width: 100px"
                    v-model="row.changePrice">
                  </el-input-number>
                </template>
              </el-table-column>
              <el-table-column label="单买价" width="120" v-if="groupType === 2">
                <template #default="{ row }">
                  <el-input-number
                    :controls="false"
                    :precision="2"
                    style="width: 100px"
                    v-model="row.pddSinglePrice"
                    :disabled="formData.partnerId === -2">
                  </el-input-number>
                </template>
              </el-table-column>
              <el-table-column label="拼团价" width="120" v-if="groupType === 2">
                <template #default="{ row }">
                  <el-input-number
                    :controls="false"
                    :precision="2"
                    style="width: 100px"
                    v-model="row.groupPursePrice"
                    :disabled="formData.partnerId === -2">
                  </el-input-number>
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template #default="{ row, $index }">
                  <el-button
                    type="text"
                    size="small"
                    @click="handleRemovePrice(row, $index)"
                    style="border:none"
                    :disabled="formData.partnerId === -2">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="formData.partnerId !== -2" class="add-price" @click="handleAddPrice">
              <i class="el-icon-plus"></i>添加
            </div>
          </el-form-item>
        </template>
        <!--upload-->
        <template v-else>
          <el-form-item label="下载模板，按格式填写内容">
            <a class="link" @click="getTaskTemplate('商品批量改价模板', 'xlsx')">
              <Icon name="excel" class="link-icon"></Icon>
              <span>商品批量改价模板</span>
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
      <el-button
        plain
        @click="handleClose"
        :disabled="formData.partnerId === -2 && activeName === 'manual'">
        取消
      </el-button>
      <el-button
        type="primary"
        @click="handlePublish"
        :disabled="formData.partnerId === -2 && activeName === 'manual'"
        >发布
      </el-button>
    </div>
  </div>
</el-drawer>
</template>

<script>
import {
  // fileSuffix,
  acceptTypes,
  saveFile,
  hasValue,
  filterSpace
} from '@/util';
import {
  UploadFile,
} from '@/api/goods/task';
import {
  BatchPriceSubmit,
  GetProductIndoById,
  DownloadTaskTemplate
} from '@/api/goods/price';

const fileTypes = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'xls',
  'xlsx',
];

const defaultFormData = {
  partnerId: '',
  taskType: 103,
  startTime: '',
  endTime: '',
  uploadFile: '',
  extra: 0,
};

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
      if (this.formData.queryCondition.length) {
        if (this.formData.queryCondition[0].productId) {
          callback()
        } else callback(new Error('请输入改价商品信息'));
      } else callback(new Error('请输入改价商品信息'));
    };
    const validateFiles = (_, value, callback) => {
      if (!this.formData.uploadFile) {
        callback(new Error('请上传文件'))
      } else callback();
    };
    return {
      formData: {
        ...defaultFormData,
        queryCondition: [
          {
            productId: '',
            productName: '',
            originalPrice: '',
            outerCode: '',
            ddSalePrice: '',
            outerSalePrice: '',
            changePrice: '',
          }
        ],
      },
      activeName: 'manual',
      isUploadLoading: false,
      uploadStatusMap: {
        pending: {
          icon: 'el-icon-loading',
          label: '上传中...',
        },
        success: {
          icon: 'el-icon-circle-check',
          label: '上传成功',
        },
        fail: {
          icon: 'el-icon-warning-outline',
          label: '上传失败',
        },
      },
      fileList: [],
      rules: {
        partnerId: [
          { required: true, message: '请选择店铺', trigger: 'blur' }
        ],
        queryCondition: [
          { required: true, validator: validatePids, trigger: 'blur' },
        ],
        uploadFile: [
          { required: true, message: '请上传文件', trigger: 'blur' },
          { validator: validateFiles, trigger: 'blur' }
        ],
      },
    };
  },
  watch: {
    pickShop() {
      this.formData.partnerId = Number(this.pickShop);
    },
  },
  computed: {
    groupType() {
      const findedShop = this.shops.find(shop => shop.partnerId === this.formData.partnerId);
      return findedShop ? findedShop.groupType : '';
    },
    isTmallShop() {
      return this.groupType === 1;
    },
    // 拼多多、抖音
    isPddDy() {
      return this.groupType === 2 || this.groupType === 3
    },
  },
  methods: {
    // 获取商品信息
    handleGetInfoById(row, $index) {
      const pid = filterSpace(row.productId);
      if (!hasValue(pid)) return
      GetProductIndoById({
        productId: pid,
        partnerId: this.formData.partnerId,
      })
        .then(({ data }) => {
          this.$nextTick(() => {
            if (this.groupType === 2) {
              this.formData.queryCondition.splice($index, 1, { productId: row.productId, ...data, groupPursePrice: '' });
            } else {
              this.formData.queryCondition.splice($index, 1, { productId: row.productId, ...data, changePrice: '' });
            }
          })
        })
        .catch(console.warn)
    },
    // 获取任务模板
    getTaskTemplate(filename, suffix) {
      DownloadTaskTemplate({
        groupType: this.groupType === 2 ? this.groupType : '',
        taskType: this.formData.taskType,
        // taskSubType: this.formData.taskSubType,
      })
        .then((data) => {
          saveFile(data, filename, suffix);
        })
        .catch(console.warn)
    },
    handleClose() {
      this.$refs.form.clearValidate();
      this.$refs.upload && this.$refs.upload.clearFiles();
      this.formData = {
        partnerId: '',
        taskType: 103,
        startTime: '',
        endTime: '',
        uploadFile: '',
        extra: 0,
      };
      this.formData.queryCondition = [
        {
          productId: '',
          productName: '',
          originalPrice: '',
          outerCode: '',
          ddSalePrice: '',
          outerSalePrice: '',
          changePrice: '',
        }
      ];
      this.formData.partnerId = Number(this.pickShop);
      this.activeName = 'manual';
      this.$emit('update:visible', false);
      this.fileList = [];
    },
    // 删除文件
    handleRemoveFile() {
      this.formData.uploadFile = '';
      this.fileList = [];
    },
    uploadBefore(file) {
      let message = '';
      // if (/[\u4e00-\u9fa5]/.test(file.name)) {
      //   message = '文件名不能含有中文';
      // }
      if (file.size > 10 * 1024 * 1024) {
        message = '文件不能大于10M';
      }
      if (!acceptTypes(file, ...fileTypes)) {
        message = '只能上传 xls/xlsx 格式文件';
      }
      // 文件是否通过检测
      if (message) {
        this.$message.warning(message);
        return false;
      }
    },
    uploadRequest(options) {
      this.isUploadLoading = true;
      const formData = new FormData();
      formData.append('uploadFile', options.file);
      const fileItem = {
        name: options.file.name,
        status: 'pending',
      };
      this.fileList = [fileItem];
      UploadFile(formData)
        .then(({ data }) => {
          options.onSuccess(data, options.file, [options.file]);
          fileItem.status = 'success';
          fileItem.name = data;
          this.$message.success('上传成功');
          this.formData.uploadFile = this.fileList.map(item => item.name).join(',');
        })
        .catch((error) => {
          options.onError(error);
          fileItem.status = 'fail';
        })
        .finally(() => {
          this.isUploadLoading = false;
        });
    },
    handlePublish() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const {
            taskType,
            partnerId,
            startTime,
            endTime,
            extra,
            ...condition
          } = this.formData;

          const data = {
            taskType,
            partnerId,
            startTime,
            endTime,
            extra: this.groupType === 1 ? 1 : extra
          };
          if (this.activeName === 'manual') {
            // 拼多多
            if (this.groupType === 2) {
              condition.queryCondition = condition.queryCondition.map(item => {
                if (item.productId) {
                  return {
                    productId: item.productId,
                    outerCode: item.outerCode,
                    name: item.productName,
                    outPrice: item.outerSalePrice,
                    singlePrice: item.pddSinglePrice,
                    groupPursePrice: item.groupPursePrice
                  }
                }
              })
              const isNum = condition.queryCondition.every(el => (+el.singlePrice > 0 && +el.groupPursePrice > 0))
              if (!isNum) return this.$message.error('存在修改价格非正数')
            } else {
              // 天猫、抖音
              condition.queryCondition = condition.queryCondition.map(item => {
                if (item.productId) {
                  return {
                    productId: item.productId,
                    outerCode: item.outerCode,
                    name: item.productName,
                    outPrice: item.outerSalePrice,
                    changePrice: item.changePrice
                  }
                }
              })
              const isNum = condition.queryCondition.every(el => +el.changePrice > 0)
              if (!isNum) return this.$message.error('存在修改价格非正数')
            }
            data.queryCondition = JSON.stringify(condition.queryCondition)
          } else {
            data.uploadFile = condition.uploadFile
          }
          console.log(condition.queryCondition)
          BatchPriceSubmit(data)
            .then(() => {
              if (data.partnerId === -2) {
                this.$message.success('任务创建成功，请前往各店铺查看详情');
              } else {
                this.$message.success('创建任务成功');
              }
              this.handleClose();
              this.$emit('success');
            })
            .catch(console.warn);
        }
      });
    },
    // 选择店铺change
    handlePartnerChange() {
      const colProps = {
        productId: '',
        productName: '',
        outerCode: '',
        originalPrice: '',
        ddSalePrice: '',
        outerSalePrice: '',
      };
      if (this.groupType === 2) {
        this.formData.queryCondition = [{
          ...colProps,
          pddSinglePrice: '',
          groupPursePrice: '',
        }]
      } else {
        this.formData.queryCondition = [{
          ...colProps,
          changePrice: '',
        }]
      }
    },
    handleAddPrice() {
      if (this.formData.queryCondition.length < 20) {
        const colProps = {
          productId: '',
          productName: '',
          outerCode: '',
          originalPrice: '',
          ddSalePrice: '',
          outerSalePrice: '',
        };
        if (this.groupType !== 2) {
          this.formData.queryCondition.push({
            ...colProps,
            changePrice: '',
          });
        } else {
          this.formData.queryCondition.push({
            ...colProps,
            pddSinglePrice: '',
            groupPursePrice: '',
          });
        }
      } else {
        this.$message.warning('最多可输入20个品')
      }
    },
    handleRemovePrice(_, index) {
      this.formData.queryCondition.splice(index, 1);
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
.productName{
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
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
.add-price {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  margin: 8px 10px 16px;
  border: 1px dashed #C1C1C1;
  border-radius: 5px;
  font-size: 14px;
  color: #fc5757;
  cursor: pointer;
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
