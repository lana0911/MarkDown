<template lang="pug">
#BreadCrumb
  el-breadcrumb(separator="/")
    el-breadcrumb-item(
      v-for="(item) in bread" :key="item"
    ) 
      span {{item}}
</template>

<script>
import { defineComponent, computed } from 'vue'
import store from '@/store'

export default defineComponent({
  name: 'BreadCrumb',

  setup() {
    const bread = computed(()=>{
      var list = store.state.status.BreadCurmb
      list = list.slice(3);
      return list
    })

    return {
      bread
    }
  }
})
</script>


<style lang="scss" scoped>
#BreadCrumb {
  display: flex;
  height: 100%;
  width: 90%;
  align-items: center;
  padding-left: 2%;
}
</style>
