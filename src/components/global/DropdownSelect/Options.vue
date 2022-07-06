<template>
<div class="dds-options" v-show="visible" :style="position">
  <div
    v-for="(option, index) of ddsOptions"
    :key="index"
    @click="handleSelect(option)"
    class="option"
    :class="option.selected ? 'selected' : ''">
    <slot name="option" :row="option">{{ option[labelKey] }}</slot>
  </div>
</div>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Array,
      default: () => [],
    },
    labelKey: {
      type: String,
      default: "label",
    },
    valueKey: {
      type: String,
      default: "value",
    },
    trigger: {
      type: [HTMLElement, null],
      default: null,
    },
    value: {
      type: [String, Number, Boolean],
      default: "",
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
      ddsOptions: [],
      position: {
        top: 0,
        left: 0,
      },
    }
  },
  watch: {
    options: {
      immediate: true,
      handler(options) {
        this.ddsOptions = options.map(option => {
          option.selected = false
          return option
        })
        this.setSelected()
      },
    },
    visible(val) {
      if (val && this.trigger) {
        this.getPosition(this.trigger)
      }
    },
    value: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.setSelected()
        }
      },
    },
  },
  methods: {
    setSelected() {
      this.ddsOptions.forEach(option => {
        option.selected = option[this.valueKey] === this.value
      })
    },
    getPosition(el) {
      const rect = el.getBoundingClientRect()
      const left = rect.left + rect.width / 2 + this.leftOffset
      const top = rect.top + rect.height + this.topOffset
      this.position = {
        left: `${left}px`,
        top: `${top}px`,
      }
    },
    handleSelect(option) {
      this.$emit("select", option[this.valueKey], option)
      this.$emit("update:visible", false)
    },
    eventHandler(ev) {
      if (!this.visible || !this.trigger) return
      if (this.trigger.contains(ev.target)) return
      if (
        ev.type === "wheel" ||
        (
          ev.type === "pointerdown" &&
          !this.$el.contains(ev.target)
        ) ||
        (
          ev.type === "keydown" &&
          (
            ev.code === "ArrowUp" ||
            ev.code === "ArrowDown" ||
            ev.code === "ArrowLeft" ||
            ev.code === "ArrowRight"
          )
        )
      ) {
        this.$emit("update:visible", false)
      }
    },
  },
  mounted() {
    window.addEventListener("wheel", this.eventHandler, false)
    window.addEventListener("pointerdown", this.eventHandler, false)
    document.body.addEventListener("keydown", this.eventHandler, false)
    // 移入body
    document.body.appendChild(this.$el)
  },
  beforeDestroy() {
    window.removeEventListener("wheel", this.eventHandler, false)
    window.removeEventListener("pointerdown", this.eventHandler, false)
    document.body.removeEventListener("keydown", this.eventHandler, false)
  },
  destroyed() {
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  },
}
</script>

<style lang="scss" scoped>
.dds-options {
  position: absolute;
  top: 0;
  left: 0;
  min-width: 80px;
  padding: 8px 0;
  transform: translateX(-50%);
  box-sizing: border-box;
  background-color: #FFFFFF;
  box-shadow: 0 0 9px 0 rgba(0,0,0,0.12);
  border-radius: 8px;
  font-size: 12px;
  z-index: 9999;
  .option {
    padding: 0 16px;
    line-height: 32px;
    word-break: keep-all;
    color: #666666;
    cursor: pointer;
    &.selected,
    &:hover {
      color: #FC5757;
    }
  }
}
</style>
