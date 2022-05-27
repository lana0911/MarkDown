import { ref } from 'vue'
import store from '@/store'
import mdapi from '@/api/file'
import usePDF from './usePDF'
import pathHelper from './pathHelper'
import treeHelper from './treeHelper'


export { usePDF }
export { pathHelper }
export { treeHelper }

//some variable
export const DirObj = ref({})
export const md_content = ref('')

export const ReadTree = (list) => {
  const testList = []
  list.forEach((item) => {
    // console.log("item", item)
    const { children } = item
    if(item.children){
      testList.push(...sortTree(children))
    }
  })
  // console.log("**return", testList)
  return testList
}

export const sortTree = (list) => {
  const testList = []
  list.forEach((item) => {
    if(item.children){
      item.children.forEach((each)=>{
        if(each.type == 'file' && each.name.indexOf('.md') != -1) {
          each.name = each.name.substring(0, each.name.length - 3)  //.md
        }
      })

      const sort = item.children.sort(function(a, b) {
        var numA = a.name.replace(/\D+$/g, "")
        var numB = b.name.replace(/\D+$/g, "")
        return numA - numB
      });

      testList.push(...sortTree(sort))
    }
  })
  return testList
}


//
export const checker = () =>{
  var content = store.state.status.md_content
  if(store.state.status.editOrAdd == 'add' && content == '')  return false
  if(content === store.state.status.original) {
      store.commit('status/setStatus', '已儲存')
      return false
  }
  else {
      store.commit('status/setStatus', '未儲存')
      return true
  }
}    

//找此層第一個文件
export const findFirstMd = (list) => {
    const find = ref(false)
    find.value = false
    try{
      for(let i = 0 ; i < list.length ; i++) {
        var element = list[i]
        if(element.type == 'file') {
          var select = {
            id: element.id,
            type: element.type,
            name: element.name,
            parent_id: element.parent_id,
            path: element.path,
            encoding: element.encoding
          }
          find.value = true
          break
        }
      }
      if(find.value) {
        store.commit('status/setSelect', select)
        store.commit('status/setCurrentMd', select)
        getThatMd(select.id)
      }
      else 
        NoFile() 
    } catch {
      NoFile() 
    }

      
}

//Get單一Md
export const getThatMd = async(key) => {
    var id = key ? key : store.state.status.now_selected.id
    try {
      store.commit('loading/setViewLoad', true)
      await mdapi.GetFile(id)
        .then((res) => {
            store.commit('status/setContent', res.content)
            var selected = { 
                id: res.id, 
                type: 'file', 
                name: getLastName(res.path),
                parent_id: res.parent_id,
                path: res.path,
                encoding: res.encoding,
              }
            store.commit('status/setSelect', selected)
            store.commit('status/setCurrentMd', selected)
        })
       
      //img處理
      store.commit('status/setContent', ImgProcessor(store.state.status.md_content, 'addHttp'))
      await store.commit('status/setOriginal', store.state.status.md_content)//點選時載入original
    } catch {
      NoFile()
    } finally {
      checker()
      store.commit('loading/setViewLoad', false)
    }  
}


//Img加/刪網址
export const ImgProcessor = (str, mode) =>{
  var http = store.state.status.ImgURl
    // const regex = /^!\[(.*)\]\((.*)\)$/mg
    const regex = /^!\[(.*)\]\((.*)\)/mg
    var ans = str
    let m
    while ((m = regex.exec(str)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        m.forEach((match, groupIndex) => {
          if(mode == "addHttp") {
              if(groupIndex == 2 && !match.includes(http)) {
                  var fullpath = http + match
                  // console.log("match=",match, match.indexOf('http'))
                  if( match.indexOf('http') == -1)
                    ans = ans.replace(match, fullpath)
              }
          } else if(mode == 'removeHttp') {
              if(groupIndex == 2 ) {
                  ans = ans.replace(http, '')
                  // console.log(`Found match, group ${groupIndex}: ${match}`);
                  // console.log(`match.includes(http)=`,match.includes(http));
                  // console.log("ans.replace(match, fullpath)==",ans.replace(http, ''))
                  // console.log("******************************************************")
              }
          }
        });
    }
    
    return ans
}



//
const NoFile = () =>{
  var now = store.state.status.now_selected
  var select = {
    type: 'no-file',
    name:'no-file',
    path: now.path,
  }
  //select
  store.commit('status/setSelect', select)
  store.commit('status/setCurrentMd', select)
  var content  = "::: warning\n *此目錄找無檔案*  :confounded:\n *Can't find the  file in this floder.* \n ::: "
  //content
  store.commit('status/setContent', content)
  store.commit('status/setOriginal', store.state.status.md_content)//點選時載入original
  //bread
  store.commit('status/setBreadCurmb', [])
}

//
const getLastName = (path) => {
  const chars = path.split('/')
  var len = chars.length
  return chars[len-1]
}