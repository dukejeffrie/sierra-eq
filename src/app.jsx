import { useState, useCallback, useEffect, useRef } from 'preact/hooks'
import { signal, useComputed } from '@preact/signals'
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

  return (
    <div class="slider-explanation">
      <h3 class="title">{title} ({model.value})</h3>
      <div class="explanation">
        <textarea placeholder={placeholder} value={model.description} />
      </div>
    </div>
  )
}

let lastModelId = 0;
class SliderModel {
  _uid
  _state
  constructor({ title = '', description = '', value = 0 } = {}) {
    this._uid = lastModelId++
    this._state = signal({ title, description, value })
  }
  _setState(override) {
    this._state.value = { ...this._state.value, ...override }
  }
  get uid() { return this._uid }
  get title() { return this._state.value.title }
  set title(val) { this._setState({ title: val }) }
  get description() { return this._state.value.description }
  set description(val) { this._setState({ description: val }) }
  get value() { return this._state.value.value }
  set value(val) { this._setState({ value: val }) }

  delete() {
    const old = AppState.sliders.value
    const idx = old.indexOf(this)
    AppState.sliders.value = old.slice(0, idx).concat(old.slice(idx + 1))
  }
}

const AppState = {
  sliders: signal([new SliderModel({
    title: 'UX',
    description: 'The user experience is key in making users passionate about the product.'
  }), new SliderModel({
    title: 'Quality',
    description: 'Higher-quality products win when price is roughly the same.'
  }), new SliderModel({
    title: 'Price',
    description: 'Cheaper prices might attract more users, but might also limit the product\'s value.'
  })])
}

export function App() {
  const [created, setCreated] = useState(null)
  const sliders = AppState.sliders

  const createSlider = () => {
    const model = new SliderModel()
    sliders.value = sliders.value.concat([model])
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

  const [limit, setLimit] = useState(4)
  const slidersRef = useRef()
  function changeLimit(evt) {
    setLimit(evt.target.value || 0)
  }
  useEffect(() => {
    const childWidth = slidersRef.current?.children[0]?.offsetWidth + 4;
    const slidersStyle = (limit > 0 && childWidth > 0) ? `width: ${limit * childWidth}px` : ''
    slidersRef.current.style = slidersStyle
  }, [limit])

  return (
    <>
      <h2>
        Sliders
        <span class="controls">
          <button title="new" onClick={createSlider}>+</button>
          <input type="number" title="limit" value={limit} onInput={changeLimit} /> per row
        </span>
      </h2>
      <section class="sliders" ref={slidersRef}>
        {sliders.value.map((el, idx) => <Slider key={el.uid} model={el} />)}
      </section>
      <h2>Explanations</h2>
      <section class="explanations">
        {sliders.value.map(el => <Explanation key={el.uid} model={el} />)}
      </section>
    </>
  )
}
