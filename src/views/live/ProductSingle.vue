<template>
  <div class="activity-wrapper">
    <el-row type="flex" justify="start" align="middle">
      <div class="title">赠品列表</div>
    </el-row>
    <div style="margin-bottom: 20px" v-if="action !== '1'">
      <el-upload
        style="display: inline-block;margin-right: 10px"
        action=""
        accept=".xlsx"
        :show-file-list="false"
        :http-request="handleTestSuccess">
        <div class="button-ctrl">批量上传</div>
      </el-upload>
      <a class="button-ctrl" href="/live-api/product/single/template" download>模板下载</a>
      <div class="button-ctrl-danger" @click="downloadError" v-if="errorPath">异常下载</div>
    </div>

    <div v-for="(t,index) in list" v-bind:key="index" v-bind:id="index" style="margin-bottom: 20px">
      <div style="margin-bottom: 15px;">
        <label style="display: inline-block; font-size: 15px">{{index+1}}.</label> <label>商品编码<span style="font-size: 14px">{{t.mainProductId}}</span>,赠送以下商品</label>
        <div style="margin-left: 20px" class="button-ctrl-danger" @click="deleteMain(index)" v-if="action !== '1'">删除主商品</div>
      </div>
      <el-table style="width:100%;" :data="t.giftProductList">
        <el-table-column width="100">
          <template slot-scope="scope">
            {{scope.$index+1}}
          </template>
        </el-table-column>
        <el-table-column prop="giftProductName" label="赠品信息"></el-table-column>
        <el-table-column prop="giftProductPrice" label="价格（元）" width="180"></el-table-column>
        <el-table-column prop="ddStockNum" label="库存" width="180"></el-table-column>
        <el-table-column label="赠品数量">
          <template slot="header">
            <span style="padding-right: 2px;">每单赠赠品数量</span>
            <el-tooltip effect="dark" content="赠品数量是指满足赠送要求时，每单所赠送的数量" placement="right">
              <i class="el-icon el-icon-question"></i>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.num" :min="1" :max="5" label="赠品数量" :disabled="action === '1'"></el-input-number>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" v-if="action !== '1'">
          <template slot-scope="scope">
            <div class="button-ctrl-danger" @click="deleteProduct(index,scope.row)">删除</div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="empty-text" v-if="list.length === 0">暂无赠品信息</div>
    <div style="text-align: center" v-if="action !== '1'">
      <el-button size="medium" type="primary" @click="save">保存</el-button>
      <el-button size="medium" @click="cancel">取消</el-button>
    </div>
  </div>
</template>
<script>
  import { saveFile } from '@/util';
  import {ProductSingleList, UploadProducts, SaveProductSingle, DownloadError} from '@/api/live';

  export default {
    data: () => {
      return {
        list: [],
        errorPath: '',
      };
    },
    computed: {
      action: function() {
        return this.$route.params.action;
      }
    },
    created() {
      this.getProductList();
    },
    methods: {
      getProductList() {
        const {
          liveId
        } = this.$route.params;
        ProductSingleList(liveId, {}).then(data => {
          this.list = data.data || [];
        });
      },
      //异常下载
      downloadError() {
        if (!this.errorPath) {
          this.$message.error('未获取到文件路径!')
          return
        }
        DownloadError({ "path": this.errorPath }).then(data => {
          if (!data) return;
          // const fileName = "异常数据.xlsx";
          saveFile(data, '异常数据', 'xlsx');
        });
      },
      handleTestSuccess(file) {
        const formData = new FormData()
        const {
          liveId
        } = this.$route.params;
        formData.append('file', file.file)
        formData.append("liveId", liveId)
        UploadProducts(formData)
          .then(data => {
            if (data.code === 200) {
              //如果包含错误文件
              if (data.data.hasError) {
                this.$message.error('上传存在异常数据');
                this.errorPath= data.data.errorPath;
              } else {
                this.$message.success('上传检测表附件成功!');
                this.list = data.data.productSingleInfoVoList;
                this.errorPath = '';
              }
            }
          });
      },
      deleteProduct(index, row) {
        let giftProductList = this.list[index]["giftProductList"];
        let gIndex = giftProductList.indexOf(row)
        giftProductList.splice(gIndex, 1)
        if (giftProductList.length === 0) {
          this.list.splice(index, 1);
        }
      },
      save() {
        const {
          liveId
        } = this.$route.params;
        SaveProductSingle(liveId, this.list).then(data => {
          if (data.code === 200 && data.data !== 'SYSTEM_ERROR') {
            this.$message.success('保存成功');
            this.$router.back();
          }
        });
      },
      deleteMain(index) {
        this.list.splice(index, 1);
      },
      cancel() {
        this.$router.back();
      }
    },
  };
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

    a {
      display: inline-block;
      text-decoration: none;
    }

    .empty-text {
      color: #909399;
      font-size: 13px;
      text-indent: 10px;
    }
  }
</style>
