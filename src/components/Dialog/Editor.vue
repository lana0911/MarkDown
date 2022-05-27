<template lang="pug">
#Lana-Btns
  el-dialog(
    :custom-class="mode == 'doc' ? 'lana-dialog' : 'lana-dialog-dir'"
    v-model="store.state.status.dialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="noSave"
    @close="noSave"
    @closed="handleClosed"
  )
    template(#title)
      span(v-if="mode == 'dir'") 新增資料夾
      FilenameNTag(
        v-if="mode == 'doc'" 
        :item="rename"
        :run="runRename"
        @renameOver="runRename = false"
        @emitRolad="emitReload"
      )
      .right(v-if="mode == 'doc'")
        .form(v-if="store.state.status.editOrAdd=='add'")
          el-form.lana-form(:model="formData" )
            #prefix(:class="validStyle")
              span 所屬目錄
            el-form-item( prop="parentId" :class="validStyle")
              el-cascader(
                :options="DirObj" 
                :props="cascaderSetting"  
                :show-all-levels="false"
                size="small" 
                v-model="formData.parentId" 
                filterable
              )
            span#warn(v-if="validStyle == 'notok'") ←必填
            el-form-item
              el-input( v-model="formData.filename" placeholder="請輸入檔名" size="small")
                template(#append) .md
        .switch
          span 加密
          el-switch(
            v-model="encode"
            :inline-prompt="true"
            size="small"
          )
        el-button(
          type="primary" plain icon="el-icon-check" size="small"   
          @click="checkValidate"
        ) 儲存
        el-button(
          type="danger" plain icon="el-icon-minus" size="small"  
          @click="noSave"
        ) 取消
    Previewer(v-if="mode == 'doc'" mode="editable")
    
    .AddDir(v-if="mode == 'dir'")
      .form
        el-form.lana-form(:model="formData" )
          #prefix(:class="validStyle")
            span 所屬目錄
          el-form-item( prop="parentId" :class="validStyle")
            el-cascader(
              :options="DirObj" 
              :props="cascaderSetting"  
              :show-all-levels="false"
              size="small" 
              v-model="formData.parentId" 
              filterable
            )
          span#warn(v-if="validStyle == 'notok'") ←必填
          #prefix(:class="validStyle")
            span 資料夾名稱
          el-form-item
            el-input( v-model="formData.filename" placeholder="請輸入名稱" size="small")
      .btns
        el-button(
          type="primary" plain icon="el-icon-check" size="small"   
          @click="checkValidate"
        ) 儲存
        el-button(
          type="danger" plain icon="el-icon-minus" size="small"  
          @click="noSave"
        ) 取消

</template>

<script>
import { defineComponent, watch, ref,  } from 'vue'
import store from '@/store'
import mdapi from '@/api/file'
import folderapi from '@/api/folder'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getThatMd, checker, ImgProcessor, pathHelper, DirObj } from '@/hooks'
//components
import FilenameNTag from '@/components/FormComponent/FilenameNTag.vue'
import Previewer from '@/components/Previewer.vue'

export default defineComponent({
  name: 'Dialog',
  components: {
    FilenameNTag,
    Previewer,
  },
  props: {
    TreeData: {
      type: Array,
      default: () => {
        return []
      },
    },
    mode: {
      type: String,
      default: 'doc'
    }
  },
  emits:['reloadTree', 'reloadAddFile', 'reloadTreeRename'], 
  setup(props, {emit}) {
    const { GetParentDirId } = pathHelper()
    const validStyle = ref('ok')
    const runRename = ref(false)
    const encode = ref(false)
    const rename = ref([''])
    const formData = ref({
      filename: '',
      parentId: 0,
      content: ''
    })

    const folderData = ref({
      foldername: '',
    })
    const cascaderSetting = {
      checkStrictly: true,
      value: 'id',
      label: 'name',
    }

    const SaveDir = async() => {
      let api = folderapi.AddFolder
      folderData.value.foldername = formData.value.filename
      var id = formData.value.parentId
      //因為el-cascader會聯集成一組Object, 要取最後一個id(被選中那個)
      var len = Object.keys(id).length
      if(len > 1)
        id = id[len-1]
      await api(folderData.value, id)
        .then((res)=>{
          ElMessage({
            type: 'success',
            message: '新增成功',
          })

          clearForm() //清空表單
          formData.value.parentId = res.id
          store.commit('status/setDialog', false) // 關掉編輯視窗
          emit('reloadTree', -3)
        })

    }

    //有更動/新增但未儲存就點取消/X 
    const noSave = () => {
        var ifSave = checker()
        if(ifSave) {
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
              store.commit('status/setDialog', false)
              store.commit('status/setEditOrAdd', '')
              store.commit('status/setContent', store.state.status.original)
            })
            .catch(() => { //取消
            })
        } else {
          store.commit('status/setDialog', false)
          store.commit('status/setEditOrAdd', '')
          store.commit('status/setContent', store.state.status.original)
        }
    }

    const Save = async() => {
      formData.value.content = await 
        ImgProcessor(
          store.state.status.md_content, 
          // md_content.value, 
          'removeHttp'
        )
      let msg = '更新成功'
      let api = mdapi.UpdateFile
      let id = store.state.status.now_selected.id
      let encoding = encode.value
      if(store.state.status.editOrAdd == 'add') {
        msg = '新增成功'
        api = mdapi.AddFile
        id = formData.value.parentId
        formData.value.filename += '.md'//後綴
        //因為el-cascader會聯集成一組Object, 要取最後一個id(被選中那個)
        var len = Object.keys(id).length
        if(len > 1)
          id = id[len-1]
      }
      await api(formData.value, id, encoding)
        .then((res)=>{
          ElMessage({
            type: 'success',
            message: msg,
          })
          store.commit('status/setContent', store.state.status.original)
          store.commit('status/setDialog', false) // 關掉編輯視窗
          if(store.state.status.editOrAdd == 'add') {
            emit('reloadAddFile', res)
          } else{
            getThatMd(id) //只有編輯不用再去reload Tree,只要reload md畫面 
          }
          clearForm() //清空表單
        })
        .catch(()=>{
        })
    }

    const Validater = () => {
      if( !formData.value.parentId ) return false
      return true
    }
    
    const checkValidate = () => {
      var valid = Validater()
        if (valid) {
          validStyle.value = 'ok'
          if(props.mode == 'doc'){
            Save()
            runRename.value = true
          }
          else
            SaveDir()
        } else {
          validStyle.value = 'notok'
        }
    }

    const handleClosed = () => {
      clearForm()
    }

    const clearForm = () => {
      formData.value.filename = ''
      formData.value.content= ''
      folderData.value.foldername= ''
      validStyle.value = ''
    }
 
    const emitReload = (data) => {
      emit('reloadTreeRename', data)
    }

    const assignParentID = async(id, type) =>{
      var parentId = await GetParentDirId(id, type)
      formData.value.parentId = parentId
    }

    //發現點擊其他目錄時(目錄有異動)
    watch(() => store.state.status.now_selected, (nV)=> {
      if(nV && nV.id >= 0)  {
        assignParentID(nV.id, nV.type)
      }
      if(nV.type == 'file') {
        rename.value = nV
        //
        if(store.state.status.editOrAdd == 'add') {
          encode.value = store.state.advance.encoding
        } else {
          if(nV.encoding)
            encode.value = nV.encoding
        }
      }
    }, {
      immediate: true
    })

    //發現點擊其他目錄時(目錄有異動)
    watch(() => store.state.status.editOrAdd, (nV)=> {
      if(nV == 'add') {
        encode.value = store.state.advance.encoding
      } else {
        encode.value = store.state.status.now_selected.encoding
      }
    }, {
      immediate: true
    })
    return  {
      store,
      Save,
      validStyle,
      noSave,
      formData,
      cascaderSetting,
      checkValidate,
      handleClosed,
      DirObj,
      SaveDir,
      rename,
      emitReload,
      runRename,
      encode
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

#Lana-Btns {
  display: flex;
  justify-content: space-between;
  .lana-dialog-dir {
    margin-top: 30vh !important;
    width: fit-content !important;
    height: fit-content !important;
    margin: auto;
    .AddDir {
      display: flex;
      flex-direction: column;
      align-items: center;
      .btns {
        margin: 1rem 0;
      }
    }
  }
  .lana-dialog {
    margin-top: 3vh !important;
    width: 93% !important;
    height: 95% !important;
    margin: auto;
    .el-dialog__header {
      display: flex;
      justify-content: space-between;
    }
    .el-dialog__body {
      height: 90%;
      padding: .5rem 1rem;
    }
  }
  .right {
    margin-right: 5%;
    display: flex;
    align-items: center;
    .switch {
      margin-right: 1rem;
      span {
        color: #666;
        margin-right: .1rem;
        font-size: .8rem;
      }
    }
  }
  .lana-form {
    display: flex;
    margin-right: 1rem;
    .el-form-item {
      margin-bottom: 0px;
      flex-direction: column;
      align-items: flex-start;
      margin-right: 0.2rem;
    }
    .el-form-item__label {
      line-height: 0;
      margin: .1rem .1rem;
    }
    .el-form-item__content {
      display: flex;
    }
  }
  #prefix {
    background: #f5f7fa;
    width: 20%;
    border: 1px solid #dcdfe6;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    right: -3px;
    z-index: 2;
    span {
      color: #909399;
      font-size: 13px;
    }
  }
  #warn {
    font-size: .5rem;
    color: red;
    width: 10%;
    display: flex;
    align-items: center;
  }
  .notok {
    border-bottom: 1px solid red;
  }
}
</style>
