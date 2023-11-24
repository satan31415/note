<template>
  <div ref="mapContainer" class="w-full h-full"></div>
</template>
<script setup>
import { onMounted, watch, ref } from 'vue'
import * as echarts from 'echarts/core'
import chinaJson from '@/assets/json/china.json'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  VisualMapComponent,
  ToolboxComponent,
} from 'echarts/components'
// 标签自动布局、全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features'
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from 'echarts/renderers'
import { MapChart, BarChart } from 'echarts/charts'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  LegendComponent,
  VisualMapComponent,
  ToolboxComponent,
  MapChart,
  BarChart,
])

let myChart = null
const mapContainer = ref(null)
const props = defineProps({
  options: {
    type: Object,
    default: () => {},
  },
})
watch(
  () => props.options,
  () => {
    initMap()
  },
  { deep: true }
)
const initMap = () => {
  if (myChart === null) {
    myChart = echarts.init(mapContainer.value)
    echarts.registerMap('china', chinaJson)
  }
  myChart.setOption(props.options)
}

onMounted(() => {
  initMap()
  window.onresize = () => {
    myChart.resize()
  }
})
</script>
<style scoped lang="less"></style>
