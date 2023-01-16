import { signal } from '@preact/signals'

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
    instance.removeSlider(this)
  }
}


function defaultSliders() {
  return [
    new SliderModel({
      title: 'UX',
      description: 'The user experience is key in making users passionate about the product.'
    }), new SliderModel({
      title: 'Quality',
      description: 'Higher-quality products win when price is roughly the same.'
    }), new SliderModel({
      title: 'Price',
      description: 'Cheaper prices might attract more users, but might also limit the product\'s value.'
    })
  ]
}

function startupSliders() {
  return [
    new SliderModel({
      title: 'Painful',
      description: 'The problem is so painful that users will pay for you to solve it.'
    }), new SliderModel({
      title: 'Popular',
      description: 'Many users have this problem, possibly millions.'
    }), new SliderModel({
      title: 'Frequent',
      description: 'Users run into the problem very often.'
    }), new SliderModel({
      title: 'Urgent',
      description: 'Needs to be solved right now.'
    }), new SliderModel({
      title: 'Growing',
      description: 'Interest in this problem is growing steadily.'
    }), new SliderModel({
      title: 'Unavoidable',
      description: 'We cannot avoid solving this problem, due to regulation or catastrophic consequences.'
    })
  ]
}

const Presets = {
  DEFAULT: { name: 'default', generator: defaultSliders },
  STARTUP: { name: 'Business ideation', generator: startupSliders },
  keys: Object.freeze(['DEFAULT', 'STARTUP'])
}

const instance = {
  Presets: Presets,
  _limit: signal(4),
  get limit() { return this._limit.value },
  set limit(val) {
    this._limit.value = val
  },
  _preset: Presets.keys[0],
  get preset() { return this._preset },
  setPreset(key) {
    const old = this._preset
    if (key !== old) {
      this._preset = key
      this.sliders.value = Presets[key].generator()
      this.limit = this.sliders.value.length
    }
  },
  sliders: signal(defaultSliders()),
  addSlider() {
    const model = new SliderModel()
    this.sliders.value = this.sliders.value.concat([model])
    return model
  },
  removeSlider(slider) {
    const old = this.sliders.value
    const idx = old.indexOf(slider)
    this.sliders.value = old.slice(0, idx).concat(old.slice(idx + 1))
  }
}

export default instance
