<template lang="pug">
#MarkDown
  #left
    .ver
      Version(
        :version="versions"
        :Titles="title.title"
        @reloadTree="reloadTreeStruct(true)"
      )
    .tre
      Tree(
        :TreeData="struct || []"
        @reloadTree="initTree_and_getMd"
        :openKey="openKey"
      )
  #right
    .op
      BreadCrumb()
      Operator(
        :run="run"
        :TreeData="struct  || []"
        @download="download" 
        @reloadTree="initTree_and_getMd"
        @reloadAddFile="reloadAddFile"
        @reloadTreeRename="reloadTreeRename"
      )
    .view
      Previewer(mode="preview")
  .pdf
    PdfFormat(
      :run="run"
      @downloadOver="run = false"
    )
</template>

<script>
import store from '@/store'
import basicapi from '@/api/basic'
import { defineComponent, onMounted, ref, computed } from 'vue'
import { findFirstMd, getThatMd, DirObj, treeHelper, sortTree } from '@/hooks'
//comp
import Tree from '@/components/Tree.vue'
import Version from '@/components/Shared/Version.vue'
import PdfFormat from '@/components/PDF/PdfFormat.vue'
import BreadCrumb from '@/components/Shared/BreadCrumb.vue'
import Operator from '@/components/Operator.vue'
import Previewer from '@/components/Previewer.vue'

export default defineComponent({
  name: 'MarkDown',
  components: {
    Tree,
    Operator,
    Previewer,
    PdfFormat,
    Version,
    BreadCrumb
  },
  setup() {
    const run = ref(false)
    const struct = ref([])
    const versions = ref([])
    const siblins = ref([])
    const title = ref('')
    const openKey = ref()
    const now_select = computed(() => store.state.status.now_selected)
    const { getCatlog } = treeHelper()
    
    const reloadTreeStruct = async(versionReload) =>{
      //initial
      store.commit('loading/setTreeLoad', true)
      await basicapi.initFile()
      store.commit('loading/setTreeLoad', false)
      //get struct
      try {
        struct.value = await basicapi.GetStruct()
      } catch {
        return false
      } finally {
        struct.value = [struct.value]
        sortTree(struct.value)
        //轉換成只有目錄的Obj
        DirObj.value = getCatlog(struct.value)
        if(versionReload)
          findFirstMd(struct.value[0].children)
      }
      return true
    }

//新增md
    const reloadAddFile = async(res) => {
      await reloadTreeStruct()
      var selected = { 
        id: res.id, 
        type: 'file', 
        name: res.name,
        parent_id: res.parent_id,
        path: res.path

      }
      openKey.value = res.id
      store.commit('status/setSelect', selected)
      store.commit('status/setCurrentMd', selected)
      getThatMd(res.id)
    }

    // 找此層第一個文件
    const initTree_and_getMd = async(fatherID) =>{
      await reloadTreeStruct()
      // 三種情況
      if(fatherID == -1) {  //
        findFirstMd(struct.value[0].children)
      }
      else if(fatherID == -2) { // 新增成功後的Emit (直接去Get)
        getThatMd()
      } 
      else if(fatherID == -3){
        //新增資料夾 不用做任何事
      }
      else if(fatherID == -4) {
        //Rename
        if(now_select.value.type == 'file')
          getThatMd()
      }
      else {  //刪除後的Emit (去找同層第一個文件)
        let obj = JSON.parse(JSON.stringify(struct.value))
        var select = {
          id: fatherID,
          type: 'no-file'
        }
        await findSiblin(obj, fatherID)
        store.commit('status/setSelect', select)
        await findFirstMd(siblins.value.children)
      }      
    }

//rename
    const reloadTreeRename = async(data) =>{
      await reloadTreeStruct()
      await store.commit('status/setSelect', data)
      //Rename
      if(now_select.value.type == 'file')
        getThatMd()
    }

    const findSiblin = (list, targetId) => {
        for(let i = 0 ; i < list.length ; i++) {
          var item = list[i]
          if(item.id == targetId) {
            siblins.value = item
            return 
          }
          else {
            if(item.children)
              findSiblin(item.children, targetId)
          }
        }
     }

    const download = () =>{
      run.value= true
    }

    const byOrder = async() =>{
      console.log("byOrder")
      try{
        //1. Get Title
        title.value = await basicapi.GetTitle(1)
        //2. Get Versions
        versions.value = await basicapi.GetVersion()
        var URLs = window.location.pathname.split('/')
        var VersionURL = URLs[URLs.length-1]
        var containURL = versions.value.indexOf(VersionURL)
        if(containURL != -1) {
          var ver = versions.value[containURL]
          store.commit('status/setVersion', ver)
          versions.value = []
          versions.value.push(ver) //不顯示其他version
        }
        else {
          store.commit('status/setVersion', versions.value[1])
        }
        //3. Get Struct
        await reloadTreeStruct()
      } catch {
        //
      } finally {
        findFirstMd(struct.value[0].children)
      }            
    }

    onMounted(()=>{
      byOrder() //文件相關載入
      //網域相關設定
      store.commit('status/setImgURL', window.location.origin)


    })

    return {
      store,
      download,
      run,
      struct,
      initTree_and_getMd,
      versions,
      title,
      reloadTreeStruct,
      reloadAddFile,
      openKey,
      reloadTreeRename
    }
  }
});
</script>

<style lang="scss" scoped>
#MarkDown {
  width: 100%;
  height: 100vh;
  display: flex;
  overflow-y: hidden;
  #left {
    height: 100%;
    width: 25%;
    box-shadow: -3px -1px 0 0 rgba(0, 0, 0, 0.17), -7px -4px 0 0 rgba(0, 0, 0, 0.17), -11px -7px 0 0 rgba(0, 0, 0, 0.17), 0px -1px 0 0 rgba(0, 0, 0, 0.17);
    background: #e6e5e5;
    .tre {
      height: 85%;
      padding: 1rem .5rem;
      overflow-y: auto;
      overflow-x: auto;
    }
    .ver {
      height: 15%;
    }
  }
  #right {
    width: 75%;
    height: 100%;
    .op {
      display: flex;
      background-color: #e6e5e5;
      height: 5%;
      width: 100%;
      align-items: center;
      // margin-bottom: .1rem;
    }
    .view {
      height: 95%;
      overflow: auto;
      height: inherit;
    }
  }
}/*捲軸*/
::-webkit-scrollbar {
  height: .5rem;
  width: .7rem;
}
::-webkit-scrollbar-track {
  background: #cccccc;
}
::-webkit-scrollbar-thumb {
  background: #787877;
}
::-webkit-scrollbar-thumb:hover {
  background: #fff;
}
.pdf {
  position: absolute;
  z-index: -999;
}
</style>
