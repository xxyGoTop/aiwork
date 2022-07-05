<template>
<el-drawer
  :title="title"
  :visible.sync="drawer"
  @close="handleClose()"
  size="97%">
  <div class="stock-wrapper" v-loading="doading">
    <el-tabs v-model="activeName" class="drawer-tabs" @change="handleTabClick">
      <el-tab-pane label="手动录入" name="manual" class="tab-pane" v-if="editStatus === 1 || editStatus === 2"></el-tab-pane>
      <el-tab-pane label="上传文件" name="upload" class="tab-pane" v-if="editStatus === 1 || editStatus === 3"></el-tab-pane>
    </el-tabs>
    <div class="drawer-form">
      <el-form ref="stock" label-position="top" :model="queryForm" :rules="rules">
        <el-form-item label="选择店铺" prop="partnerId">
          <el-select placeholder="选择店铺" style="width: 400px" :disabled="disabled" v-model="queryForm.partnerId" @change="queryForm.lockStockType = 1">
            <el-option 
              v-for="(shop, index) in shops"
              :label="shop.partnerName"
              :value="shop.partnerId"
              :key="index">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间" prop="stockDate">
          <el-date-picker
            v-model="queryForm.stockDate"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            :disabled="disabled">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="锁库存类型" prop="lockStockType" v-if="groupType === 1">
          <el-select style="width: 400px" v-model="queryForm.lockStockType" @change="() => goods = []">
            <el-option 
              v-for="(ty, k) in lockTypes"
              :label="ty.label"
              :value="ty.value"
              :key="k">
            </el-option>
          </el-select>
        </el-form-item>
        <template v-if="activeName === 'manual'">
          <el-form-item label="锁库存商品" required>
            <div class="stock-list" v-loading="isQueryLoading">
              <el-row type="flex" class="stock-list-header stock-row">
                <div class="stock-row-left stok-flex">
                  <div class="stock-row-col" style="width: 120px">商品ID</div>
                  <div class="stock-row-col" style="width: 120px;">
                    商品名称
                  </div>
                  <div class="stock-row-col">外卖场库存数</div>
                </div>
                <div class="stock-row-right">
                  <el-row type="flex">
                    <div class="stock-row-col">仓库</div>
                    <div class="stock-row-col">当当可售</div>
                    <div class="stock-row-col" style="width: 200px">{{stockTitle}}(值/%)</div>
                    <template v-if="queryForm.lockStockType === 2">
                      <div class="stock-row-col" style="width: 200px">最小值(%)</div>
                      <div class="stock-row-col" style="width: 200px">补锁值(值/%)</div>
                    </template>
                  </el-row>
                </div>
              </el-row>
              <el-row type="flex" class="stock-list-item stock-row" v-for="(good, index) in goods" :key="index">
                <div class="stock-row-left stok-flex">
                  <div class="stock-row-col stok-flex center" style="width: 120px">
                    <el-input
                      @blur="handleChangeProductId(good.productId)"
                      :disabled="disabled"
                      v-model="good.productId"
                      style="width: 100px">
                    </el-input>
                  </div>
                  <div class="stock-row-col stok-flex stock-name" :title="good.productName" style="width: 120px; justify-content: center;">
                    {{good.productName ? good.productName.slice(0, 10) : ''}}
                  </div>
                  <div class="stock-row-col stok-flex center">
                    {{good.outerStock}}
                  </div>
                </div>
                <div class="stock-row-right">
                  <el-row type="flex" v-for="(stock, stockIndex) in good.stocks" :key="stock.warehouseId">
                    <div class="stock-row-col stok-flex center">{{stock.warehouseName}}</div>
                    <div class="stock-row-col stok-flex center">{{stock.ddStock}}</div>
                    <div class="stock-row-col stok-flex center" style="width: 200px" v-if="!stock.remark">
                      <el-input-number
                        style="width: 80px; margin-right: 15px;"
                        :min="0"
                        :precision="0"
                        :controls="false"
                        :disabled="!disabled && stock.stockLockFlag"
                        v-model="stock.stockLockNum">
                      </el-input-number>
                      <span class="stock-lock-tip" v-if="!disabled && stock.stockLockFlag">已锁定库存，请补锁</span>
                      <el-select v-model="stock.unit" style="width: 60px" v-else>
                        <el-option label="值" :value="1"></el-option>
                        <el-option label="%" :value="2"></el-option>
                      </el-select>
                    </div>
                    <div class="stock-row-col stok-flex center" style="width: 200px" v-else>
                      <span class="stock-lock-error">{{stock.remark}}</span>
                    </div>
                    <!-- 自动锁库存 -->
                    <template v-if="queryForm.lockStockType === 2">
                      <div class="stock-row-col stok-flex center" style="width: 200px">
                        <el-input-number
                          style="width: 80px;"
                          :min="0"
                          :precision="0"
                          :controls="false"
                          :disabled="!disabled && stock.stockLockFlag"
                          v-model="stock.minThresholdNum">
                        </el-input-number>
                      </div>
                      <div class="stock-row-col stok-flex center" style="width: 200px">
                        <el-input-number
                          style="width: 80px; margin-right: 15px;"
                          :min="0"
                          :precision="0"
                          :controls="false"
                          :disabled="!disabled && stock.stockLockFlag"
                          v-model="stock.addStockLockNum">
                        </el-input-number>
                        <el-select v-model="stock.addUnit" style="width: 60px">
                          <el-option label="值" :value="1"></el-option>
                          <el-option label="%" :value="2"></el-option>
                        </el-select>
                      </div>
                    </template>
                    <div class="stock-row-col stok-flex center" @click="deleteLockGoods(index, stockIndex)">
                      <span class="button-ctrl-danger">删除</span>
                    </div>
                  </el-row>
                </div>
              </el-row>
            </div>
          </el-form-item>
          <div class="stock-ctrl" @click="addLockGoods" v-if="!disabled">
            <i class="el-icon el-icon-plus"></i>
            添加
          </div>
        </template>
        <!--upload-->
        <template v-else>
          <el-form-item label="下载模板，按格式填写内容">
            <a class="link" @click="getTaskTemplate(queryForm.lockStockType === 1 ? '单次锁库存模板' : '自动锁库存模板', 'xlsx')">
              <Icon name="excel" class="link-icon"></Icon>
              <span>{{ queryForm.lockStockType === 1 ? '单次锁库存模板' : '自动锁库存模板' }}</span>
            </a>
          </el-form-item>
          <el-form-item label="上传" prop="uploadFile">
            <el-upload
              class="upload"
              ref="upload"
              action="#"
              drag
              style="max-width: 400px"
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
      <el-button type="primary" :disabled="!lockForm.partnerId" :loading="loading" @click="handleCreateTask">提交</el-button>
    </div>
  </div>
</el-drawer>
</template>

<script>
import {
  addStockLock,
  queryStockByProduct,
} from '@/api/stock';
import {
  UploadFile,
  DownloadTaskTemplate,
  TaskCreate,
} from '@/api/goods/task';
import {
  acceptTypes,
  saveFile,
  isValid,
} from '@/util';

const fileTypes = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'xls',
  'xlsx',
];
const lockGoods = {
  productId: '',
  productName: '',
  outerStock: '',
  stocks: [
    {
      warehouseName: '天津',
      warehouseId: 30,
      stockLockNum: '',
      ddStock: '',
      unit: 1,
      stockLockFlag: false,
    },
    {
      warehouseName: '无锡',
      warehouseId: 17,
      stockLockNum: '',
      ddStock: '',
      unit: 1,
      stockLockFlag: false,
    },
    {
      warehouseName: '广州',
      warehouseId: 15,
      stockLockNum: '',
      ddStock: '',
      unit: 1,
      stockLockFlag: false,
    }
  ]
};

// 库存类型-自动锁库存值
const autoLockRow = {
  minThresholdNum: '', // 最小值
  addUnit: 1, // 补锁单位
  addStockLockNum: '', // 补锁值
}

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    doading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    products: {
      type: Array,
      default: function() {
        return [];
      } 
    },
    row: {
      type: Array,
      default: function() {
        return [];
      } 
    },
    shops: {
      type: Array,
      default: function() {
        return [];
      }
    },
    title: {
      type: String,
      default: '新增锁库存'
    },
    stockTitle: {
      type: String,
      default: '首次锁库存'    
    },
    lockForm: {
      type: Object,
      default: function() {
        return {
          partnerId: '',
          stockDate: null,
        };
      }
    },
    editStatus: {
      type: Number,
      default: 1,
    },
    lockType: {
      type: Object,
      default: function() {
        return {};
      },
    },
    edited: {
      type: Number,
      default: 0,
    },
  },
  // 普通锁taskSubType：2021  自动锁：2022
  data() {
    return {
      activeName: 'manual',
      queryForm: {
        pratnerId: '',
        stockDate: null,
        lockStockType: 1,
        taskType: 202,
        taskSubType: 2021,
        uploadFile: '',
      },
      fileList: [],
      goods: [],
      isUploadLoading: false,
      isQueryLoading: false,
      loading: false,
      rules: {
        partnerId: [
          { required: true, message: '请选择店铺', trigger: 'blur' }
        ],
        stockDate: [
          { required: !this.disabled, message: '请选择时间', trigger: 'blur' }
        ],
        lockStockType: [
          { required: true, message: '请选择锁库存类型', trigger: 'blur' }
        ],
      },
      // 锁库存类型
      lockTypes: [
        { value: 1, label: '单次锁库存' },
        { value: 2, label: '自动锁库存' }
      ],
    }
  },
  computed: {
    drawer: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    groupType() {
      const findedShop = this.shops.find(shop => shop.partnerId === this.queryForm.partnerId);
      return findedShop ? findedShop.groupType : '';
    },
  },
  watch: {
    lockForm: function(val) {
      this.queryForm = { 
        ...val,
        taskType: 202,
        uploadFile: '',
        lockStockType: 1,
      };
    },
    products: function(val) {
      this.goods = val;
      this.$refs.stock.clearValidate();
    },
    editStatus: function(val) {
      this.activeName = +val === 3 ? 'upload' : 'manual'
    },
  },
  methods: {
    // 删除文件
    handleRemoveFile() {
      this.queryForm.uploadFile = '';
      this.fileList = [];
    },
    isValid,
    // 添加锁库存行
    addLockGoods() {
      if (this.groupType === 1 && this.queryForm.lockStockType === 2) {
        lockGoods.stocks = lockGoods.stocks.map(item => {
          return {
            ...item,
            ...autoLockRow
          }
        })
      }
      this.goods.push(JSON.parse(JSON.stringify(lockGoods)));
    },
    // 删除锁库存行
    deleteLockGoods(index, stockIndex) {
      const stocks = this.goods[index].stocks;
      if (stocks.length === 1) {
        this.$delete(this.goods, index)
      } else {
        this.$delete(stocks, stockIndex)
      }
    },
    // 手动提交
    addStockLock() {
      const lockDetailList = [];
      const { partnerId, stockDate } = this.queryForm;
      this.loading = true;
      this.goods.forEach(good => {
        good.stocks.forEach(stock => {
          const stockRow = {
            productId: good.productId,
            stockLockNum: stock.stockLockNum,
            unit: stock.unit,
            warehouseId: stock.warehouseId,
            lockType: Object.keys(this.lockType).length ? this.lockType[good.productId] : 1,
            startTime: stockDate ? stockDate[0] : '',
            endTime: stockDate ? stockDate[1] : '',
          };
          if (this.groupType === 1) {
            stockRow.minThresholdNum = stock.minThresholdNum;
            stockRow.addUnit = stock.addUnit
            stockRow.addStockLockNum = stock.addStockLockNum
          }
          lockDetailList.push(stockRow)
        })
      });
      const data = {
        partnerId,
        lockDetailList,
        edited: this.edited ? 1 : 0,
      };
      if (this.groupType === 1) data.lockStockType = this.queryForm.lockStockType;
      addStockLock(data)
        .then(() => {
          this.$message.success('手动创建成功');
          this.handleClose();
          this.$emit('refresh');
        })
        .catch(error => {
          if (error.data && error.data.length) {
            this.makeErrorMsg(error.data)
          }
        })
        .finally(() => {
          this.loading = false;
        })
    },
    upStockLock() {
      const lockDetailList = [];
      const { partnerId } = this.queryForm;
      const { startTime, endTime } = this.row.length ? this.row[0] : {};
      this.loading = true;
      this.goods.forEach(good => {
        const { lockStartTime = '', lockEndTime = '' } = this.row.find(r => r.productId === good.productId) || {};
        if (good.stocks && good.stocks.length) {
          good.stocks.forEach(stock => {
            const stockRow = {
              productId: good.productId,
              stockLockNum: stock.stockLockNum,
              unit: stock.unit,
              warehouseId: stock.warehouseId,
              lockType: Object.keys(this.lockType).length ? this.lockType[good.productId] : stock.lockType,
              startTime: lockStartTime || startTime,
              endTime: lockEndTime|| endTime,
            };
            if (this.groupType === 1) {
              stockRow.minThresholdNum = stock.minThresholdNum;
              stockRow.addUnit = stock.addUnit
              stockRow.addStockLockNum = stock.addStockLockNum
            }
            lockDetailList.push(stockRow)
          })
        }
      });
      const data = {
        partnerId,
        lockDetailList,
        edited: this.edited ? 1 : 0,
      };
      if (this.groupType === 1) data.lockStockType = this.queryForm.lockStockType;
      addStockLock(data)
        .then(() => {
          this.$message.success('提交成功');
          this.handleClose();
          this.$emit('refresh');
        })
        .catch(error => {
          if (error.data && error.data.length) {
            this.makeErrorMsg(error.data)
          }
        })
        .finally(() => {
          this.loading = false;
        })
    },
    // 上传任务提交
    lockStockTaskCreate() {
      this.loading = true;
      const {
        taskType,
        partnerId,
        uploadFile,
        stockDate,
        lockStockType,
      } = this.queryForm;
      const queryCondition = {
        lockType: (this.disabled && this.edited === 0) ? 2 : 1,
        startTime: stockDate ? stockDate[0] : '',
        endTime: stockDate ? stockDate[1] : '',
      };
      if (this.activeName === 'upload') {
        if (!uploadFile) {
          return this.$message.warning('请上传文件')
        }
      }
      TaskCreate({
        taskType,
        taskSubType: lockStockType === 2 ? 2022 : 2021,
        partnerId,
        uploadFile,
        startTime: stockDate ? stockDate[0] : '',
        endTime: stockDate ? stockDate[1] : '',
        queryCondition: JSON.stringify(queryCondition),
      }).then(() => {
        this.$message.success('任务创建成功');
        this.$emit('refresh');
        this.handleClose();
      }).finally(() => {
        this.loading = false;
      })
    },
    handleCreateTask() {
      if (this.disabled) {
        if (this.row.length === 0 && this.activeName !== 'upload') {
          this.$message.error('没有可锁定的商品');
        } else if (this.activeName === 'upload') {
          this.lockStockTaskCreate()
        } else {
          this.upStockLock()
        }
        return
      }
      this.$refs.stock.validate(valid => {
        if (valid) {
          this.activeName === 'upload' ? this.lockStockTaskCreate() : this.addStockLock()
        }
      })
    },
    makeErrorMsg(errors = []) {
      this.goods = this.goods.map(good => {
        errors.forEach((err) => {
          if (+good.productId === err.productId) {
            const stocks = [];
            good.stocks.forEach(stock => {
              if (stock.warehouseId === err.warehouseId) {
                stocks.push({ ...stock, remark: err.remark });
              } else {
                stocks.push({ ...stock });
              }
            })
            good.stocks = stocks;
          }
        })
        return good
      })
    },
    queryStockByProduct(productId) {
      const { partnerId } = this.queryForm;
      if (!productId) return
      if (!partnerId) {
        this.$message.info('请先选择店铺')
        return
      }
      this.isQueryLoading = true;
      queryStockByProduct({
        partnerId,
        productId,
      }).then(data => {
        this.handleChangeProductt(data.data)
      }).finally(() => {
        this.isQueryLoading = false;
      })
    },
    handleChangeProductt(product) {
      if (!product) {
        this.$message.error('未找到相关数据')
        return
      }
      this.goods = this.goods.map(good => {
        if (+good.productId === product.productId) {
          good.productName = product.productName;
          good.outerStock = product.outerStock;
          good.stocks = product.stocks;
        }
        return good
      })
    },
    handleChangeProductId(productId) {
      this.queryStockByProduct(productId)
    },
    handleClose() {
      this.$refs.upload && this.$refs.upload.clearFiles();
      this.fileList = [];
      this.goods = [];
      this.activeName = 'manual';
      this.drawer = false;
    },
    handleTabClick(tab) {
      this.activeName = tab.name;
      this.$refs.stock.clearValidate();
    },
    // 获取任务模板
    getTaskTemplate(filename, suffix) {
      const params = {
        groupType: this.groupType,
        taskType: this.queryForm.taskType,
        taskSubType: this.queryForm.lockStockType === 1 ? 2021 : 2022
      };
      if (this.groupType === 1) {
        if (this.queryForm.lockStockType) {
          params.lockStockType = this.queryForm.lockStockType;
        } else {
          return this.$message.warning('请先选择锁库存类型')
        }
      }
      DownloadTaskTemplate(params)
        .then((data) => {
          saveFile(data, filename, suffix);
        })
        .catch(console.warn)
    },
    uploadBefore(file) {
      let message = '';
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
          this.queryForm.uploadFile = this.fileList.map(item => item.name).join(',');
        })
        .catch((error) => {
          options.onError(error);
          fileItem.status = 'fail';
        })
        .finally(() => {
          this.isUploadLoading = false;
        });
    },
  },
}
</script>

<style lang="scss">
.v-modal {
  z-index: 2008 !important;
}
.el-drawer__wrapper {
  z-index: 2009 !important;
}
</style>

<style lang="scss" scoped>
.stok-flex {
  display: flex;
  flex-direction: row;
  align-items: center;
  &.center {
    justify-content: center;
  }
}
.stock-ctrl {
  text-align: center;
  padding: 10px 0px;
  border: 1px dashed #eee;
  margin: 10px 0px;
  color: #fc5757;
  border-radius: 7px;
  cursor: pointer;
  &:active {
    opacity: 0.8;
  }
}
.stock-wrapper {
  display: flex;
  flex-direction: column;
  padding: 0 24px;
  height: calc(100vh - 62px);
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  .stock-list {
    &-header {
      height: 50px;
      line-height: 50px;
      background: #f3f5f6;
    }
    &-item {
      border: 1px solid #ebeef5;
      border-top: 0px;
      box-sizing: border-box;
    }
  }
  .stock-row {
    &-col {
      height: 50px;
      min-width: 90px;
      text-align: center;
    }
  }
  .stock-name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.stock-lock-tip {
  color: #fc5757;
  width: 60px;
  font-size: 12px;
  white-space: nowrap;
}
.stock-lock-error {
  color: #fc5757;
  width: 220px;
  font-size: 12px;
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
  justify-content: center;
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