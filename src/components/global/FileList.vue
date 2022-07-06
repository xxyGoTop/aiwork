<template>
<div class="files">
  <div :class="`file ${file.status !== 'pending' ? 'done' : ''}`" v-for="(file, index) in list" :key="index">
    <div class="file-title" :title="file.name">
      <Icon name="excel" class="file-icon"></Icon>
      <span class="file-name">{{file.name}}</span>
    </div>
    <div class="file-progress">
      <i class="progress-icon" :class="uploadStatusMap[file.status].icon"></i>
      <span class="progress-name">{{uploadStatusMap[file.status].label}}</span>
      <i class="progress-remove el-icon-close" @click="handleRemoveFile(index)"></i>
    </div>
  </div>
</div>
</template>

<script>
/**
list: [
  { name: 'adsfase', status: 'pending', },
  { name: 'efasdfw', status: 'success', },
  { name: 'g4afes2', status: 'fail', },
],
*/

export default {
  model: {
    prop: "list",
    event: "change",
  },
  props: {
    list: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      uploadStatusMap: {
        pending: {
          icon: "el-icon-loading",
          label: "上传中...",
        },
        success: {
          icon: "el-icon-circle-check",
          label: "上传成功",
        },
        fail: {
          icon: "el-icon-warning-outline",
          label: "上传失败",
        },
      },
    }
  },
  methods: {
    handleRemoveFile(index) {
      const list = [...this.list]
      list.splice(index, 1)
      this.$emit("change", list)
    },
  },
}
</script>

<style lang="scss" scoped>
.files {
  .file {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 32px;
    margin-top: 6px;
    padding: 0 8px;
    border-radius: 3px;
    overflow: hidden;
    .file-title {
      width: calc(100% - 108px);
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #141414;
      .file-icon {
        flex: none;
        margin-right: 6px;
        font-size: 20px;
      }
      .file-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .file-progress {
      flex: none;
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #999999;
      transition: all 300ms;
      transform: translateX(42px);
      .progress-icon {
        margin-right: 2px;
      }
      .progress-name {
        width: 80px;
      }
      .progress-remove {
        font-size: 14px;
        visibility: hidden;
        cursor: pointer;
      }
      .el-icon-circle-check {
        color: #67C23A,
      }
      .el-icon-warning-outline {
        color: #F56C6C;
      }
    }
    &:hover {
      background-color:#F3F5F6;
    }
    &.done {
      .progress-remove {
        visibility: visible;
      }
    }
    &.done:hover {
      .file-progress {
        transform: translateX(0);
      }
    }
  }
}
</style>
