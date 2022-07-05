<template>
  <div class="activity-wrapper">
    <el-steps :active="1" space="500px" finish-status="success" align-center>
      <el-step title="基本信息"></el-step>
      <el-step title="商品及锁库存"></el-step>
      <el-step title="促销"></el-step>
      <el-step title="确认提交"></el-step>
    </el-steps>

    <label style="display: block;font-size: 16px;margin-bottom: 10px;">商品列表</label>
    <div style="margin-bottom: 10px">
      <div class="button-ctrl" style="margin-right: 10px" @click="addProduct">
        添加商品
      </div>
      <el-upload
        style="display: inline-block; margin-right: 8px"
        action="/"
        accept=".xlsx"
        :disabled="isProgress"
        :show-file-list="false"
        :http-request="handleTestSuccess">
        <div class="button-ctrl">批量上传</div>
      </el-upload>
      <a class="button-ctrl" href="/live-api/liveProduct/template" download>模板下载</a>
      <div class="button-ctrl-danger" @click="downloadTemplate" v-if="errorPath" style="margin-left: 10px;">异常下载</div>
    </div>
    
    <div class="progress-box flex" v-if="isProgress">
      <el-progress :text-inside="true" :stroke-width="17" :percentage="percentage" style="width: 300px;"></el-progress>
      <div class="progress-filename">{{filename}} {{percentage !== 100 ? '导入中..' : '导入完成'}}.</div>
    </div>

    <el-table style="width:100%;" :data="list" v-loading="loadingTable">
      <el-table-column prop="productId" label="当当商品ID" width="100"></el-table-column>
      <el-table-column prop="platformProductId" label="店铺商品ID" width="165"></el-table-column>
      <el-table-column prop="productName" label="商品名称">
      </el-table-column>
      <el-table-column prop="dangStockNum" label="当当库存" width="100"></el-table-column>
      <el-table-column prop="platformStockNum" label="店铺当前库存" width="100"></el-table-column>
      <el-table-column prop="preLockNum" label="锁库存" width="200">
        <template slot-scope="scope">
          <el-input-number v-model="scope.row.preLockNum" :min="0"></el-input-number>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template slot-scope="scope">
          <div class="button-ctrl-danger" @click="deleteProduct(scope.row)">删除</div>
        </template>
      </el-table-column>
    </el-table>

    <div style="text-align: center; margin-top: 20px;">
      <el-button size="medium" @click="handleBack">上一步</el-button>
      <el-button size="medium" type="primary" @click="updatePrelockNum" :loading="loading">下一步</el-button>
    </div>
  </div>
</template>
<script>
  import { saveFile } from '@/util';
  import {
    DownLiveProduct,
    GetLiveProductsByLiveId,
    LogicDeleteLiveProuct,
    UploadLiveProduct,
    UpdatePrelockNum,
    SaveLiveProduct
  } from '@/api/live';

  export default {
    data: () => {
      return {
        list: [],
        giftProductIds: '',
        loading: false,
        loadingTable: false,
        filename: '',
        isProgress: false,
        percentage: 10,
        errorPath: '',
      };
    },
    created() {
      this.getProductList();
    },
    methods: {
      getProductList() {
        const {
          liveId,
        } = this.$route.params;
        this.loadingTable = true;
        const param = { "liveId": liveId };
        GetLiveProductsByLiveId(param).then(data => {
          this.list = data.data || [];
        }).finally(() => {
          this.loadingTable = false;
        });
      },
      //模板下载
      downloadTemplate() {
        DownLiveProduct({
          path: this.errorPath,
        }).then(data => {
          if (!data) return;
          // const fileName = "商品上传异常数据.xlsx";
          saveFile(data, '商品上传异常数据', 'xlsx');
        });
      },
      handleTestSuccess(file) {
        const {
          liveId,
          platformId
        } = this.$route.params;
        const formData = new FormData()
        formData.append('file', file.file)
        formData.append("liveId", liveId)
        formData.append("platformId", platformId)

        this.filename = file.file.name;
        this.isProgress = true;
        this.percentage = 20;
        UploadLiveProduct(formData)
          .then(data => {
            if (data.code === 200) {
              this.percentage = 100;
              //如果包含错误文件
              if (data.data && data.data.hasError) {
                this.errorPath = data.data.errorPath;
                this.$message.error('数据有异常');
              } else {
                this.errorPath = '';
              }
            }
          })
          .finally(() => {
            setTimeout(() => {
              this.filename = '';
              this.isProgress = false;
            }, 1000);
            this.getProductList();
          });
      },
      deleteProduct(row) {
        const { liveId } = this.$route.params;
        const param = { "liveProductId": row.id, liveId };
        LogicDeleteLiveProuct(param).then(data => {
          if (data.code === 200) {
            //刷新表单数据
            this.getProductList();
          }
        })
      },
      updatePrelockNum(){
        const {
          liveId,
        } = this.$route.params;
        this.loading = true;
        UpdatePrelockNum({
          liveId: liveId,
          liveProducts: [...this.list],
        }).then(data => {
          if (data.code === 200 && data.data !== 'SYSTEM_ERROR') {
            this.$router.push(`/living/promo/list/${liveId}/0`);
          }
        }).finally(() => {
          this.loading = false;
        });
      },
      handleBack() {
        const {
          liveId,
        } = this.$route.params;
        this.$router.push(`/living/updateLive/${liveId}`);
      },
      addProduct () {
        const {
          liveId,
          platformId
        } = this.$route.params;
        let _this = this;
        const h = _this.$createElement;
        _this.$msgbox({
          title: '添加商品',
          message: h('div', {
            attrs: {
              class: 'el-textarea',
            },
          }, [
            h('textarea', {
              attrs: {
                class: 'el-textarea__inner',
                autocomplete: 'off',
                rows: 8,
                id:'giftProductIds',
                placeholder: '请输入要添加的商品ID，多个商品ID请用英文逗号隔开，每次最多支持50个商品ID，超过50个，则取前50个；',
              },
              value: _this.giftProductIds,
              on: { input: _this.onCommentInputChange }
            })
          ]),
          showCancelButton: true,
          closeOnClickModal: false,
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              if (_this.giftProductIds === '' || _this.giftProductIds === undefined) {
                this.$message.error('请至少维护一个商品')
              } else {
                var param = {productIds: _this.giftProductIds,liveId:liveId,platformId:platformId};
                SaveLiveProduct(param).then(data => {
                  if (data.code === 200 && data.data !== 'SYSTEM_ERROR') {
                    this.getProductList();
                    done();
                  }
                });
              }
            } else {
              done();
            }
          }
        }).finally(()=>{
          _this.giftProductIds = ''
          document.getElementById("giftProductIds").value = ''
        }).catch(()=>{
          _this.giftProductIds = ''
          document.getElementById("giftProductIds").value = ''
        });
      },
      onCommentInputChange() {
        this.giftProductIds = document.getElementById("giftProductIds").value;
      },
    },
  };
</script>

<style lang="scss">
  .el-message {
    z-index: 3100 !important;
  }
  .flex {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .progress-box {
    margin-bottom: 10px;
  }

  .progress-filename {
    margin-left: 15px;
    color: #666;
  }

  .activity-wrapper {
    padding: 16px;
    background-color: #fff;

    a {
      display: inline-block;
      text-decoration: none;
    }

    .el-row {
      margin-bottom: 15px;
    }
  }
</style>
