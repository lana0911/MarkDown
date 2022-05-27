<template lang="pug">
#Operator
  .dropdown
    el-button.dropbtn( 
      icon="el-icon-plus" type="info"  circle size="small"
    ) 
    .dropdown-content
      .top
        el-tooltip(
          effect="dark" content="進階設定" :hide-after="50" 
        )  
          el-button.btn( 
            icon="el-icon-setting" type="info"  circle
            @click="openAdvance = true"
          )      
        el-tooltip(
          effect="dark" content="刪除"  :hide-after="50" 
          v-if="ShowBtns.delete && ifMdExist.length != 0"
        )
          el-button.btn( 
            v-if="ShowBtns.delete"
            icon="el-icon-delete" type="danger"  circle
            @click="dele"
          )
        el-tooltip(
          effect="dark" content="下載PDF" :hide-after="50" 
          v-if="ifMdExist.length != 0"
        )  
          el-button.btn( 
            icon="el-icon-download" type="primary"  circle
            :loading="run" @click="download"
            v-if="ifMdExist.length != 0"
          )

        el-button.btn#addBtn( 
          v-if="ShowBtns.create"
          icon="el-icon-document-add" type="success"  circle
        )
          .bottom
            .addChose(v-if="ShowBtns.create")
              el-tooltip(
                effect="dark" content="新增資料夾" :hide-after="50" 
              )  
                el-button( 
                  v-if="ShowBtns.create "
                  icon="el-icon-files" type="success" plain  circle
                  @click="addDir"
                )
              el-tooltip(
                effect="dark" content="新增文件" :hide-after="50" 
              )  
                el-button( 
                  v-if="ShowBtns.create "
                  icon="el-icon-document" type="success" plain  circle
                  @click="add"
                )
            

        el-tooltip(
          effect="dark" content="編輯"  :hide-after="50" 
          v-if="ShowBtns.update && ifMdExist.length != 0"
        )
          el-button.btn( 
            v-if="ShowBtns.update && ifMdExist.length != 0"
            icon="el-icon-edit" type="warning"  circle
            @click="editor"  
          )

AdvancedSettings(
  :open="openAdvance"
  @close="openAdvance=false"
)
Editor(
  :mode="mode"
  :TreeData="TreeData"  
  @reloadTree="emitTree"
  @reloadAddFile="reloadAddFile"
  @reloadTreeRename="reloadTreeRename"
)

</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import mdapi from '@/api/file'
import store from '@/store'
// import router from '@router'
//comp
import Editor from '@/components/Dialog/Editor.vue'
import AdvancedSettings from '@/components/Dialog/AdvancedSettings.vue'

export default defineComponent({
  name: 'Operator',
  props: {
    run: Boolean,
    TreeData: {
      type: Array,
      default: () => {
        return []
      },
    }
  },
  components:{ Editor, AdvancedSettings },
  emits:['download', 'reloadTree', 'reloadAddFile', 'reloadTreeRename'], 
  setup(props, { emit }) {
    const ShowBtns = ref([])
    const mode  = ref('doc')
    const openAdvance = ref(false)
    const ifMdExist = computed(()=>store.state.status.BreadCurmb)

    const editor = () => {
      mode.value = 'doc'
      store.commit('status/setDialog', true)
      store.commit('status/setEditOrAdd', 'edit')
    }

    const addDir = () => {
      mode.value = 'dir'
      store.commit('status/setDialog', true)
    }

    const add = () => {
      mode.value = 'doc'
      if( store.state.status.content_status == '未儲存' ){
        ElMessageBox.confirm(
          '確定不儲存此次編輯?這將會取消所有更動',
          '更動尚未儲存',
          {
            confirmButtonText: '確認',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
          .then(() => { //確定
            store.commit('status/setDialog', true)
            store.commit('status/setEditOrAdd', 'add')
            store.commit('status/setContent', '')
            // md_content.value = ''
            emitTree()
            ElMessage({
              message: '取消儲存',
            })
            // md_content.value = ""
            store.commit('status/setContent', '')
          })
          .catch(() => { //取消
          })        
      }  else {
          store.commit('status/setDialog', true)
          store.commit('status/setEditOrAdd', 'add')
          store.commit('status/setContent', '')
          // md_content.value = ''
      }    
    }
  
    const dele = async() => {
      var id = store.state.status.currtMd.id
      var parent = store.state.status.currtMd.parent_id
      var filename = store.state.status.currtMd.name ?
          store.state.status.currtMd.name : ''
      ElMessageBox.confirm(
        `將會刪除「 ${filename} 」的所有資料`,
        `確定刪除?`,
        {
          confirmButtonText: '確認',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => { //確定
          runDel(id, parent)
        })
        .catch(() => { //取消
        })
    }

    const download = async() => {
      emit('download')
      //  window.print()
    }

    const emitTree = (id) => {
      emit('reloadTree', id)
    }
    const reloadAddFile = (res) => {
      emit('reloadAddFile', res)
    }
    const reloadTreeRename = (data) => {
      emit('reloadTreeRename', data)

    }


    const runDel = async(id, parent) =>{
      //step3. 執行刪除
      await mdapi.DeleFile(id)
      emit('reloadTree', parent)
      ElMessage({
        message: '刪除成功',
        type: 'success',
      })
    }


    onMounted(()=>{
      // ShowBtns.value = router.currentRoute.value.meta.actions
      ShowBtns.value = store.state.status.actions
    })


    return {
      editor,
      reloadAddFile,
      add,
      dele,
      download,
      store,
      emitTree,
      ShowBtns,
      reloadTreeRename,
      mode,
      addDir,
      ifMdExist,
      openAdvance,
    }
  }
})
</script>


<style lang="scss" >
//
  //需移除scope 才能修改el-popover屬性
  //為了不影響其他element元件
  //故已經在下面所有的elment元件套上
  //我的class名稱
//
.el-popover.lana2-pop {    // background: transparent
  padding: 0;
  min-width: fit-content !important;
  width: fit-content !important;
  box-shadow: none;
  top: -0rem;
  border: none;
  .el-popper__arrow {
    display: none;
  }
}

#Operator {
  display: flex;
  justify-content: flex-end;
  width: 10%;
  padding-right: 1rem;
  .dropdown {
    position: relative;
    display: inline-block;
    .dropbtn {
      border: none;
    }
    .dropdown-content {
      display: none;
      flex-direction: column;
      position: absolute;
      z-index: 1;
      bottom: -2.1rem;
      right: 0;
      top: -.3rem;
      padding-right: 2.5rem;
      padding-left: 2rem;
      padding-bottom: 2rem;
      .top {
        display: flex;
      }
      #addBtn {
        span {
          margin-left: 0;
        }
      }
      #addBtn:hover {
        .bottom {
          padding-top: 1rem;
          .addChose {
            display: flex;
            justify-content: center;
            position: relative;
            left: 3rem;
          }
        }
      }
      .bottom {
        position: absolute;
        bottom: -0.5rem;
        width: 100%;
        display: flex;
        justify-content: center;
        left: 0;
        .addChose {
          display: none;
        }
      }
      .btn {
        opacity: 0;
        animation: fadeinout .2s 1 forwards;
        margin-left: 0.5rem;
      }
      .btn:nth-child(4) {
        animation-delay: .1s;
      }
      .btn:nth-child(3) {
        animation-delay: .18s;
      }
      .btn:nth-child(2) {
        animation-delay: .26s;
      }
      .btn:nth-child(1) {
        animation-delay: .34s;
      }
    }
  }
}
.dropbtn {
  transition: .5s;
  background: #a477cb;
}
.dropdown:hover .dropbtn {
  transform: rotate(45deg);
  background: #7a5895;
}
.dropdown:hover .dropdown-content {
  display: flex;
  flex-direction: column;
  transition: .5s;
}

@keyframes fadeinout {
  0% {
    opacity: .3;
  }
  100% {
    opacity: 1;
  }
};
</style>
