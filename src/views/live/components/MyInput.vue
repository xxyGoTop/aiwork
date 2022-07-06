<template>
  <el-input-number
    v-model='value'
    :disabled='disabled'
    :controls="false"
    :min="1"
    :precision="0"
    style='width: 100px'
    @change="handleChange">
  </el-input-number>
</template>

<script>
export default {
  props: {
    stage: {
      type: Number,
    },
    index: {
      type: Number,
    },
    disabled: {
      type: Boolean,
    },
  },
  data() {
    return {
      value: this.stage || undefined,
    }
  },
  methods: {
    handleChange(value) {
      this.$emit("change", {
        value,
        index: this.index,
      })
    },
  },
}
</script>
