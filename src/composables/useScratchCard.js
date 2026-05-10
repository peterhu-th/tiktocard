import { nextTick, onMounted, onUnmounted, ref } from 'vue'

export function useScratchCard(canvasRef, hostRef, onReveal) {
  const isDone = ref(false)
  const hasStarted = ref(false)
  let ctx = null
  let drawing = false
  let lastPoint = null
  let strokeCount = 0
  let initTimer = null
  let frameId = null

  const getPoint = (event, canvas) => {
    const rect = canvas.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }

  const eraseAt = (x, y, radius = 24) => {
    if (!ctx) return
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  const eraseLine = (from, to, radius = 28) => {
    if (!ctx || !from || !to) return
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = radius * 2
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
  }

  const reveal = () => {
    if (isDone.value) return
    const canvas = canvasRef.value
    if (ctx && canvas) {
      ctx.save()
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.restore()
    }
    isDone.value = true
    onReveal?.()
  }

  const checkProgress = () => {
    const canvas = canvasRef.value
    if (!ctx || !canvas || isDone.value) return

    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      let transparent = 0
      let total = 0

      for (let i = 3; i < data.length; i += 24 * 4) {
        total += 1
        if (data[i] < 30) transparent += 1
      }

      if ((total && transparent / total > 0.6) || strokeCount > 40) {
        reveal()
      }
    } catch {
      if (strokeCount > 40) {
        reveal()
      }
    }
  }

  const pointerDown = (event) => {
    const canvas = canvasRef.value
    if (!canvas || isDone.value) return
    if (!ctx) {
      scheduleInit()
      return
    }

    drawing = true
    hasStarted.value = true
    canvas.setPointerCapture?.(event.pointerId)
    lastPoint = getPoint(event, canvas)
    eraseAt(lastPoint.x, lastPoint.y)
    strokeCount += 1
    checkProgress()
  }

  const pointerMove = (event) => {
    const canvas = canvasRef.value
    if (!canvas || !drawing || isDone.value) return

    const point = getPoint(event, canvas)
    eraseLine(lastPoint, point)
    lastPoint = point
    strokeCount += 1
    checkProgress()
  }

  const pointerUp = () => {
    drawing = false
    lastPoint = null
    checkProgress()
  }

  const drawCoating = (width, height) => {
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, width, height)

    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, 'rgba(214,212,219,.98)')
    gradient.addColorStop(0.48, 'rgba(247,231,239,.97)')
    gradient.addColorStop(1, 'rgba(255,255,255,.98)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    ctx.globalAlpha = 0.32
    ctx.strokeStyle = 'rgba(255,255,255,.72)'
    ctx.lineWidth = 1

    for (let x = -width; x < width * 1.5; x += 11) {
      ctx.beginPath()
      ctx.moveTo(x, height + 20)
      ctx.lineTo(x + height + 28, -20)
      ctx.stroke()
    }

    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'destination-out'
  }

  const init = (attempt = 0) => {
    const canvas = canvasRef.value
    const host = hostRef.value
    if (!canvas || !host || isDone.value) return

    const rect = host.getBoundingClientRect()
    if ((!rect.width || !rect.height) && attempt < 8) {
      initTimer = window.setTimeout(() => init(attempt + 1), 60)
      return
    }
    if (!rect.width || !rect.height) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor(rect.height * dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)
    drawCoating(rect.width, rect.height)
  }

  const scheduleInit = async () => {
    window.clearTimeout(initTimer)
    if (frameId) window.cancelAnimationFrame(frameId)
    await nextTick()
    frameId = window.requestAnimationFrame(() => {
      init()
    })
  }

  const reset = () => {
    isDone.value = false
    hasStarted.value = false
    drawing = false
    lastPoint = null
    strokeCount = 0
    scheduleInit()
  }

  onMounted(() => {
    scheduleInit()
    window.addEventListener('resize', scheduleInit)
  })

  onUnmounted(() => {
    window.clearTimeout(initTimer)
    if (frameId) window.cancelAnimationFrame(frameId)
    window.removeEventListener('resize', scheduleInit)
  })

  return {
    isDone,
    hasStarted,
    init,
    reset,
    pointerDown,
    pointerMove,
    pointerUp,
    reveal
  }
}
