/** Only disposable diagnostic copies import this probe. Sample one tick in eight. */
export const probe = {
  sampled: false, tick: 0, phase: '', previous: 0, phases: {}, counters: {},
  begin() {this.sampled = this.tick++ % 8 === 0; this.phase = ''; this.switch('ecology');},
  switch(name) {
    if (!this.sampled) return;
    const now = performance.now();
    if (this.phase) this.phases[this.phase] = (this.phases[this.phase] ?? 0) + now - this.previous;
    this.phase = name; this.previous = now;
  },
  end() {this.switch(''); this.sampled = false;},
  count(name, amount = 1) {if (this.sampled) this.counters[name] = (this.counters[name] ?? 0) + amount;},
  reset() {this.tick = 0; this.phase = ''; this.phases = {}; this.counters = {}; this.sampled = false;},
};
