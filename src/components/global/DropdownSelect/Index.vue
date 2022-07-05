<template>
<div class="dds">
  <div @click="handleShow($event)" class="dds-trigger">
    <slot>
      <span>{{ddsLabel}}</span>
      <i class="el-icon-caret-bottom" :style="`margin-left: 4px;${visible ? 'color: #FC5757' : ''}`"></i>
    </slot>
  </div>
  <Options
    :visible.sync="visible"
    :options="options"
    :trigger="trigger"
    :value="value"
    :labelKey="labelKey"
    :valueKey="valueKey"
    :leftOffset="leftOffset"
    :topOffset="topOffset"
    @select="handleSelect">
  </Options>
</div>
</template>

<script>
import {
  hasValue,
} from '@/util';
import Options from './Options';

export default {
  model: {
    prop: 'value',
    event: 'select',
  },
  components: {
    Options,
  },
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number, Boolean],
      default: '',
    },
    options: {
      type: Array,
      default: () => [],
    },
    labelKey: {
      type: String,
      default: 'label',
    },
    valueKey: {
      type: String,
      default: 'value',
    },
    leftOffset: {
      type: Number,
      default: 0,
    },
    topOffset: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      visible: false,
      option: {},
      trigger: null,
    };
  },
  watch: {
    value(val) {
      if (val === '') {
        this.option = this.options.find(item => item[this.valueKey] === val);
      }
    }
  },
  computed: {
    ddsLabel() {
      return hasValue(this.option[this.valueKey]) ? this.option[this.labelKey] : this.label;
    },
  },
  methods: {
    handleShow(ev) {
      if (ev.currentTarget) {
        this.trigger = ev.currentTarget;
        this.visible = !this.visible;
      }
    },
    handleSelect(value, option) {
      this.option = option;
      this.$emit('select', value, option);
    },
  },
}
</script>

<style lang="scss" scoped>
.dds-trigger {
  display: inline-flex;
  align-items: center;
}
</style>
