import { ref } from 'vue/'
import mdapi from '@/api/file'
import store from '@/store'


function pathHelper() {


  const pathGetId = async(path) => {
    const id = ref(0)
    await mdapi.GetFileId(path) //用path查詢ID
    .then((resId)=>{
      id.value = resId
    })    
    return id.value
  }

  const IdGetpath = async(id) => {
    const path = ref('')
    await mdapi.GetFilePath(id)
      .then((res) => {
        path.value = res
      })
      return path.value
  }

  const GetParentDirId = async(mdID, type) => {
    var fullPath = await IdGetpath(mdID) 
    var parentPath = await GetParentDirPath(fullPath, type)
    var parentId = await pathGetId(parentPath)
    return parentId
  }

    //將path做切割
    const GetParentDirPath = (path, type) => {
      const FatherPath = ref([])
      FatherPath.value = ""
      const chars = path.split('/')
      var len = chars.length
      chars.forEach((element, id) => { 
        //Form parent Id用
        if(path.indexOf('.md') != -1) { //如果最後一項是.md檔 則不加入最後一項 
          if(id < len-1) {
            FatherPath.value += element
            FatherPath.value += '/'
          }
        } else { //如果最後一項不是.md檔 反之
          if(id <= len-1) {
            FatherPath.value += element
            FatherPath.value += '/'
          }
        }
      });
      
      if(type == 'file' ) {
        store.commit('status/setBreadCurmb', chars)
      }
      //將path最後一個字元(/)去掉
      return FatherPath.value.substring(0, FatherPath.value.length - 1) 
  }

  return {
    GetParentDirPath,
    GetParentDirId
  }
}

export default pathHelper
