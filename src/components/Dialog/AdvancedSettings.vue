<template lang="pug">
#AdvancedSettings
  el-dialog(
    v-model="open"
    @close="closeDialog"
    title="進階設定"
  )
    .switch
      span 是否覆寫所有檔名相同之圖片
        el-switch(
          v-model="store.state.advance.img_overwrite"
        )
    .switch
      span 是否可刪除非空資料夾(連同底下檔案一併刪除)
        el-switch(
          v-model="store.state.advance.setDeleAllFile"
        )
    .switch
      span 是否需要加密內文?
        el-switch(
          v-model="store.state.advance.encoding"
        )
</template>


<script>
import { defineComponent } from 'vue'
import store from '@/store'
//components

export default defineComponent({
  name: 'Dialog',
  props: {
    open: {
      type: Boolean,
      default: false
    }
  },
  emits:['close'], 
  setup(props, {emit}) {

    const closeDialog = () =>{
      emit('close')
    }


    return {
      closeDialog,
      store
    }

  }

})
</script>

<style lang="scss" scoped>
#AdvancedSettings {
  .switch {
    margin: 1rem .5rem;
    span {
      font-weight: bold;
    }
    .el-switch {
      margin-left: .5rem;
    }
  }
}
</style>