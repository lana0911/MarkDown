<template lang="pug">
#Version 
  .top
    span {{name}}
  .bottom
    span#name {{title}}
    #select
      el-select(v-model="ver" @change="handleChange")
        el-option(
          v-for="item in version"
          :key="item"
          :label="item"
          :value="item"
        )



</template>

<script>
import { defineComponent, ref, onBeforeUpdate, computed } from 'vue'
import store from '@/store'

export default defineComponent({
  name: 'Version',
  components: {
  },
  props: {
    Titles: {
      type: Object
    },
    version: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  emits:['reloadTree'], 
  setup(props, { emit }) {
    const ver =  ref('')
    const name =  computed(() => {
      if(props.Titles) 
        return props.Titles.Name
      return ''
    })
    const title =  computed(() => {
      if(props.Titles) 
        return props.Titles.Tile
      return ''
    })

    const handleChange = async(val) => {
      await store.commit('status/setVersion', val)
      emit('reloadTree')
    }
 

    onBeforeUpdate(()=>{
      ver.value = store.state.status.usedVersion
    })

    return {
      ver,
      title,
      name,
      store,
      handleChange
    }
  }
})
</script>


<style lang="scss" scoped>
#Version {
  height: 100%;
  border-bottom: 1px solid #c7c7c7;
  padding: 1rem 1rem;
  .top {
    span {
      font-size: 1.5em;
      font-weight: 500;
    }
  }
  .bottom {
    display: flex;
    align-items: center;
    margin-top: 0.5rem;
    #name {
      width: 70%;
      font-size: .8em;
      color: #777;
      font-weight: 600;
    }
    #select {
      width: 30%;
    }
  }
  :deep(.el-select) {
    width: 100%;
    .el-input__inner {
      height: 30px;
      background: transparent;
      border-color: #777;
    }
    .el-input__suffix {
      top: -5px;
    }
    .el-input__icon {
      line-height: inherit;
    }
    .el-input__suffix-inner {
      display: inline-block;
    }
  }
}
</style>
