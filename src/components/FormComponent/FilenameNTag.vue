<template lang="pug">
.left
  #filename(v-if="store.state.status.now_selected.name != '' && store.state.status.editOrAdd != 'add'")
    i.el-icon-document
    span ：
    el-input(
      v-model="renameData.new_name" placeholder="請輸入名稱" size="small"  
    )
      template(#append) .md
  .tag
    el-tag#tag(
      round
      :type="store.state.status.content_status == '已儲存' ? 'info' : 'danger'"
    ) 
      span ● {{store.state.status.content_status}}
</template>

<script>
import { defineComponent, ref, watch } from 'vue'
import store from '@/store'
import mdapi from '@/api/file'

export default defineComponent({
  name: 'FilenameNTag',
  props: {
    item: {
      type: Object,
    },
    run: {
      type: Boolean,
      default: false
    }
  },
  emits:['renameOver', 'emitRolad'], 
  setup(props, {emit}) {
    const orignalName = ref('')
    const renameData = ref({
      new_name: '',
    })


    const checker = async()=>{
      var data
      if(orignalName.value === renameData.value.new_name)
        emit('renameOver')
      else {
        renameData.value.new_name += '.md'
        await mdapi.Rename(renameData.value, props.item.id)
          .then((res)=>{
            // const chars = resID.split(' ');
            if(props.item.type == 'file') {
              var selected = {
                id: res.id, 
                type: 'file',
                name: renameData.value.new_name,
                parent_id: res.parent_id,
                path: res.path            
              }
              data = selected
            }
          })
        await store.commit('status/setSelect', data)
        emit('renameOver')
        emit('emitRolad',data)
      }

    }

    watch(() => props.item,  nV=>{
      if(nV.name){
        var name = nV.name
        if(name.includes('.md'))
          name = name.substring(0, name.length -3)  //.md
        orignalName.value = name
        renameData.value.new_name = name
      }
    })   

    watch(() => props.run,  nV=>{
      if(nV){
        checker()
      }
    })   

    return { 
      store,
      renameData
    }
  }

})
</script>

<style lang="scss" scoped>
.left {
  display: flex;
  margin-left: 1rem;
  #filename {
    display: flex;
    align-items: center;
    width: 65%;
    span,
    i {
      color: #666;
      font-style: italic;
    }
  }
  .tag {
    margin: 0 1rem;
    :deep(.el-tag) {
      border-radius: 100px;
    }
  }
}
</style>
      