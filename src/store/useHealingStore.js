import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { anxieties, badThoughts } from '../data/healingData'

export const useHealingStore = defineStore('healing', () => {
  const page = ref(1)
  const homeEntry = ref(null)
  const selectedAnxietyKey = ref(null)
  const scratched = ref(false)
  const selectedBadKeys = ref([])
  const crushed = ref(false)
  const showFinal = ref(false)

  const selectedAnxiety = computed(() =>
    anxieties.find((item) => item.key === selectedAnxietyKey.value) ?? anxieties[0]
  )

  const selectedBadItems = computed(() => {
    const items = badThoughts.filter((item) => selectedBadKeys.value.includes(item.key))
    return items.length ? items : [badThoughts[0]]
  })

  function go(nextPage) {
    page.value = nextPage
  }

  function startFrom(kind) {
    homeEntry.value = kind
    go(2)
  }

  function selectAnxiety(key) {
    selectedAnxietyKey.value = key
    scratched.value = false
    go(3)
  }

  function setScratched(value) {
    scratched.value = value
  }

  function toggleBad(key) {
    if (crushed.value) return { changed: false, maxed: false }

    if (selectedBadKeys.value.includes(key)) {
      selectedBadKeys.value = selectedBadKeys.value.filter((item) => item !== key)
      return { changed: true, maxed: false }
    }

    if (selectedBadKeys.value.length >= 6) {
      return { changed: false, maxed: true }
    }

    selectedBadKeys.value = [...selectedBadKeys.value, key]
    return { changed: true, maxed: false }
  }

  function crushSelected() {
    if (!selectedBadKeys.value.length) return
    crushed.value = true
  }

  function openFinal() {
    showFinal.value = true
  }

  function closeFinal() {
    showFinal.value = false
  }

  function resetAll() {
    page.value = 1
    homeEntry.value = null
    selectedAnxietyKey.value = null
    scratched.value = false
    selectedBadKeys.value = []
    crushed.value = false
    showFinal.value = false
  }

  return {
    page,
    homeEntry,
    selectedAnxietyKey,
    scratched,
    selectedBadKeys,
    crushed,
    showFinal,
    selectedAnxiety,
    selectedBadItems,
    go,
    startFrom,
    selectAnxiety,
    setScratched,
    toggleBad,
    crushSelected,
    openFinal,
    closeFinal,
    resetAll
  }
})
