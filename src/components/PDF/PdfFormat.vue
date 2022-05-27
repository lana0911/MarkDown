<template lang="pug">
#PdfFormat(ref="pdfArea")
  .contentInner(style="width: 1142px")
    v-md-editor(
      v-model="contentMD" 
      height="100%"
      :mode="'preview'"
    )

</template>


<script>
import store from '@/store'
import { defineComponent, ref, watch } from 'vue'
import { usePDF } from '@/hooks'
import Previewer from '@/components/Previewer.vue'

export default defineComponent({
  name: 'PdfFormat',
  components: {
    Previewer
  },
  props: {
    run: Boolean,
  },
  emits:['downloadOver'], 
  setup(props, { emit }) {
    const pdfArea = ref(null)
    const { downloadPDF } = usePDF(pdfArea)
    const contentMD = ref('')

    const downLoad = async() => {
      await downloadPDF('下載文件', '')
      emit('downloadOver')
    }



    watch(contentMD, (nV) => {
      // md_content.value = nV
      store.commit('status/setContent', nV)

    })


    watch(() => props.run,  nV=>{
      if(nV) downLoad()
    })   


    watch(() => store.state.status.md_content, (nV)=>{
      contentMD.value = nV
    }, {
      immediate: true
    })

    return {
        pdfArea,
        contentMD
    }
   }
})

</script>
