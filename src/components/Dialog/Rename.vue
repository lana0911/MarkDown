<template lang="pug">
#Rename
  el-dialog(
    v-model="open"
    @close="Cancle"
    title="重新命名"
    width="30%"
  )
    .content
      el-input(
        v-model="formData.new_name" placeholder="請輸入名稱" size="small"  
      )
        template(#append) .md
      .btns
        el-button(
          type="primary" plain icon="el-icon-check" size="small"   
          @click="Run"
        ) 儲存
        el-button(
          type="danger" plain icon="el-icon-minus" size="small"  
          @click="Cancle"
        ) 取消

</template>


<script>
import { defineComponent, computed, ref, watch } from 'vue'
import mdapi from '@/api/file'
import store from '@/store'

export default defineComponent({
  name: 'Dialog',
  props: {
    open: {
      type: Boolean,
      default: false
    }
  },
  emits:['close', 'reload'], 
  setup(props, {emit}) {
    const select = computed(() => store.state.status.now_selected)
    const formData = ref({
      new_name: '',
    })


    const Run = async() =>{
      if(select.value.type == 'file') {
        formData.value.new_name = formData.value.new_name + '.md'
      }
      await mdapi.Rename(formData.value, select.value.id)
        .then((res)=>{
          // const chars = resID.split(' ');
          if(select.value.type == 'file') {
            var selected = {
              id: res.id, 
              type: select.value.type, 
              name: formData.value.new_name,
              parent_id: res.parent_id,
              path: res.path            
            }
            store.commit('status/setSelect', selected)
          }
          emit('reload')
        })
      emit('close')
    }

    const Cancle = () =>{
      formData.value.new_name = ''
      emit('close')
    }

    const findName = async() => {
      var name = select.value.name
      if(select.value.type == 'file')
        name = name.substring(0, name.length - 3)  //.md
      formData.value.new_name = name
    }

    watch(() => store.state.status.now_selected, (nV)=> {
      if(nV.name)
        findName()
    }, {
      immediate: true
    })



    return {
      Cancle,
      Run,
      select,
      store,
      formData,
    }

  }

})
</script>

<style lang="scss" scoped>
#Rename {
  .content {
    .btns {
      display: flex;
      justify-content: center;
      margin-top: 1rem;
    }
  }
}
</style>