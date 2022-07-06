import Vue from "vue"
import {
  upperFirst,
  camelCase,
} from "lodash-es"

const requireComponent = require.context("./global", false, /[A-Z]\w+\.vue$/)

const requireDirComponent = require.context("./global", true, /^\.\/\w+\/Index\.vue$/)

requireComponent.keys().forEach((fileName) => {
  const componentConfig = requireComponent(fileName)
  const componentName = upperFirst(
    camelCase(fileName.split("/").pop().replace(/\.\w+$/, ""))
  )
  Vue.component(componentName, componentConfig.default || componentConfig)
})

requireDirComponent.keys().forEach((fileName) => {
  const componentConfig = requireDirComponent(fileName)
  const componentName = upperFirst(
    camelCase(fileName.split("/")[1])
  )
  Vue.component(componentName, componentConfig.default || componentConfig)
})
