<template lang="pug">
#Tree
  #tag
    el-button(
      type="primary" plain
      size="small"
      v-if="ShowBtns.update"
      :class="draggable ? 'checked' : ''"
      @click="onChange"
    ) 
      span {{draggable? '儲存' : '移動目錄'}}
  el-tree(
    v-loading="store.state.loading.tree_load"
    node-key="id"
    :default-expanded-keys="expendKey"
    :data="TreeData" 
    :props="defaultProps" 
    @node-click="handleNodeClick"
    :draggable="draggable"
    @node-drag-end="handleDragEnd"
    :allow-drop="AllowDrop"
  )
    template(#default="{ node, data }")
      div.mytree-node(
        :class="data.id == store.state.status.currtMd.id ? 'chosen' : 'normal'"
        :id="draggable ? 'shaky' : ''"
      )
        .basic
          i.el-icon-folder(v-if="data.type==='directory'")
          span#dir(v-if="data.type==='directory'") {{data.name}}
          span#md(v-else) {{data.name}}
        
            
        .btns(v-if="!draggable && data.id!=1")
          el-button.editbtn( 
            icon="el-icon-edit" type="warning" plain
            v-if="data.type==='directory' && ShowBtns.update"
            @click="open=true"
          )   
          el-button.delebtn( 
            icon="el-icon-delete" type="danger" plain
            @click="deleDir"
            v-if="data.type==='directory' && ShowBtns.delete"
          )        
Rename(
  :open="open"
  @close="open=false"
  @reload="emitReload"
)          
          
</template>

<script>
import { defineComponent, ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import folderapi from '@/api/folder'
import { getThatMd } from '@/hooks'
import mdapi from '@/api/file'
import store from '@/store'
// import router from '@router'
import Rename from '@/components/Dialog/Rename.vue'

export default defineComponent({
  name: 'Tree',
  props: {
    TreeData: {
      type: Array,
      default: () => {
        return []
      },
    },
    openKey: {
      type: Number
    }
  },
  components: { Rename },
  emits:['reloadTree'], 
  setup(props, { emit }) {
    const expendKey = ref([1])
    const open = ref(false)
    const ShowBtns = ref([])
    const list = ref([])
    const fullPath = ref('')
    const defaultProps = {
      children: 'children',
      label: 'name',
      class: "test"
    }
    const currentKey = ref()
    const draggable = ref(false)
    const removeTable = ref({
      source_id: -1,
      destination_id: -1
    })

    const onChange = () => {
      draggable.value = !draggable.value
      if(!draggable.value)  emit('reloadTree', -3)
    }
  //node drop
    const AllowDrop = (node, dropnode) => {
      if(dropnode.data.type == 'file' || node.data.id == 1) 
        return false
      else
        return true
    }

    const handleDragEnd = async(draggingNode, dropNode) => {
      var source = draggingNode.data
      var dest = dropNode.data
      if(dest.type == 'file') {
        ElMessage({
          message: '路徑錯誤',
          type: 'warning',
          duration: 1000
        })
      }
      removeTable.value.source_id = source.id
      removeTable.value.destination_id = dest.id
      await folderapi.Move(removeTable.value)
    }

  //Tree
    const handleNodeClick = async(data) => {
      var selected = { 
        id: data.id, 
        type: data.type, 
        name: data.name,
      }
      store.commit('status/setSelect', selected)
      if(data.type == 'file')
        store.commit('status/setCurrentMd', selected)

      expendKey.value = [1]//清空

      if(data.type == 'file'){
        currentKey.value = data.id
        if(store.state.status.content_status == '未儲存') {
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
              ElMessage({
                message: '取消儲存',
              })
              getThatMd(data.id)
            })
            .catch(() => { //取消
            })
        }
        else {
          getThatMd(data.id)

        }
      }
    }

    const runDel = async(id) => {
      var bread = store.state.status.BreadCurmb
      var len = bread.length
      var resID = ref(-1)
      if(len != 0){
        //step1. 先檢查目前閱讀的檔案,是否是在要刪除的資料夾下
        fullPath.value = ''
        bread.forEach((element, id) => { 
          if(id == len-1 )  {
            if(element.indexOf('.md') != -1) {
              //
            } else {
              fullPath.value += element
            }
          }
          else {
            fullPath.value += element
            fullPath.value += '/'
          }
        });
        fullPath.value = fullPath.value.substring(0, fullPath.value.length - 1) 
        await mdapi.GetFileId(fullPath.value) //用path查詢ID
          .then((res)=>{
            resID.value = res
          })
      }
      await folderapi.DeleFolder(id)
        .then(()=>{
          ElMessage({
            message: '刪除成功',
            type: 'success',
          })          
        })
      
      //step2. 
      if(resID.value == id) //在欲刪除資料夾下=>取得整個tree第一個
        emit('reloadTree', -1)
      else //重整樹就好
        emit('reloadTree', -3)
    }

    const deleDir = () => {
      let msg = '將會刪除此資料'
      if(store.state.advance.setDeleAllFile)
        msg = '將會刪除此資料(包含底下所有檔案)'
      ElMessageBox.confirm(
        msg,
        `確定刪除?`,
        {
          confirmButtonText: '確認',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => { //確定
          runDel(store.state.status.now_selected.id)
        })
        .catch(() => { //取消
        })
    }

    const emitReload = async() => {
      await mdapi.GetFilePath(currentKey.value)
        .then((path) => {
          const chars = path.split('/')
          store.commit('status/setBreadCurmb', chars)

        })
      emit('reloadTree', -4)
    }

  //watch
    watch(() => store.state.status.reload_file, (nV)=>{
        var status = nV
        if(status) emit('reloadTree')
    }, {
      immediate: true
    })

    //發現點擊其他目錄時(目錄有異動)
    watch(() => store.state.status.now_selected, (nV)=> {
      if( nV.type == 'file' ||  nV.type == 'no-file'  ) {
        expendKey.value = []
        expendKey.value.push(nV.id)
        currentKey.value = nV.id
      }
    }, {
      immediate: true
    })


    onMounted(()=>{
      // ShowBtns.value = router.currentRoute.value.meta.actions
      ShowBtns.value = store.state.status.actions
    })

    return {
      handleDragEnd,
      AllowDrop,
      defaultProps,
      list,
      handleNodeClick,
      expendKey,
      store,
      currentKey,
      deleDir,
      ShowBtns,
      open,
      emitReload,
      onChange,
      draggable,
    }
  }
})
</script>


<style lang="scss" scoped>
#Tree {
  width: 100%;
  height: 100%;
  background-color: #e6e5e5;
  padding: 0 2%;
  #tag {
    display: flex;
    justify-content: flex-end;
    .checked {
      background: #409EFF;
      color: #ECF5FF;
    }
  }
}
:deep(.el-tree) {
  background: #e6e5e5;
  .el-tree-node:focus > .el-tree-node__content {
    background-color: none !important;
  }
  .el-tree-node:focus > .el-tree-node__content,
  .el-tree-node__content:hover {
    background-color: transparent !important;
  }
  #dir {
    font-weight: bold;
    font-size: .9rem;
    color: #5a5a5a;
  }
  #md {
    color: #3a3a3a;
    font-size: .8rem;
  }
  #shaky {
    animation: shake .5s alternate infinite;
  }
  .mytree-node {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .basic {
      i {
        color: #e4af51;
      }
    }
    .btns {
      margin-right: 0.5rem;
      .delebtn,
      .editbtn {
        padding: 0;
        border: none;
        background: transparent;
      }
      .editbtn {
        i {
          color: #686868;
        }
      }
      .delebtn:hover,
      .editbtn:hover {
        i {
          color: blue;
        }
      }
    }
  }
  .normal:hover {
    background: #f5f7fa;
  }
  .chosen {
    background: #f5f7fa;
    border-left: 5px #59abff solid;
    padding-left: 10px;
    span {
      color: #161938 !important;
      font-weight: 600;
    }
  }
}
@keyframes shake {
  0% {
    transform: rotate(1deg);
  }
  100% {
    transform: rotate(-1deg);
  }
}

:deep(.model) {
  // background-color: rgba(0 0 0 / 10%);
}
</style>
