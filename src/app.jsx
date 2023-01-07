import { useState, useCallback, useEffect, useRef, useId } from 'preact/hooks'
import { useComputed } from '@preact/signals'
import AppState from './AppState'
import './app.css'

function Slider(props) {
  const model = props.model
  const onType = useCallback((evt) => {
    const property = evt.target.name
    if (property) {
      model[property] = evt.target.value
    }
  })
  function deleteModel() {
    model.delete()
  }
  return (
    <div class="card slider" data-uid={model.uid} onInput={onType}>
      <button class="delete" title="remove" onClick={deleteModel}>x</button>
      <label class="slider-title">
        <input type="text" name="title" value={model.title} placeholder="Name" />
      </label>
      <div class="slider-value">
        <input type="range" name="value"
          value={model.value}
          title={model.title} min="-5" max="5" step="1" />
      </div>
      <div class="slider-value-display">{model.value}</div>
    </div>
  )
}

function Explanation(props) {
  const model = props.model
  const title = useComputed(() => model.title || 'Untitled')
  const placeholder = useComputed(() => `explanation for ${title}`)

  function updateDescription(evt) {
    model.description = evt.target.value
  }

  return (
    <div class="slider-explanation">
      <h3 class="title">{title} ({model.value})</h3>
      <div class="explanation">
        <textarea class="text" placeholder={placeholder} value={model.description} onInput={updateDescription} />
        <div class="print">{model.description}</div>
      </div>
    </div>
  )
}

function PresetSelector() {
  const options = AppState.Presets.keys.map((key) => {
    const preset = AppState.Presets[key]
    return (
      <option value={key}>{preset.name}</option>
    )
  })
  const onChange = (evt) => {
    AppState.setPreset(evt.target.value)
  }
  return (
    <span class="controls">
      <label for="preset" title="Replace sliders with a preset.">Presets</label>
      <select name="preset" title="Replace sliders with a preset." onChange={onChange}>
        {options}
      </select>
    </span>
  )
}


function Briefing() {
  const [briefing, setBriefing] = useState('')
  function updateBriefing(evt) {
    setBriefing(evt.target.value)
  }
  return (
    <section class="briefing">
      <p>Describe what our goal with the sliders is.</p>
      <textarea class="text" name="briefing" value={briefing} onInput={updateBriefing} placeholder="What we are trying to evaluate today is..." />
      <div class="print">{briefing}</div>
    </section>
  )
}

export function App() {
  const [created, setCreated] = useState(null)
  const sliders = AppState.sliders

  const createSlider = () => {
    const model = AppState.addSlider()
    setCreated(model.uid)
  }
  useEffect(() => {
    if (created) {
      const uid = created
      setTimeout(() => {
        const el = document.querySelector(`.slider[data-uid="${uid}"] input[name="title"]`)
        if (el) {
          el.focus()
        }
      })
      setCreated(null)
    }
  }, [created])

  const limit = AppState.limit
  const slidersRef = useRef()
  function changeLimit(evt) {
    AppState.limit = (evt.target.value || 0)
  }
  useEffect(() => {
    const childWidth = slidersRef.current?.children[0]?.offsetWidth + 4;
    const slidersStyle = (limit > 0 && childWidth > 0) ? `width: ${limit * childWidth}px` : ''
    slidersRef.current.style = slidersStyle
  }, [limit])

  return (
    <>
      <h2>
        Briefing
      </h2>
      <Briefing />
      <h2>
        Sliders
        <span class="controls">
          <button title="new" onClick={createSlider}>+</button>
        </span>
        <span class="controls">
          <input type="number" title="limit" value={limit} onInput={changeLimit} /> per row
        </span>
        <PresetSelector />
      </h2>
      <section class="sliders" ref={slidersRef}>
        {sliders.value.map((el, idx) => <Slider key={el.uid} model={el} />)}
      </section>
      <h2>Explanations</h2>
      <section class="explanations">
        <p>Describe how we arrived at each value and what it means.</p>
        {sliders.value.map(el => <Explanation key={el.uid} model={el} />)}
      </section>
    </>
  )
}
