import { parentPort as e } from "node:worker_threads";
import { createHash as t } from "node:crypto";
import { Session as n } from "node:inspector";
var r = /* @__PURE__ */ new WeakMap();
function i(e) {
	let t = e;
	if (!t || t.version !== 1 || typeof t.connected != "boolean" || !Array.isArray(t.accepted) || t.accepted.length > 1e4 || t.accepted.some((e, n) => !Number.isSafeInteger(e) || e < 0 || n > 0 && e <= t.accepted[n - 1]) || Object.keys(t).some((e) => ![
		"version",
		"connected",
		"accepted"
	].includes(e))) throw Error("Invalid self-tube topology");
	return {
		version: 1,
		connected: t.connected,
		accepted: [...t.accepted]
	};
}
function a(e, t) {
	if (!t?.connected) return;
	let { worldWidth: n, worldHeight: i } = e, a = r.get(t);
	if (a?.width === n && a.height === i) return a.runs.length ? a : void 0;
	let o = Math.max(1, Math.floor(i / 300)), s = i / o, c = [], l = -2;
	for (let e of t.accepted) {
		if (e >= o) break;
		e === l + 1 ? c[c.length - 1].top = i - (e + 1) * s : c.push({
			top: i - (e + 1) * s,
			bottom: i - e * s
		}), l = e;
	}
	let u = {
		width: n,
		height: i,
		runs: c
	};
	return r.set(t, u), c.length ? u : void 0;
}
function o(e, t, n) {
	return n < 0 || n > e.height ? !1 : t >= 0 && t <= e.width || e.runs.some((e) => n >= e.top && n <= e.bottom);
}
function s(e, t, n = 0) {
	return t.top < n || t.bottom > e.height - n || t.left < -300 + n || t.right > e.width + 300 - n ? !1 : (t.left >= n || e.runs.some((e) => t.top >= e.top + n && t.bottom <= e.bottom - n)) && (t.right <= e.width - n || e.runs.some((e) => t.top >= e.top + n && t.bottom <= e.bottom - n));
}
function c(e, t, n) {
	if (o(e, t, n)) return;
	let r = Infinity, i = 0, a = 0, s = (e, o, s, c) => {
		let l = (s - e) ** 2 + (c - o) ** 2, u = Math.max(0, Math.min(1, ((t - e) * (s - e) + (n - o) * (c - o)) / l)), d = e + u * (s - e) - t, f = o + u * (c - o) - n, p = d * d + f * f;
		p < r && (r = p, i = d, a = f);
	};
	s(0, 0, e.width, 0), s(0, e.height, e.width, e.height);
	let c = [...e.runs].sort((e, t) => e.top - t.top), l = 0;
	for (let n of c) {
		n.top > l && (s(0, l, 0, n.top), s(e.width, l, e.width, n.top));
		for (let r of [0, e.width]) {
			let i = r === 0 ? Math.min(-300, t - 1) : Math.max(e.width + 300, t + 1);
			s(r, n.top, i, n.top), s(r, n.bottom, i, n.bottom);
		}
		l = n.bottom;
	}
	l < e.height && (s(0, l, 0, e.height), s(e.width, l, e.width, e.height));
	let u = Math.sqrt(r);
	return u > 0 ? {
		dx: i,
		dy: a,
		nx: i / u,
		ny: a / u
	} : void 0;
}
var l = (e, t, n) => Math.max(t, Math.min(n, e));
function u(e, t = 35) {
	return [{
		left: t,
		right: e.width - t,
		top: t,
		bottom: e.height - t
	}, ...e.runs.flatMap((n) => [{
		left: -300,
		right: t,
		top: n.top + t,
		bottom: n.bottom - t
	}, {
		left: e.width - t,
		right: e.width + 300,
		top: n.top + t,
		bottom: n.bottom - t
	}])];
}
function d(e, t, n, r = 35) {
	let i = Infinity, a = {
		x: t,
		y: n
	};
	for (let o of u(e, r)) {
		let e = l(t, o.left, o.right), r = l(n, o.top, o.bottom), s = (e - t) ** 2 + (r - n) ** 2;
		s < i && (i = s, a = {
			x: e,
			y: r
		});
	}
	return a;
}
function f(e, t) {
	let n = u(e, 40), r = n.map((e) => (e.right - e.left) * (e.bottom - e.top)), i = t() * r.reduce((e, t) => e + t, 0), a = 0;
	for (; a < r.length - 1 && i >= r[a];) i -= r[a++];
	let o = n[a];
	return {
		x: o.left + t() * (o.right - o.left),
		y: o.top + t() * (o.bottom - o.top)
	};
}
function p(e, t, n = 0) {
	for (let r of e.segments) r.x += t, r.y += n;
	for (let r of e.traceHistory ?? []) r.x += t, r.y += n;
	for (let r of e.rayHits) r.pointX += t, r.pointY += n;
}
function m(e, t, n) {
	let r = a(t, e.selfTubes);
	if (!r) return 0;
	let i = 0;
	for (let t = 0; t < e.organisms.length; t++) {
		let a = e.organisms[t], o = a.segments[0], s = n.get(a.id);
		if (a.dissolving || s === void 0 || !r.runs.some((e) => o.y > e.top && o.y < e.bottom)) continue;
		let c = o.x <= -300 && o.x < s, l = o.x >= r.width + 300 && o.x > s;
		if (!c && !l) continue;
		let u = structuredClone(a);
		u.genome = a.genome, p(u, (c ? r.width + 200 : -200) - o.x), e.organisms[t] = u, i++;
	}
	return i;
}
function h(e, t) {
	t.runs.some((t) => e.y > t.top && e.y < t.bottom) && (e.x <= -300 ? e.x = t.width + 200 : e.x >= t.width + 300 && (e.x = -200));
	let n = d(t, e.x, e.y);
	n.x !== e.x && (e.vx = 0), n.y !== e.y && (e.vy = 0), e.x = n.x, e.y = n.y;
}
function g(e, t, n) {
	let r = i(n), s = a(t, r);
	for (let n of e.organisms) {
		let e = n.segments[0];
		if (e.x >= 0 && e.x <= t.worldWidth || s && o(s, e.x, e.y)) continue;
		let r = Infinity, i = -Infinity;
		for (let e = 0; e < n.segments.length; e++) {
			let t = n.segments[e], a = n.genome.parts[e], o = (Math.abs(Math.cos(t.angle)) * a.width + Math.abs(Math.sin(t.angle)) * a.height) / 2;
			r = Math.min(r, t.x - o), i = Math.max(i, t.x + o);
		}
		p(n, r < 5 ? 5 - r : i > t.worldWidth - 5 ? t.worldWidth - 5 - i : 0);
	}
	for (let n of [...e.eggs, ...e.nutrients]) (!s || !o(s, n.x, n.y)) && (n.x = l(n.x, 35, t.worldWidth - 35));
	e.selfTubes = r;
}
var _ = 16, v = class {
	times = new Float64Array(_).fill(-Infinity);
	joules = new Float64Array(_);
	stocks = new Float64Array(_);
	active = !1;
	seen = !1;
	add(e, t, n) {
		let r = Math.floor(e * 60 + 1e-6) % _;
		this.times[r] !== e && (this.times[r] = e, this.joules[r] = 0, this.stocks[r] = 0), this.joules[r] += t, this.stocks[r] = Math.max(this.stocks[r], n);
	}
	advance(e) {
		let t = 0, n = 0;
		for (let r = 0; r < _; r++) e - this.times[r] < .249999999 && (t += this.joules[r], n = Math.max(n, this.stocks[r]));
		return this.active = n > 0 && t / n >= (this.active ? .0035 : .005), this.seen ||= this.active, t > 0;
	}
}, y = class {
	entries = /* @__PURE__ */ new Map();
	clear() {
		this.entries.clear();
	}
	record = (e, t, n, r, i, a) => {
		if (!(n > 0)) return;
		let o = this.entries.get(e);
		o || (o = {
			gain: new v(),
			loss: new v(),
			parts: /* @__PURE__ */ new Map(),
			seenParts: /* @__PURE__ */ new Set()
		}, this.entries.set(e, o));
		let s = Math.max(r, i * .01, 1e-9);
		(a < 0 ? o.gain : o.loss).add(t, n, s), a >= 0 && o.parts.set(a, t);
	};
	advance(e) {
		for (let [t, n] of this.entries) {
			let r = e.organisms.find((e) => e.id === t);
			if (!r || r.dissolving) {
				this.entries.delete(t);
				continue;
			}
			let i = n.gain.advance(e.simTime), a = n.loss.advance(e.simTime);
			for (let [t, r] of n.parts) e.simTime - r >= .249999999 ? n.parts.delete(t) : n.loss.active && n.seenParts.add(t);
			!i && !a && !n.gain.seen && !n.loss.seen && this.entries.delete(t);
		}
	}
	frame() {
		let e = [];
		for (let [t, n] of this.entries) e.push({
			id: t,
			gain: n.gain.active,
			gainSeen: n.gain.seen,
			loss: n.loss.active,
			lossSeen: n.loss.seen,
			parts: n.loss.active ? [...n.parts.keys()] : [],
			seenParts: [...n.seenParts]
		}), n.gain.seen = n.loss.seen = !1, n.seenParts.clear();
		return e;
	}
}, b = /* @__PURE__ */ new WeakMap();
function x(e) {
	let t = new Set(e.keys()), n = b.get(e);
	return n || (n = /* @__PURE__ */ new Set(), b.set(e, n)), n.add(t), {
		pending: t,
		dispose: () => {
			n.delete(t);
		}
	};
}
function S(e, t) {
	for (let n of b.get(e) ?? []) n.add(t);
}
//#endregion
//#region ../vidAI/energyEconomy.ts
var C = .1, w = 2200;
function T(e) {
	return e.organisms.reduce((e, t) => e + t.energy + t.structuralBiomass, 0) + e.eggs.reduce((e, t) => e + t.fundedStructural + t.fundedReserve, 0) + e.nutrients.reduce((e, t) => e + t.energyValue, 0);
}
function E(e) {
	e.ageSeconds = Math.min(1, Math.max(0, e.incubationProgress)) * e.totalIncubationTime, e.hatchReserveTarget = Math.min(e.genome.maxEnergyCapacity, e.fundedReserve * 1.1);
}
function D(e, t) {
	if (!e.energyPool) throw Error("Convert this world to the closed economy first");
	if (!Number.isFinite(t) || t < 0 || t > 1e9) throw Error("World energy must be between 0 and 1,000,000,000 J");
	e.energyPool.reserve += t - e.energyPool.budget, e.energyPool.budget = t;
}
function O(e) {
	return e.organisms.filter((e) => !e.dissolving).length + (e.energyPool ? e.eggs.length : 0);
}
function k(e) {
	return e.genome.bodyCost + (e.hatchReserveTarget ?? 0);
}
function A(e, t) {
	let n = e.energyPool;
	if (!n || n.reserve <= 0) return;
	let r = e.eggs.map((e) => (e.ageSeconds ?? 0) + t >= 3 * e.totalIncubationTime ? 0 : Math.min(Math.max(0, k(e) - e.fundedStructural - e.fundedReserve), (e.hatchReserveTarget ?? 0) * C * t / e.totalIncubationTime)), i = r.reduce((e, t) => e + t, 0);
	if (!i) return;
	let a = Math.min(1, n.reserve / i);
	for (let t = 0; t < e.eggs.length; t++) {
		let i = Math.min(n.reserve, r[t] * a), o = e.eggs[t], s = Math.min(i, Math.max(0, o.genome.bodyCost - o.fundedStructural));
		o.fundedStructural += s, o.fundedReserve += i - s, n.reserve -= i;
	}
}
//#endregion
//#region ../vidAI/mouthGeometry.ts
function j(e) {
	let t = e.mouthType === "carnivore" ? 4.5 : e.mouthType === "omnivore" ? 4 : 3.5, n = t * 2;
	return {
		radius: t,
		diameter: n,
		length: Math.max(n, e.intakeLength ?? e.intakeWidth)
	};
}
function M(e, t, n, r, i, a) {
	let o = i - n, s = a - r, c = o * o + s * s, l = c === 0 ? 0 : Math.max(0, Math.min(1, ((e - n) * o + (t - r) * s) / c));
	return (e - n - l * o) ** 2 + (t - r - l * s) ** 2;
}
function ee(e, t, n, r, i, a, o) {
	let s = Math.cos(a.angle), c = Math.sin(a.angle), l = s * (e - a.x) + c * (t - a.y), u = -c * (e - a.x) + s * (t - a.y), d = s * (n - a.x) + c * (r - a.y), f = -c * (n - a.x) + s * (r - a.y), p = o.width / 2, m = o.height / 2, h = i * i, g = (e, t) => Math.max(0, Math.abs(e) - p) ** 2 + Math.max(0, Math.abs(t) - m) ** 2;
	if (Math.min(g(l, u), g(d, f)) <= h) return !0;
	let _ = 0, v = 1;
	for (let [e, t, n] of [[
		l,
		d - l,
		p
	], [
		u,
		f - u,
		m
	]]) if (t === 0) {
		if (Math.abs(e) > n) {
			v = -1;
			break;
		}
	} else {
		let r = (-n - e) / t, i = (n - e) / t;
		if (_ = Math.max(_, Math.min(r, i)), v = Math.min(v, Math.max(r, i)), _ > v) break;
	}
	return _ <= v || M(-p, -m, l, u, d, f) <= h || M(p, -m, l, u, d, f) <= h || M(p, m, l, u, d, f) <= h || M(-p, m, l, u, d, f) <= h;
}
//#endregion
//#region ../vidAI/foundationPhysics.ts
function te(e) {
	return e === "surface-work-v1" || e === "paid-work-v2" || e === "passive-work-v3";
}
var N = 175e-9, ne = .25;
function re(e, t, n) {
	return {
		x: 2 * n * t,
		y: 2 * n * e,
		angular: n * (e ** 3 + t ** 3) / 6
	};
}
function ie(e, t, n, r, i, a, o) {
	let s = t.attachmentPoint === "EAST" || t.attachmentPoint === "WEST" ? e.height : e.width, c = t.attachmentPoint === "EAST" || t.attachmentPoint === "WEST" ? t.height : t.width, l = Math.min(s, c), u = (Math.min(e.width, e.height) + Math.min(t.width, t.height)) / 4, d = 300 * l * u, f = 1 / (1 / n + 1 / r), p = i * d * (480 / 2200) * a;
	return {
		kp: p,
		kd: Math.sqrt(p * f) * 1.4 * a,
		maxTorque: d * o,
		section: l,
		lever: u
	};
}
function P(e, t, n, r, i) {
	let a = e * t, o = Math.sign(a), s = o * n, c = Math.max(0, i) * ne / N, l = Math.max(0, -s / r), u = Math.abs(a), d = (e) => s >= 0 ? s * e + .5 * r * e * e : .5 * r * Math.max(0, e - l) ** 2, f = i > 0 ? u : 0, p = f < u || d(f) > c;
	if (d(f) > c) {
		let e = s >= 0 ? 2 * c / (s + Math.sqrt(s ** 2 + 2 * r * c)) : l + Math.sqrt(2 * c / r);
		f = Math.min(f, e);
	}
	let m = o * f, h = Math.min(f, l), g = d(f) * N;
	return {
		impulse: m,
		positiveJ: g,
		negativeJ: -(s * h + .5 * r * h ** 2) * N,
		costJ: Math.min(Math.max(0, i), g / ne),
		limited: p
	};
}
function ae(e, t, n, r, i, a) {
	let o = 0, s = 0, c = 0, l = 0, u = (a) => {
		o = 0, s = 0;
		for (let c = 0; c < i; c++) {
			let i = e[c] * a, l = i * t[c], u = i * (t[c] + n[c] + a * r[c]);
			if (l >= 0 && u >= 0) o += .5 * (l + u);
			else if (l <= 0 && u <= 0) s -= .5 * (l + u);
			else {
				let e = -l / (u - l);
				l > 0 ? (o += .5 * l * e, s -= .5 * u * (1 - e)) : (s -= .5 * l * e, o += .5 * u * (1 - e));
			}
		}
	}, d = +(a > 0);
	u(d);
	let f = Math.max(0, a) * ne / N;
	if (o > f) {
		for (let a = 0; a < i; a++) c += Math.abs(e[a]) * (Math.abs(t[a]) + .5 * Math.abs(n[a])), l += .5 * Math.abs(e[a] * r[a]);
		d = l > 0 ? 2 * f / (c + Math.sqrt(c ** 2 + 4 * l * f)) : f / c, d = Math.min(1, Math.max(0, d)), u(d);
	}
	let p = o * N, m = s * N;
	return {
		scale: d,
		positiveJ: p,
		negativeJ: m,
		costJ: Math.min(Math.max(0, a), p / ne),
		limited: d < 1
	};
}
function oe(e, t) {
	return e + t <= 0 ? 1 : e >= 0 || t <= 0 ? 0 : Math.min(1, -e / t * (1 - 16 * 2 ** -52));
}
//#endregion
//#region ../vidAI/mechanicalObservation.ts
function F(e, t, n) {
	let r = Math.max(.35, t.dimN * t.dimM * n), i = r * (t.width * t.width + t.height * t.height) / 12;
	return (.5 * r * (e.vx * e.vx + e.vy * e.vy) + .5 * i * e.angVel * e.angVel) * N;
}
function I(e, t) {
	return e.segments.reduce((n, r, i) => n + F(r, e.genome.parts[i], t), 0);
}
//#endregion
//#region ../vidAI/neuralRuntime.ts
var se = /* @__PURE__ */ new WeakMap();
function ce(e, t, n) {
	let r = Array(t);
	for (let i = 0; i < t; i++) {
		let t = i * n, a = !1;
		for (let r = 0; r < n; r++) if (e[t + r]) {
			a = !0;
			break;
		}
		if (a) {
			let a = [];
			for (let r = 0; r < n; r++) e[t + r] || a.push(r);
			r[i] = a;
		}
	}
	return r;
}
function L(e) {
	se.delete(e);
}
function R(e) {
	let t = se.get(e), n = (e.plasticityRate ?? 0) > 0, r = (e.sensoryPlasticityRate ?? 0) > 0;
	if (t && t.inputs === e.inputKeys && t.outputs === e.outputKeys && t.hidden === e.hiddenIds && t.disabled === e.disabledConnections && t.disabledCount === (e.disabledConnections?.length ?? 0) && t.scope === e.plasticMotorScope && t.motorEnabled === n && t.sensoryEnabled === r) return t.compiled;
	let i = e.inputKeys, a = e.outputKeys, o = e.hiddenIds, s = new Uint8Array(o.length * i.length), c = new Uint8Array(o.length * o.length), l = new Uint8Array(a.length * o.length), u = new Map(i.map((e, t) => [e, t])), d = new Map(a.map((e, t) => [e, t])), f = new Map(o.map((e, t) => [e, t]));
	for (let t of e.disabledConnections ?? []) {
		let [e, n, r] = JSON.parse(t), a = (e === "ho" ? d : f).get(n), p = (e === "ih" ? u : f).get(r);
		a !== void 0 && p !== void 0 && (e === "ih" ? s[a * i.length + p] = 1 : e === "hh" ? c[a * o.length + p] = 1 : e === "ho" && (l[a * o.length + p] = 1));
	}
	let p = [], m = [], h = (e, t) => {
		let n = e * o.length + t;
		!l[n] && p.length < 96 && p.push({
			edge: JSON.stringify([
				"ho",
				a[e],
				o[t]
			]),
			slot: n,
			output: e,
			hidden: t
		});
	};
	if (n) {
		if (e.plasticMotorScope === "all") for (let e = 0; e < o.length && p.length < 96; e++) for (let t = 0; t < a.length && p.length < 96; t++) h(t, e);
		else for (let e = 0; e < a.length && p.length < 96; e++) if (a[e].endsWith(":Angle")) for (let t = 0; t < o.length && p.length < 96; t++) h(e, t);
	}
	if (r) for (let e = 0; e < o.length && m.length < 96; e++) for (let t = 0; t < i.length && m.length < 96; t++) {
		let n = e * i.length + t, r = i[t];
		!s[n] && r.startsWith("eye:") && /:(red|green|blue)$/.test(r) && m.push({
			edge: JSON.stringify([
				"ih",
				o[e],
				r
			]),
			slot: n,
			input: t,
			hidden: e
		});
	}
	let g = {
		ih: s,
		hh: c,
		ho: l,
		motor: p,
		sensory: m,
		enabledIH: ce(s, o.length, i.length),
		enabledHH: ce(c, o.length, o.length),
		enabledHO: ce(l, a.length, o.length),
		motorSlots: new Map(p.map((e) => [e.edge, e.slot])),
		sensorySlots: new Map(m.map((e) => [e.edge, e.slot]))
	};
	return se.set(e, {
		inputs: i,
		outputs: a,
		hidden: o,
		disabled: e.disabledConnections,
		disabledCount: e.disabledConnections?.length ?? 0,
		scope: e.plasticMotorScope,
		motorEnabled: n,
		sensoryEnabled: r,
		compiled: g
	}), g;
}
var le = /* @__PURE__ */ new WeakMap();
function ue(e, t) {
	if (e && le.get(e) === t) return e;
	let n = new Map(e?.map((e) => [e.edge, e])), r = t.map(({ edge: e }) => n.get(e) ?? {
		edge: e,
		delta: 0,
		eligibility: 0
	});
	return le.set(r, t), r;
}
function de(e, t, n, r) {
	if (r && le.get(r) === t && r.length === t.length) {
		let n = !0;
		for (let i = 0; i < t.length; i++) {
			if (r[i].edge !== t[i].edge) {
				n = !1;
				break;
			}
			e[t[i].slot] = r[i].delta;
		}
		if (n) return;
	}
	for (let { slot: n } of t) e[n] = 0;
	for (let t of r ?? []) {
		let r = n.get(t.edge);
		r !== void 0 && (e[r] = t.delta);
	}
}
var fe = /* @__PURE__ */ new WeakMap();
function pe(e, t) {
	let n = fe.get(e);
	return (!n || n.plan !== t) && (n = {
		plan: t,
		motor: new Float64Array(t.ho.length),
		sensory: new Float64Array(t.ih.length)
	}, fe.set(e, n)), de(n.motor, t.motor, t.motorSlots, e.learnedMotorWeights), de(n.sensory, t.sensory, t.sensorySlots, e.learnedSensoryWeights), n;
}
//#endregion
//#region ../vidAI/contacts.ts
var me = /* @__PURE__ */ new Float64Array(16), he = /* @__PURE__ */ new Float64Array(16);
function ge(e, t, n, r, i, a, o, s) {
	let c = Infinity, l = 0, u = 0;
	for (let d = 0; d < 4; d++) {
		let f = d === 0 ? i : d === 1 ? -a : d === 2 ? o : -s, p = d === 0 ? a : d === 1 ? i : d === 2 ? s : o, m = Math.abs(f * i + p * a) * t.width / 2 + Math.abs(-f * a + p * i) * t.height / 2, h = Math.abs(f * o + p * s) * r.width / 2 + Math.abs(-f * s + p * o) * r.height / 2, g = (n.x - e.x) * f + (n.y - e.y) * p, _ = m + h - Math.abs(g);
		if (_ <= 0) return null;
		_ < c && (c = _, l = g < 0 ? -f : f, u = g < 0 ? -p : p);
	}
	let d = me, f = he, p = 4;
	for (let n = 0; n < 4; n++) {
		let r = n === 0 || n === 3 ? -1 : 1, o = n < 2 ? -1 : 1;
		d[n * 2] = e.x + i * r * t.width / 2 - a * o * t.height / 2, d[n * 2 + 1] = e.y + a * r * t.width / 2 + i * o * t.height / 2;
	}
	for (let e = 0; e < 4; e++) {
		let t = e === 0 ? o : e === 1 ? -o : e === 2 ? -s : s, i = e === 0 ? s : e === 1 ? -s : e === 2 ? o : -o, a = e < 2 ? r.width / 2 : r.height / 2, c = 0;
		for (let e = 0; e < p; e++) {
			let r = (e + 1) % p, o = d[e * 2], s = d[e * 2 + 1], l = d[r * 2], u = d[r * 2 + 1], m = (o - n.x) * t + (s - n.y) * i - a, h = (l - n.x) * t + (u - n.y) * i - a;
			if (m <= 0 && (f[c * 2] = o, f[c * 2 + 1] = s, c++), m < 0 && h > 0 || m > 0 && h < 0) {
				let e = m / (m - h);
				f[c * 2] = o + (l - o) * e, f[c * 2 + 1] = s + (u - s) * e, c++;
			}
		}
		let l = d;
		d = f, f = l, p = c;
	}
	let m = 0, h = 0;
	for (let e = 0; e < p; e++) m += d[e * 2], h += d[e * 2 + 1];
	return {
		nx: l,
		ny: u,
		depth: c,
		x: p ? m / p : (e.x + n.x) / 2,
		y: p ? h / p : (e.y + n.y) / 2
	};
}
function _e(e, t, n, r, i, a, o) {
	let { nx: s, ny: c, x: l, y: u } = o, d = l - e.x, f = u - e.y, p = l - r.x, m = u - r.y, h = (r.vx - r.angVel * m - e.vx + e.angVel * f) * s + (r.vy + r.angVel * p - e.vy - e.angVel * d) * c;
	if (h >= 0) return;
	let g = d * c - f * s, _ = p * c - m * s, v = -h / (t + i + g * g * n + _ * _ * a);
	e.vx -= s * v * t, e.vy -= c * v * t, e.angVel -= g * v * n, r.vx += s * v * i, r.vy += c * v * i, r.angVel += _ * v * a;
}
var ve = [];
function ye(e, t) {
	let n = [];
	for (let r of e) for (let e = 0; e < r.segments.length; e++) {
		let i = r.segments[e], a = r.genome.parts[e], o = Math.max(.35, a.dimN * a.dimM * t), s = Math.cos(i.angle), c = Math.sin(i.angle), l = (Math.abs(s) * a.width + Math.abs(c) * a.height) / 2, u = (Math.abs(c) * a.width + Math.abs(s) * a.height) / 2, d = 1 / o, f = 12 / (o * (a.width ** 2 + a.height ** 2)), p = i.x - l, m = i.x + l, h = i.y - u, g = i.y + u, _ = Math.floor(p / 128), v = Math.floor(m / 128), y = Math.floor(h / 128), b = Math.floor(g / 128), x = ve[n.length];
		x ? (x.org = r, x.index = e, x.p = i, x.def = a, x.im = d, x.ii = f, x.c = s, x.s = c, x.left = p, x.right = m, x.top = h, x.bottom = g, x.cellLeft = _, x.cellRight = v, x.cellTop = y, x.cellBottom = b) : (x = {
			org: r,
			index: e,
			p: i,
			def: a,
			im: d,
			ii: f,
			c: s,
			s: c,
			left: p,
			right: m,
			top: h,
			bottom: g,
			cellLeft: _,
			cellRight: v,
			cellTop: y,
			cellBottom: b
		}, ve.push(x)), n.push(x);
	}
	return ve.length = n.length, n;
}
var be = /* @__PURE__ */ new Map(), xe = 0, Se = 0;
function Ce(e) {
	xe = xe + 1 >>> 0, (!xe || Se > 4096) && (be.clear(), Se = 0, xe = 1);
	let t = [];
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (let i = r.cellLeft; i <= r.cellRight; i++) {
			let a = be.get(i);
			a || (a = /* @__PURE__ */ new Map(), be.set(i, a));
			for (let o = r.cellTop; o <= r.cellBottom; o++) {
				let s = a.get(o);
				s || (s = {
					stamp: xe,
					indices: []
				}, a.set(o, s), Se++), s.stamp !== xe && (s.stamp = xe, s.indices.length = 0);
				for (let n of s.indices) {
					let a = e[n];
					i === Math.max(r.cellLeft, a.cellLeft) && o === Math.max(r.cellTop, a.cellTop) && (r.org !== a.org || r.def.parentIndex !== a.index && a.def.parentIndex !== r.index) && (r.right <= a.left || r.left >= a.right || r.bottom <= a.top || r.top >= a.bottom || t.push([a, r]));
				}
				s.indices.push(n);
			}
		}
	}
	return t;
}
function we(e, t, n, r) {
	let i = /* @__PURE__ */ new Set(), a = (e, i) => {
		let a = r ? I(e, t) : 0;
		n(e, i), r && r("position-projection", a, I(e, t));
	};
	for (let n = 0; n < 8; n++) {
		let n = 0;
		for (let [a, o] of Ce(ye(e, t))) {
			let e = ge(a.p, a.def, o.p, o.def, a.c, a.s, o.c, o.s);
			if (!e) continue;
			n++, i.add(a.org), i.add(o.org);
			let s = r ? F(a.p, a.def, t) + F(o.p, o.def, t) : 0;
			_e(a.p, a.im, a.ii, o.p, o.im, o.ii, e), r && r("contact-impulse", s, F(a.p, a.def, t) + F(o.p, o.def, t));
			let c = Math.min(3, Math.max(0, e.depth - .02) * .6) / (a.im + o.im);
			a.p.x -= e.nx * c * a.im, a.p.y -= e.ny * c * a.im, o.p.x += e.nx * c * o.im, o.p.y += e.ny * c * o.im;
		}
		if (!n) break;
		for (let e of i) a(e, 4);
	}
	for (let e of i) a(e, 12);
	return i;
}
//#endregion
//#region ../vidAI/spatialIndex.ts
var z = 128, B = 1e-7, Te = class {
	rows = /* @__PURE__ */ new Map();
	visited;
	stamp = 0;
	constructor(e) {
		this.visited = new Uint32Array(e.length);
		for (let t = 0; t < e.length; t++) {
			let n = e[t];
			for (let e = Math.floor((n.top - B) / z); e <= Math.floor((n.bottom + B) / z); e++) {
				let r = this.rows.get(e);
				r || (r = /* @__PURE__ */ new Map(), this.rows.set(e, r));
				for (let e = Math.floor((n.left - B) / z); e <= Math.floor((n.right + B) / z); e++) {
					let n = r.get(e);
					n || (n = [], r.set(e, n)), n.push(t);
				}
			}
		}
	}
	begin() {
		return this.stamp = this.stamp + 1 >>> 0, this.stamp ||= (this.visited.fill(0), 1), this.stamp;
	}
	collect(e, t, n, r, i) {
		for (let a = t; a <= n; a++) {
			let t = e.get(a);
			if (t) for (let e of t) this.visited[e] !== r && (this.visited[e] = r, i.push(e));
		}
	}
	query(e, t, n, r) {
		let i = [], a = this.begin(), o = n - e, s = r - t, c = Math.floor((Math.min(t, r) - B) / z), l = Math.floor((Math.max(t, r) + B) / z);
		for (let n = c; n <= l; n++) {
			let r = this.rows.get(n);
			if (!r) continue;
			let c = 0, l = 1;
			if (s !== 0) {
				let e = (n * z - B - t) / s, r = ((n + 1) * z + B - t) / s;
				if (c = Math.max(0, Math.min(e, r)), l = Math.min(1, Math.max(e, r)), c > l) continue;
			}
			let u = e + o * c, d = e + o * l;
			this.collect(r, Math.floor((Math.min(u, d) - B) / z), Math.floor((Math.max(u, d) + B) / z), a, i);
		}
		return i.sort((e, t) => e - t);
	}
	queryBounds(e, t, n, r) {
		let i = [], a = this.begin();
		for (let o = Math.floor((t - B) / z); o <= Math.floor((r + B) / z); o++) {
			let t = this.rows.get(o);
			t && this.collect(t, Math.floor((e - B) / z), Math.floor((n + B) / z), a, i);
		}
		return i.sort((e, t) => e - t);
	}
}, Ee = class extends Te {
	static CELL_SIZE = 128;
	nutrientCount;
	constructor(e) {
		super(e.map((e) => ({
			left: e.x - e.radius,
			right: e.x + e.radius,
			top: e.y - e.radius,
			bottom: e.y + e.radius
		}))), this.nutrientCount = e.length;
	}
}, De = class e {
	s;
	constructor(e = 1337) {
		this.s = /* @__PURE__ */ new Uint32Array(4), this.reseed(e);
	}
	reseed(e) {
		let t = e >>> 0 || 1;
		for (let e = 0; e < 4; e++) {
			let n = t = t + 2654435769 >>> 0;
			n = Math.imul(n ^ n >>> 16, 2246822507), n = Math.imul(n ^ n >>> 13, 3266489909);
			let r = (n ^ n >>> 16) >>> 0;
			this.s[e] = r || 2654435769 + e;
		}
	}
	nextUint32() {
		let e = this.s, t = e[0] + e[3] >>> 0, n = ((t << 7 | t >>> 25) >>> 0) + e[0] >>> 0, r = e[1] << 9;
		return e[2] ^= e[0], e[3] ^= e[1], e[1] ^= e[2], e[0] ^= e[3], e[2] ^= r, e[3] = (e[3] << 11 | e[3] >>> 21) >>> 0, n;
	}
	nextFloat() {
		return (this.nextUint32() >>> 0) / 4294967296;
	}
	range(e, t) {
		return e + this.nextFloat() * (t - e);
	}
	rangeInt(e, t) {
		return Math.floor(this.range(e, t + 1));
	}
	getState() {
		return [
			this.s[0],
			this.s[1],
			this.s[2],
			this.s[3]
		];
	}
	setState(e) {
		this.s[0] = e[0], this.s[1] = e[1], this.s[2] = e[2], this.s[3] = e[3];
	}
	clone() {
		let t = new e(1);
		return t.setState(this.getState()), t;
	}
}, V = new De(4242), H = .4, Oe = 175e-9, ke = .45, Ae = 25e-5, je = .08, Me = .8, Ne = .6, Pe = .002, Fe = .4, Ie = .004, Le = .12, Re = 2e3, ze = .12, Be = 1e4, Ve = 1e5, He = 3600, Ue = He * .5, We = .8, U = 3e3, Ge = [
	0,
	0,
	0
], Ke = [
	1,
	1,
	1
], qe = [
	"Angle",
	"Drive",
	"Torque",
	"Stiff",
	"Amp",
	"Engage"
], Je = [
	"EAST",
	"WEST",
	"NORTH",
	"SOUTH"
];
function Ye(e) {
	return e.reduce((e, t) => {
		let n = t.spectralSensitivity;
		return e + 5 * (.25 + .75 * (n ? (n[0] + n[1] + n[2]) / 3 : 1));
	}, 0);
}
var Xe = /* @__PURE__ */ new Float64Array(16), Ze = /* @__PURE__ */ new Float64Array(16), W = /* @__PURE__ */ new Float64Array(16), Qe = /* @__PURE__ */ new Float64Array(16), $e = /* @__PURE__ */ new Float64Array(16), et = /* @__PURE__ */ new Float64Array(16), tt = /* @__PURE__ */ new Float64Array(16), nt = /* @__PURE__ */ new Float64Array(16), rt = /* @__PURE__ */ new Float64Array(16), it = /* @__PURE__ */ new Float64Array(16), at = /* @__PURE__ */ new Float64Array(16), G = /* @__PURE__ */ new Float64Array(16), ot = /* @__PURE__ */ new Float64Array(96), K = /* @__PURE__ */ new Float64Array(21), st = Array.from({ length: 6 }, () => ({
	parentIdx: 0,
	childIdx: 0,
	rPx: 0,
	rPy: 0,
	rCx: 0,
	rCy: 0,
	biasX: 0,
	biasY: 0,
	wP: 0,
	wC: 0,
	iP: 0,
	iC: 0,
	k11: 0,
	k22: 0,
	k12: 0,
	det: 0,
	limited: !1,
	angularBias: 0
})), q = (e, t, n) => Math.max(t, Math.min(n, e));
function ct(e) {
	return (e % 360 + 360) % 360;
}
function lt(e, t) {
	return [
		Math.floor(ct(e.genome.hue + t * 8)),
		Math.floor(e.genome.saturation),
		Math.floor(e.energy < e.genome.maxEnergyCapacity * .2 ? 30 : e.genome.lightness)
	];
}
function ut(e) {
	return e.kind === "carrion" ? [
		240 / 255,
		120 / 255,
		106 / 255
	] : [
		34 / 255,
		224 / 255,
		120 / 255
	];
}
function dt(e) {
	return Be * q(e.eggReserveFraction ?? .35, .2, .55);
}
function ft(e, t, n, r, i = 50, a = 75, o = !1) {
	let s = e.genome, c = s.maturityAge || 20, l = s.targetClutchSize || 2, u = Math.max(Re, s.maxEnergyCapacity * ze), d = s.bodyCost + dt(s), f = e.energy - u, p = d + u, m = d * l + u, h = s.reproductionCooldown || 18, g = t - (e.lastReproductionTime || 0), _ = Math.max(0, h - g), v = Math.max(0, Math.floor(f / d)), y = Math.max(0, Math.min(l, v, o ? i - n - r : Infinity, o ? a - r : Infinity));
	return e.dissolving || e.dissolveAlpha < 1 ? {
		eligible: !1,
		affordableCount: 0,
		desiredCount: l,
		actualClutchSize: 0,
		eggCost: d,
		parentReserve: u,
		availableForReproduction: 0,
		requiredBudget: m,
		requiredForOneEgg: p,
		statusText: "💀 Deceased",
		badgeClass: "bg-slate-900 border-slate-700 text-slate-500",
		remainingCooldown: 0
	} : e.age < c ? {
		eligible: !1,
		affordableCount: 0,
		desiredCount: l,
		actualClutchSize: 0,
		eggCost: d,
		parentReserve: u,
		availableForReproduction: f,
		requiredBudget: m,
		requiredForOneEgg: p,
		statusText: `🌱 Immature (${(c - e.age).toFixed(1)}s to maturity)`,
		badgeClass: "bg-emerald-950/80 border-emerald-500/40 text-emerald-300",
		remainingCooldown: 0
	} : n + (o ? r : 0) >= i ? {
		eligible: !1,
		affordableCount: v,
		desiredCount: l,
		actualClutchSize: y,
		eggCost: d,
		parentReserve: u,
		availableForReproduction: f,
		requiredBudget: m,
		requiredForOneEgg: p,
		statusText: "🚫 Pop Cap Reached",
		badgeClass: "bg-rose-950/80 border-rose-500/40 text-rose-300",
		remainingCooldown: 0
	} : r >= a ? {
		eligible: !1,
		affordableCount: v,
		desiredCount: l,
		actualClutchSize: y,
		eggCost: d,
		parentReserve: u,
		availableForReproduction: f,
		requiredBudget: m,
		requiredForOneEgg: p,
		statusText: "🥚 Egg Cap Reached",
		badgeClass: "bg-amber-950/80 border-amber-500/40 text-amber-300",
		remainingCooldown: 0
	} : _ > .05 ? {
		eligible: !1,
		affordableCount: v,
		desiredCount: l,
		actualClutchSize: y,
		eggCost: d,
		parentReserve: u,
		availableForReproduction: f,
		requiredBudget: m,
		requiredForOneEgg: p,
		statusText: `⏳ Cooldown (${_.toFixed(1)}s)`,
		badgeClass: "bg-blue-950/80 border-blue-500/40 text-blue-300",
		remainingCooldown: _
	} : y < 1 ? {
		eligible: !1,
		affordableCount: 0,
		desiredCount: l,
		actualClutchSize: 0,
		eggCost: d,
		parentReserve: u,
		availableForReproduction: f,
		requiredBudget: m,
		requiredForOneEgg: p,
		statusText: `⚡ Foraging for 1st egg (${Math.round(Math.max(0, e.energy))} / ${Math.round(p)} J)`,
		badgeClass: "bg-slate-900/80 border-slate-700 text-slate-400",
		remainingCooldown: 0
	} : {
		eligible: !0,
		affordableCount: v,
		desiredCount: l,
		actualClutchSize: y,
		eggCost: d,
		parentReserve: u,
		availableForReproduction: f,
		requiredBudget: m,
		requiredForOneEgg: p,
		statusText: `★ Ready (Laying ${y}/${l} eggs)`,
		badgeClass: "bg-amber-500/20 border-amber-400 text-amber-300 font-bold",
		remainingCooldown: 0
	};
}
function pt(e) {
	if (!e || e.length === 0) return {
		category: "Passive",
		label: "Passive Grazer",
		composition: "0 Mouths (Passive)",
		badgeClass: "bg-slate-900/80 border-slate-700 text-slate-400",
		textClass: "text-slate-400",
		icon: "⚪",
		herbivores: 0,
		carnivores: 0,
		omnivores: 0
	};
	let t = 0, n = 0, r = 0;
	for (let i of e) i.mouthType === "carnivore" ? n++ : i.mouthType === "omnivore" ? r++ : t++;
	let i = [];
	n > 0 && i.push(`${n} Carnivore`), r > 0 && i.push(`${r} Omnivore`), t > 0 && i.push(`${t} Herbivore`);
	let a = i.join(" · ");
	return n > 0 && t === 0 && r === 0 ? {
		category: "Carnivore",
		label: "Carnivore",
		composition: a,
		badgeClass: "bg-rose-950/80 border-rose-500/40 text-rose-300",
		textClass: "text-rose-400 font-bold",
		icon: "🥩",
		herbivores: 0,
		carnivores: n,
		omnivores: 0
	} : t > 0 && n === 0 && r === 0 ? {
		category: "Herbivore",
		label: "Herbivore",
		composition: a,
		badgeClass: "bg-emerald-950/80 border-emerald-500/40 text-emerald-300",
		textClass: "text-emerald-400 font-bold",
		icon: "🌿",
		herbivores: t,
		carnivores: 0,
		omnivores: 0
	} : {
		category: "Omnivore",
		label: "Omnivore",
		composition: a,
		badgeClass: "bg-purple-950/80 border-purple-500/40 text-purple-300",
		textClass: "text-purple-300 font-bold",
		icon: "🟣",
		herbivores: t,
		carnivores: n,
		omnivores: r
	};
}
function mt(e, t, n, r, i, a) {
	if (a <= 0) return;
	e.recentFeedings ||= [];
	let o = e.recentFeedings[e.recentFeedings.length - 1];
	o && o.mouthId === n && o.foodCategory === i && t - o.timestamp < .25 ? (o.energyTransferred += a, o.timestamp = t) : (e.recentFeedings.push({
		timestamp: t,
		mouthId: n,
		mouthType: r,
		foodCategory: i,
		energyTransferred: a
	}), e.recentFeedings.length > 8 && e.recentFeedings.shift());
}
function J(e, t) {
	if (t === "decay-v2" && e <= 3e3) return Math.max(6, 18 * Math.sqrt(Math.max(0, e) / U));
	if (t === "decay-v1" && e <= 3e3) return 18 * Math.sqrt(Math.max(0, e) / U);
	let n = Math.max(.1, e / U), r = 1 + .35 * Math.log2(n);
	return Math.max(8, 18 * Math.max(.4, r));
}
function ht(e, t) {
	let n = new De(((e.initialSeed ?? 0) ^ 1831565813) >>> 0), r = [];
	for (let e = 0; e < 3; e++) for (let i = 0; i < 4; i++) r.push({
		x: (i + .5 + n.range(-.16, .16)) * t.worldWidth / 4,
		y: (e + .5 + n.range(-.16, .16)) * t.worldHeight / 3
	});
	return r;
}
function gt(e, t) {
	let n = e.nutrients.filter((e) => e.kind !== "carrion").length;
	return e.energyPool ? Math.max(0, Math.min((t.nutrientLimit ?? Infinity) - n, w - e.nutrients.length, Math.floor(Math.max(0, e.energyPool.reserve) / U))) : Math.max(0, Math.min(Math.floor(t.targetNutrients) - n, 2200 - e.nutrients.length));
}
function _t(e, t, n, r) {
	let i = Math.min(Math.max(0, Math.floor(n)), gt(e, t)), o = e.prng, s = a(t, e.selfTubes), c = !r && t.nutrientPattern === "blooms" ? ht(e, t) : void 0, l = Math.max(40, Math.min(170, Math.min(t.worldWidth, t.worldHeight) * .12));
	for (let n = 0; n < i; n++) {
		let n = c && o.nextFloat() < .65 ? c[o.rangeInt(0, c.length - 1)] : void 0, i = r ?? (n && {
			x: n.x,
			y: n.y,
			spread: l
		});
		if (s) {
			let t = i ? d(s, i.x + o.range(-i.spread, i.spread), i.y + o.range(-i.spread, i.spread), 40) : f(s, () => o.nextFloat());
			e.nutrients.push({
				id: `NUT-${o.nextUint32().toString(36)}`,
				...t,
				vx: 0,
				vy: 0,
				energyValue: U,
				radius: J(U),
				bottomTimer: 0,
				pulseTimer: o.range(0, Math.PI * 2)
			}), e.energyPool ? e.energyPool.reserve -= U : e.ledger.externalInflow += U;
		} else e.nutrients.push({
			id: `NUT-${o.nextUint32().toString(36)}`,
			x: i ? q(i.x + o.range(-i.spread, i.spread), 40, t.worldWidth - 40) : o.range(40, t.worldWidth - 40),
			y: i ? q(i.y + o.range(-i.spread, i.spread), 40, t.worldHeight - 40) : o.range(40, t.worldHeight - 40),
			vx: 0,
			vy: 0,
			energyValue: U,
			radius: J(U),
			bottomTimer: 0,
			pulseTimer: o.range(0, Math.PI * 2)
		}), e.energyPool ? e.energyPool.reserve -= U : e.ledger.externalInflow += U;
	}
	return i;
}
function vt(e) {
	switch (e) {
		case "EAST": return "WEST";
		case "WEST": return "EAST";
		case "NORTH": return "SOUTH";
		case "SOUTH": return "NORTH";
	}
}
function yt(e, t, n) {
	return e === "NORTH" || e === "SOUTH" ? t > n : n > t;
}
function bt(e, t, n, r, i) {
	let a = yt(e, t, n), o = yt(vt(e), r, i);
	return !(a && o);
}
function xt(e, t, n, r = V) {
	if (yt(e, t, n)) {
		if (e === "EAST" || e === "WEST") {
			let e = r.rangeInt(3, 7);
			return {
				dimN: e,
				dimM: r.rangeInt(1, e)
			};
		}
		{
			let e = r.rangeInt(3, 7);
			return {
				dimN: r.rangeInt(1, e),
				dimM: e
			};
		}
	}
	return {
		dimN: r.rangeInt(2, 6),
		dimM: r.rangeInt(2, 6)
	};
}
function St(e, t) {
	if (e.id === t.id || e.genome.parentIds.includes(t.id) || t.genome.parentIds.includes(e.id) || e.clutchId && t.clutchId && e.clutchId === t.clutchId) return !0;
	if (e.genome.generation === t.genome.generation && e.genome.parentIds.length > 0 && t.genome.parentIds.length > 0) {
		for (let n of e.genome.parentIds) if (t.genome.parentIds.includes(n)) return !0;
	}
	return !1;
}
function Ct(e, t) {
	if (t.parentOrgId === e.id || t.clutchId && e.clutchId && t.clutchId === e.clutchId || t.genome.parentIds && t.genome.parentIds.includes(e.id)) return !0;
	if (e.genome.parentIds && t.genome.parentIds) {
		for (let n of e.genome.parentIds) if (t.genome.parentIds.includes(n)) return !0;
	}
	return !1;
}
function wt(e, t, n) {
	let r = t * .5, i = n * .5;
	switch (e) {
		case "EAST": return {
			x: r,
			y: 0
		};
		case "WEST": return {
			x: -r,
			y: 0
		};
		case "NORTH": return {
			x: 0,
			y: -i
		};
		case "SOUTH": return {
			x: 0,
			y: i
		};
	}
}
function Tt(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n = 1; n < e.length; n++) {
		let r = e[n];
		t.add(`${r.parentIndex}:${r.attachmentPoint}`), t.add(`${n}:${vt(r.attachmentPoint)}`);
	}
	return t;
}
function Et(e) {
	let t = Tt(e.parts), n = new Set([...e.eyes, ...e.mouths].map((e) => `${e.partIndex}:${e.direction}:${e.slot ?? 0}`));
	return e.parts.flatMap((e, r) => Je.flatMap((e) => t.has(`${r}:${e}`) ? [] : [
		0,
		1,
		2
	].filter((t) => !n.has(`${r}:${e}:${t}`)).map((t) => ({
		partIndex: r,
		direction: e,
		slot: t
	}))));
}
function Dt(e) {
	let t = Tt(e.parts), n = /* @__PURE__ */ new Set(), r = [];
	for (let i of [...e.eyes, ...e.mouths]) {
		let a = `${i.partIndex}:${i.direction}`, o = `${a}:${i.slot}`;
		(!Number.isInteger(i.partIndex) || i.partIndex < 0 || i.partIndex >= e.parts.length || !Je.includes(i.direction) || ![
			0,
			1,
			2
		].includes(i.slot)) && r.push(`Invalid organ slot ${i.id}`), t.has(a) && r.push(`Physical face occupied by organ ${i.id}`), n.has(o) && r.push(`Duplicate organ slot ${i.id}`), n.add(o);
	}
	return r;
}
function Ot(e) {
	let t = Tt(e.parts), n = /* @__PURE__ */ new Set();
	for (let r of [...e.mouths, ...e.eyes]) {
		let i = e.parts.flatMap((e, r) => Je.flatMap((e) => t.has(`${r}:${e}`) ? [] : [
			0,
			1,
			2
		].filter((t) => !n.has(`${r}:${e}:${t}`)).map((t) => ({
			partIndex: r,
			direction: e,
			slot: t
		})))), a = r.slot ?? 0;
		i.sort((e, t) => {
			let n = (e) => (e.partIndex === r.partIndex ? 0 : 100 + Math.abs(e.partIndex - r.partIndex)) + (e.direction === r.direction ? 0 : 10) + (e.slot === a ? 0 : e.slot + 1);
			return n(e) - n(t);
		});
		let o = i[0];
		if (!o) throw Error("No free surface slot for organ");
		Object.assign(r, o), n.add(`${o.partIndex}:${o.direction}:${o.slot}`);
	}
}
function kt(e, t, n) {
	let r = wt(e.direction, t, n), i = e.slot === 1 ? -1 / 3 : e.slot === 2 ? 1 / 3 : 0;
	return e.direction === "NORTH" || e.direction === "SOUTH" ? r.x += t * i : r.y += n * i, r;
}
function At(e, t, n) {
	let r = t * .5, i = n * .5;
	switch (e) {
		case "EAST": return {
			x: -r,
			y: 0
		};
		case "WEST": return {
			x: r,
			y: 0
		};
		case "NORTH": return {
			x: 0,
			y: i
		};
		case "SOUTH": return {
			x: 0,
			y: -i
		};
	}
}
function jt(e) {
	switch (e) {
		case "EAST": return 0;
		case "WEST": return Math.PI;
		case "NORTH": return -Math.PI / 2;
		case "SOUTH": return Math.PI / 2;
	}
}
function Mt(e) {
	switch (e) {
		case "EAST": return {
			x: 1,
			y: 0
		};
		case "WEST": return {
			x: -1,
			y: 0
		};
		case "NORTH": return {
			x: 0,
			y: -1
		};
		case "SOUTH": return {
			x: 0,
			y: 1
		};
	}
}
function Y(e, t, n) {
	let r = 1200;
	for (let t of e) r += t.dimN * t.dimM * 80;
	return r += t.length * 250, r += n.length * 400, r += Math.max(0, e.length - 1) * 200, Math.round(r);
}
function Nt(e) {
	let t = 0;
	for (let n of e) t += n.dimN * n.dimM;
	return Math.max(4, t);
}
function X(e, t = 1) {
	let n = Nt(e) / 36 * Ve * t;
	return Math.round(q(n, 4e4, 3e5));
}
function Z(e, t, n, r, i, a = 2, o = 0, s = 0, c = 1, l = 1) {
	let u = q(Math.round(r), 1, 10), d = q(Math.round(i), 1, 10);
	return {
		id: e,
		parentIndex: t,
		attachmentPoint: n,
		dimN: u,
		dimM: d,
		width: u * 7,
		height: d * 7,
		maxAngle: q(a, .6, 2.35),
		baseAngleOffset: o,
		cpgPhaseOffset: s,
		cpgAmp: c,
		cpgFreqMult: l
	};
}
function Pt(e = V, t = 22, n = 24, r = 24) {
	if (!Number.isInteger(r) || r < 1 || r > 96) throw Error("Invalid hidden neuron count");
	let i = Math.sqrt(6 / (t + r)), a = Math.sqrt(6 / (r + r)), o = Math.sqrt(6 / (r + n));
	return {
		weightsIH: Array.from({ length: r }, () => Array.from({ length: t }, () => e.range(-i, i))),
		weightsHH: Array.from({ length: r }, () => Array.from({ length: r }, () => e.range(-a * .8, a * .8))),
		biasesH: Array.from({ length: r }, () => e.range(-.05, .05)),
		weightsHO: Array.from({ length: n }, () => Array.from({ length: r }, () => e.range(-o, o))),
		biasesO: Array.from({ length: n }, () => e.range(-.05, .05))
	};
}
function Ft(e, t = !0, n = !0) {
	let r = [], i = [];
	e.eyes.forEach((e, t) => {
		for (let n = 0; n < 5; n++) for (let a of [
			"red",
			"green",
			"blue",
			"distance"
		]) r.push(`eye:${e.id}:ray:${n}:${a}`), i.push(`E${t + 1} R${n + 1} ${a}`);
	}), e.parts.slice(1).forEach((e, t) => {
		for (let n of ["angle", "velocity"]) r.push(`joint:${e.id}:${n}`), i.push(`J${t + 1} ${n}`);
	}), r.push("body:speed", "body:energy", "body:sin", "body:cos"), i.push("Speed", "Energy", "CPG sin", "CPG cos");
	for (let [t, n] of (e.mouths ?? []).entries()) r.push(`mouth:${n.id}:contact`, `mouth:${n.id}:intake`), i.push(`M${t + 1} food contact`, `M${t + 1} absorbed intake`);
	return t && (r.push("body:feeding", "body:depth"), i.push("Currently feeding", "Depth / pressure"), n && (r.push("body:injury"), i.push("Recently bitten (real energy loss)"))), {
		inputs: r,
		labels: i,
		outputs: e.parts.slice(1).flatMap((e) => qe.map((t) => `joint:${e.id}:${t}`))
	};
}
function It(e) {
	let t = [], n = e.eyes.length === 1 ? 5 : Math.max(2, Math.floor(6 / e.eyes.length));
	for (let r of e.eyes) for (let e = 0; e < n && t.length < 15; e++) {
		let i = Math.round(e * 4 / Math.max(1, n - 1));
		for (let e of [
			"red",
			"green",
			"blue"
		]) t.push(`eye:${r.id}:ray:${i}:${e}`);
	}
	for (; t.length < 15;) t.push(`unused:${t.length}`);
	for (let n = 1; n <= 3; n++) t.push(`joint:${e.parts[n]?.id ?? "unused"}:angle`);
	return t.push("body:speed", "body:energy", "body:sin", "body:cos"), t;
}
function Lt(e) {
	return e.parts.slice(1).flatMap((e) => qe.slice(0, 4).map((t) => `joint:${e.id}:${t}`));
}
function Q(e, t, n) {
	return JSON.stringify([
		e,
		t,
		n
	]);
}
function Rt(e) {
	return Array.from({ length: e }, (e, t) => `hidden:${t}`);
}
function zt(e, t, n, r) {
	return n === 0 ? t : e + -Math.expm1(-r / n) * (t - e);
}
function Bt(e) {
	return je * (e.hiddenTimeConstants?.reduce((e, t) => e + t, 0) ?? 0);
}
function Vt(e) {
	return R(e).motor;
}
function Ht(e) {
	return R(e).sensory;
}
var Ut = { forget: 1 }, Wt = /* @__PURE__ */ new Float64Array(96), Gt = /* @__PURE__ */ new Float64Array(96), Kt = /* @__PURE__ */ new Float64Array(96);
function qt(e, t, n, r) {
	let i = e.forgettingRate ?? .1, a = e.memoryConsolidationRate ?? 0;
	if (a <= 0) return Ut.forget = Math.exp(-i * r), Ut.consolidation = void 0, Ut;
	let o = t?.consolidation ?? 0, s = t && t.delta * n > 0, c = t && t.delta * n < 0, l = s ? a * Math.min(1, Math.abs(n)) * (1 - o) * r : 0, u = o * a * (c ? .5 : .008) * r;
	return Ut.forget = Math.exp(-i * (1 - .95 * o) * r), Ut.consolidation = q(o + l - u, 0, 1), Ut;
}
function Jt(e, t, n) {
	let r = e.genome;
	if (!(r.sensoryPlasticityRate && r.sensoryPlasticityRate > 0) || t <= 0 || e.dissolving) return 0;
	let i = Ht(r);
	if (!i.length) return 0;
	let a = e.learnedSensoryWeights = ue(e.learnedSensoryWeights, i), o = -Math.expm1(-t / Ne), s = 0;
	for (let t of r.mouths) s = Math.max(s, e.mouthFeedback?.[t.id]?.intake ?? 0);
	s = q(s, 0, 1);
	let c = r.inputKeys.indexOf("body:injury"), l = c >= 0 ? q(e.neuralInputs[c] ?? 0, 0, 1) : 0, u = r.sensoryPlasticityRate * s - (r.injuryAversionRate ?? 0) * l, d = 0, f = 0;
	for (let n = 0; n < i.length; n++) {
		let { input: s, hidden: c } = i[n], l = a[n], p = q(e.neuralInputs[s] ?? 0, 0, 1), m = q(l.eligibility * (1 - o) + o * p * e.neuralHidden[c], -1, 1), h = u * m, g = qt(r, l, h, t), _ = q(l.delta * g.forget + h * t, -.8, Me);
		Wt[n] = _, Gt[n] = m, Kt[n] = g.consolidation ?? 0, d += Kt[n], f += Math.abs(_ - l.delta);
	}
	let p = d * Ie * t, m = Math.min(e.energy, i.length * Pe * t + p), h = f * Fe, g = Math.min(h, Math.max(0, e.energy - m)), _ = h > 0 ? g / h : 1, v = m + g;
	e.energy -= v, n.metabolicDissipation += v;
	for (let e = 0; e < a.length; e++) {
		let t = a[e], n = t.consolidation ?? 0;
		t.delta += (Wt[e] - t.delta) * _, t.eligibility = Gt[e], (r.memoryConsolidationRate ?? 0) > 0 ? t.consolidation = n + (Kt[e] - n) * (Kt[e] > n ? _ : 1) : delete t.consolidation;
	}
	return v;
}
function Yt(e, t, n) {
	let r = e.genome;
	if (!(r.plasticityRate && r.plasticityRate > 0) || t <= 0 || e.dissolving) return 0;
	let i = Vt(r);
	if (i.length === 0) return 0;
	let a = e.learnedMotorWeights = ue(e.learnedMotorWeights, i), o = -Math.expm1(-t / Ne), s = 0;
	for (let t of r.mouths) s = Math.max(s, e.mouthFeedback?.[t.id]?.intake ?? 0);
	s = q(s, 0, 1);
	let c = r.inputKeys.indexOf("body:injury"), l = c >= 0 ? q(e.neuralInputs[c] ?? 0, 0, 1) : 0, u = r.plasticityRate * s - (r.injuryAversionRate ?? 0) * l, d = 0, f = 0;
	for (let n = 0; n < i.length; n++) {
		let { output: s, hidden: c } = i[n], l = a[n], p = q(l.eligibility * (1 - o) + o * e.neuralHidden[c] * e.neuralOutputs[s], -1, 1), m = u * p, h = qt(r, l, m, t), g = q(l.delta * h.forget + m * t, -.8, Me);
		Wt[n] = g, Gt[n] = p, Kt[n] = h.consolidation ?? 0, d += Kt[n], f += Math.abs(g - l.delta);
	}
	let p = Pe * i.length * t + d * Ie * t, m = Math.min(e.energy, p), h = Math.max(0, e.energy - m), g = f * Fe, _ = g > 0 ? Math.min(1, h / g) : 1, v = m + g * _;
	e.energy -= v, n.metabolicDissipation += v;
	for (let e = 0; e < a.length; e++) {
		let t = a[e], n = t.consolidation ?? 0;
		t.delta += (Wt[e] - t.delta) * _, t.eligibility = Gt[e], (r.memoryConsolidationRate ?? 0) > 0 ? t.consolidation = n + (Kt[e] - n) * (Kt[e] > n ? _ : 1) : delete t.consolidation;
	}
	return v;
}
function Xt(e) {
	let t = e.hiddenIds?.length ?? e.biasesH.length, n = e.inputKeys?.length ?? e.weightsIH[0]?.length ?? 0, r = e.outputKeys?.length ?? e.weightsHO.length;
	return t * (n + t + r) - (e.disabledConnections?.length ?? 0);
}
function Zt(e) {
	let t = e.hiddenIds?.length ?? e.biasesH.length;
	if (!Number.isInteger(t) || t < 1 || t > 96 || Xt(e) < 0 || Xt(e) > 65536) throw Error("Invalid hidden neuron or enabled neural edge budget");
}
function Qt(e, t = e) {
	L(e);
	let n = Ft(e), r = t.inputKeys ?? It(t), i = t.outputKeys ?? Lt(t), a = t.hiddenIds ?? Rt(t.biasesH.length), o = e.hiddenIds ?? a;
	if (o.length < 1 || o.length > 96 || new Set(o).size !== o.length) throw Error("Invalid hidden neuron identities");
	let s = new Map(r.map((e, t) => [e, t])), c = new Map(i.map((e, t) => [e, t])), l = new Map(a.map((e, t) => [e, t])), u = t.weightsIH, d = t.weightsHH, f = t.weightsHO, p = t.biasesH, m = t.biasesO, h = t.hiddenTimeConstants ?? a.map(() => 0);
	e.weightsIH = o.map((e) => n.inputs.map((n) => {
		let r = l.get(e), i = s.get(n), a = r === void 0 || i === void 0 ? 0 : u[r]?.[i] ?? 0;
		if (t.brainVersion === void 0 && n.startsWith("joint:") && n.endsWith(":angle")) {
			let e = t.parts.find((e) => n === `joint:${e.id}:angle`);
			a *= e?.maxAngle ?? 1;
		}
		return a;
	})), e.weightsHH = o.map((e) => o.map((t) => {
		let n = l.get(e), r = l.get(t);
		return n === void 0 || r === void 0 ? 0 : d[n]?.[r] ?? 0;
	})), e.biasesH = o.map((e) => {
		let t = l.get(e);
		return t === void 0 ? 0 : p[t] ?? 0;
	}), e.hiddenTimeConstants = o.map((e) => {
		let t = l.get(e);
		return t === void 0 ? 0 : h[t] ?? 0;
	}), e.weightsHO = n.outputs.map((e) => {
		let t = c.get(e);
		return o.map((e) => {
			let n = l.get(e);
			return t === void 0 || n === void 0 ? 0 : f[t]?.[n] ?? 0;
		});
	}), e.biasesO = n.outputs.map((e) => {
		let t = c.get(e);
		return t === void 0 ? 0 : m[t] ?? 0;
	});
	let g = new Set(n.inputs), _ = new Set(n.outputs), v = new Set(o);
	e.disabledConnections = (e.disabledConnections ?? t.disabledConnections ?? []).filter((e) => {
		let t;
		try {
			t = JSON.parse(e);
		} catch {
			return !1;
		}
		if (!Array.isArray(t) || t.length !== 3 || !t.every((e) => typeof e == "string")) return !1;
		let [n, r, i] = t;
		return Q(n, r, i) === e ? n === "ih" ? v.has(r) && g.has(i) : n === "hh" ? v.has(r) && v.has(i) : n === "ho" && _.has(r) && v.has(i) : !1;
	}), e.hiddenIds = [...o], e.inputKeys = n.inputs, e.outputKeys = n.outputs, e.brainVersion = 7, Zt(e);
}
function $t(e) {
	(e.brainVersion !== 7 || !e.inputKeys || !e.outputKeys || !e.hiddenIds || !e.disabledConnections || !e.hiddenTimeConstants) && Qt(e), Zt(e);
}
function en(e) {
	let t = e.genome.brainVersion === void 0, n = e.genome.hiddenIds ?? Rt(e.genome.biasesH.length), r = new Map(n.map((t, n) => [t, e.neuralHidden[n] ?? 0])), i = new Map((e.genome.outputKeys ?? Lt(e.genome)).map((t, n) => [t, e.neuralOutputs[n] ?? 0])), a = e.genome.inputKeys ?? It(e.genome), o = new Map(a.map((t, n) => [t, e.neuralInputs[n] ?? 0]));
	$t(e.genome), e.neuralInputs = e.genome.inputKeys.map((n) => {
		let r = o.get(n) ?? 0;
		if (t && n.startsWith("joint:") && n.endsWith(":angle")) {
			let t = e.genome.parts.find((e) => n === `joint:${e.id}:angle`);
			return q(r / Math.max(.01, t?.maxAngle ?? 1), -1, 1);
		}
		return r;
	}), e.neuralHidden = e.genome.hiddenIds.map((e) => r.get(e) ?? 0), e.neuralOutputs = e.genome.outputKeys.map((e) => i.get(e) ?? 0), e.mouthFeedback ??= {}, e.biteFeedbackJ ??= 0;
	for (let t of e.joints) t.amplitude ??= 1, t.engagement ??= 1;
}
function tn(e, t = 0, n = 0) {
	let r = [];
	for (let i = 0; i < e.length; i++) {
		let a = e[i];
		if (i === 0) {
			r.push({
				x: t,
				y: n,
				vx: 0,
				vy: 0,
				angle: 0,
				angVel: 0
			});
			continue;
		}
		let o = r[a.parentIndex], s = e[a.parentIndex], c = wt(a.attachmentPoint, s.width, s.height), l = At(a.attachmentPoint, a.width, a.height), u = o.angle + a.baseAngleOffset;
		r.push({
			x: o.x + Math.cos(o.angle) * c.x - Math.sin(o.angle) * c.y - Math.cos(u) * l.x + Math.sin(u) * l.y,
			y: o.y + Math.sin(o.angle) * c.x + Math.cos(o.angle) * c.y - Math.sin(u) * l.x - Math.cos(u) * l.y,
			angle: u,
			vx: 0,
			vy: 0,
			angVel: 0
		});
	}
	return r;
}
function nn(e) {
	let t = [];
	if (e.length < 1 || e.length > 7 || e[0]?.parentIndex !== -1) return ["Invalid root or part count"];
	let n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
	for (let i = 0; i < e.length; i++) {
		let a = e[i];
		if (n.has(a.id) && t.push(`Duplicate part ID ${a.id}`), n.add(a.id), [a.dimN, a.dimM].every((e) => Number.isInteger(e) && e >= 1 && e <= 10) || t.push(`Invalid dimensions ${i}`), i === 0) continue;
		if (a.parentIndex < 0 || a.parentIndex >= i) return [...t, `Invalid parent ${i}`];
		let o = e[a.parentIndex], s = `${a.parentIndex}:${a.attachmentPoint}`;
		(r.has(s) || a.parentIndex > 0 && vt(o.attachmentPoint) === a.attachmentPoint) && t.push(`Occupied face ${i}`), r.add(s), bt(a.attachmentPoint, o.dimN, o.dimM, a.dimN, a.dimM) || t.push(`Wide attachment ${i}`);
	}
	let i = tn(e), a = e.map((e, t) => Sn(i[t], e));
	for (let e = 0; e < a.length; e++) for (let n = e + 1; n < a.length; n++) {
		let r = !0;
		for (let t of [a[e], a[n]]) for (let i = 0; i < 4; i++) {
			let o = t[i], s = t[(i + 1) % 4], c = (e) => e.x * (o.y - s.y) + e.y * (s.x - o.x), l = a[e].map(c), u = a[n].map(c);
			Math.min(Math.max(...l), Math.max(...u)) - Math.max(Math.min(...l), Math.min(...u)) <= 1e-7 && (r = !1);
		}
		r && t.push(`Overlapping parts ${e},${n}`);
	}
	return t;
}
function rn(e = new De(9999)) {
	let t = [
		Z("part-0", -1, "EAST", 5, 3, 1.2, 0, 0, 1, 1),
		Z("part-1", 0, "WEST", 6, 2, 1.2, 0, 0, .8, 1),
		Z("part-2", 1, "WEST", 7, 2, 1.2, 0, Math.PI * .5, .8, 1)
	], n = [{
		id: "eye-0",
		partIndex: 0,
		direction: "EAST",
		fov: 2,
		range: 500
	}], r = [{
		id: "mouth-0",
		partIndex: 0,
		direction: "EAST",
		intakeWidth: 21 * .9,
		mouthType: "herbivore"
	}], i = Y(t, n, r), a = X(t, 1), { weightsIH: o, weightsHH: s, biasesH: c, weightsHO: l, biasesO: u } = Pt(e);
	return {
		id: "BENCH-NEMATODE",
		name: "Benchmark Nematode",
		archetype: "Benchmark Nematode",
		generation: 1,
		parentIds: [],
		hue: 195,
		saturation: 90,
		lightness: 55,
		parts: t,
		eyes: n,
		mouths: r,
		motorFrequency: 3,
		motorForce: 3,
		weightsIH: o,
		weightsHH: s,
		biasesH: c,
		weightsHO: l,
		biasesO: u,
		targetClutchSize: 2,
		maturityAge: 20,
		incubationTime: 10,
		eggReserveFraction: .35,
		reproductionThreshold: .6,
		reproductionCooldown: 18,
		maxLifespan: 360,
		metabolicEfficiency: 1.2,
		bodyCost: i,
		storageTraitMultiplier: 1,
		maxEnergyCapacity: a
	};
}
function an(e = 1, t = [], n = V) {
	let r = [], i = [], a = [];
	r.push(Z("part-0", -1, "EAST", 5, 3, 1.2, 0, 0, 1, 1)), a.push({
		id: "mouth-0",
		partIndex: 0,
		direction: "EAST",
		intakeWidth: 19.95,
		mouthType: "herbivore"
	}), i.push({
		id: "eye-0",
		partIndex: 0,
		direction: "EAST",
		fov: 2,
		range: 560
	}), r.push(Z("part-1", 0, "WEST", 6, 2, 1.2, 0, 0, .85, 1)), r.push(Z("part-2", 1, "WEST", 7, 2, 1.2, 0, Math.PI * .5, .95, 1));
	let o = Y(r, i, a), s = X(r, 1), { weightsIH: c, weightsHH: l, biasesH: u, weightsHO: d, biasesO: f } = Pt(n);
	return c[0][1] = .8, c[0][4] = 1.2, c[1][10] = 1.2, c[1][13] = .8, d[0][0] = -.5, d[0][1] = .5, {
		id: `EEL-${n.nextUint32().toString(36).substring(0, 5).toUpperCase()}`,
		name: "Flagellate Eel",
		archetype: "Flagellate Eel",
		generation: e,
		parentIds: t,
		hue: 185,
		saturation: 92,
		lightness: 58,
		parts: r,
		eyes: i,
		mouths: a,
		motorFrequency: 3.2,
		motorForce: 3.2,
		weightsIH: c,
		weightsHH: l,
		biasesH: u,
		weightsHO: d,
		biasesO: f,
		targetClutchSize: 1 + Math.floor(n.nextFloat() * 4),
		maturityAge: n.range(15, 24),
		incubationTime: 10,
		eggReserveFraction: .35,
		reproductionThreshold: .6,
		reproductionCooldown: 18,
		maxLifespan: 340,
		metabolicEfficiency: 1.18,
		bodyCost: o,
		storageTraitMultiplier: 1,
		maxEnergyCapacity: s
	};
}
function on(e = 1, t = [], n = V) {
	let r = [], i = [], a = [];
	r.push(Z("part-0", -1, "EAST", 5, 4, 1.2, 0, 0, 1, 1)), a.push({
		id: "mouth-0",
		partIndex: 0,
		direction: "EAST",
		intakeWidth: 4.2 * 7,
		mouthType: "carnivore"
	}), a.push({
		id: "mouth-1",
		partIndex: 0,
		direction: "NORTH",
		intakeWidth: 21,
		mouthType: "carnivore"
	}), i.push({
		id: "eye-0",
		partIndex: 0,
		direction: "EAST",
		fov: 2.3,
		range: 650
	}), i.push({
		id: "eye-1",
		partIndex: 0,
		direction: "NORTH",
		fov: 1.6,
		range: 500
	}), i.push({
		id: "eye-2",
		partIndex: 0,
		direction: "SOUTH",
		fov: 1.6,
		range: 500
	}), r.push(Z("part-1", 0, "WEST", 6, 2, 1.2, 0, 0, .85, 1)), r.push(Z("part-2", 1, "WEST", 7, 2, 1.2, 0, Math.PI * .5, 1, 1.05));
	let o = Y(r, i, a), s = 1.05, c = X(r, s), { weightsIH: l, weightsHH: u, biasesH: d, weightsHO: f, biasesO: p } = Pt(n);
	return l[0][2] = 1.2, l[0][0] = .9, l[1][14] = 1.2, l[1][12] = .9, f[0][0] = -.6, f[0][1] = .6, {
		id: `PRED-${n.nextUint32().toString(36).substring(0, 5).toUpperCase()}`,
		name: "Apex Hunter",
		archetype: "Apex Hunter",
		generation: e,
		parentIds: t,
		hue: 355,
		saturation: 96,
		lightness: 54,
		parts: r,
		eyes: i,
		mouths: a,
		motorFrequency: 3.4,
		motorForce: 3.5,
		weightsIH: l,
		weightsHH: u,
		biasesH: d,
		weightsHO: f,
		biasesO: p,
		targetClutchSize: 1 + Math.floor(n.nextFloat() * 3),
		maturityAge: n.range(18, 26),
		incubationTime: 12,
		eggReserveFraction: .4,
		reproductionThreshold: .65,
		reproductionCooldown: 20,
		maxLifespan: 380,
		metabolicEfficiency: 1.25,
		bodyCost: o,
		storageTraitMultiplier: s,
		maxEnergyCapacity: c
	};
}
function sn(e = 1, t = [], n = V) {
	let r = [], i = [], a = [];
	r.push(Z("part-0", -1, "EAST", 5, 4, 1.2, 0, 0, 1, 1)), a.push({
		id: "mouth-0",
		partIndex: 0,
		direction: "EAST",
		intakeWidth: 28 * .95,
		mouthType: "herbivore"
	}), i.push({
		id: "eye-0",
		partIndex: 0,
		direction: "EAST",
		fov: 2,
		range: 520
	}), i.push({
		id: "eye-1",
		partIndex: 0,
		direction: "NORTH",
		fov: 1.5,
		range: 460
	}), i.push({
		id: "eye-2",
		partIndex: 0,
		direction: "SOUTH",
		fov: 1.5,
		range: 460
	}), r.push(Z("part-1", 0, "NORTH", 6, 2, 1.2, -Math.PI / 2, 0, .85, 1)), r.push(Z("part-2", 0, "SOUTH", 6, 2, 1.2, Math.PI / 2, Math.PI, .85, 1)), r.push(Z("part-3", 0, "WEST", 5, 2, 1.2, 0, Math.PI * .5, .8, 1));
	let o = Y(r, i, a), s = X(r, 1), { weightsIH: c, weightsHH: l, biasesH: u, weightsHO: d, biasesO: f } = Pt(n);
	return {
		id: `MAN-${n.nextUint32().toString(36).substring(0, 5).toUpperCase()}`,
		name: "Manta Flapper",
		archetype: "Manta Flapper",
		generation: e,
		parentIds: t,
		hue: 215,
		saturation: 90,
		lightness: 60,
		parts: r,
		eyes: i,
		mouths: a,
		motorFrequency: 3,
		motorForce: 3,
		weightsIH: c,
		weightsHH: l,
		biasesH: u,
		weightsHO: d,
		biasesO: f,
		targetClutchSize: 1 + Math.floor(n.nextFloat() * 4),
		maturityAge: n.range(16, 24),
		incubationTime: 11,
		eggReserveFraction: .35,
		reproductionThreshold: .6,
		reproductionCooldown: 18,
		maxLifespan: 360,
		metabolicEfficiency: 1.18,
		bodyCost: o,
		storageTraitMultiplier: 1,
		maxEnergyCapacity: s
	};
}
function cn(e = 1, t = [], n = V) {
	let r = [], i = [], a = [];
	r.push(Z("part-0", -1, "EAST", 5, 4, 1.2, 0, 0, 1, 1)), a.push({
		id: "mouth-0",
		partIndex: 0,
		direction: "EAST",
		intakeWidth: 28 * .95,
		mouthType: "herbivore"
	}), i.push({
		id: "eye-0",
		partIndex: 0,
		direction: "EAST",
		fov: 2.2,
		range: 550
	}), r.push(Z("part-1", 0, "WEST", 6, 2, 1.2, 0, 0, .8, 1)), r.push(Z("part-2", 1, "WEST", 7, 2, 1.2, 0, Math.PI * .5, .9, 1));
	let o = Y(r, i, a), s = X(r, 1), { weightsIH: c, weightsHH: l, biasesH: u, weightsHO: d, biasesO: f } = Pt(n);
	return {
		id: `TAD-${n.nextUint32().toString(36).substring(0, 5).toUpperCase()}`,
		name: "Paddle Tadpole",
		archetype: "Paddle Tadpole",
		generation: e,
		parentIds: t,
		hue: 45,
		saturation: 90,
		lightness: 54,
		parts: r,
		eyes: i,
		mouths: a,
		motorFrequency: 3.2,
		motorForce: 3,
		weightsIH: c,
		weightsHH: l,
		biasesH: u,
		weightsHO: d,
		biasesO: f,
		targetClutchSize: 1 + Math.floor(n.nextFloat() * 4),
		maturityAge: n.range(14, 22),
		incubationTime: 9,
		eggReserveFraction: .35,
		reproductionThreshold: .6,
		reproductionCooldown: 16,
		maxLifespan: 330,
		metabolicEfficiency: 1.22,
		bodyCost: o,
		storageTraitMultiplier: 1,
		maxEnergyCapacity: s
	};
}
function ln(e = 1, t = [], n = V) {
	let r = [], i = [], a = [];
	r.push(Z("part-0", -1, "EAST", 5, 4, 1.2, 0, 0, 1, 1)), a.push({
		id: "mouth-0",
		partIndex: 0,
		direction: "EAST",
		intakeWidth: 24.5,
		mouthType: "omnivore"
	}), i.push({
		id: "eye-0",
		partIndex: 0,
		direction: "EAST",
		fov: 2.2,
		range: 560
	}), i.push({
		id: "eye-1",
		partIndex: 0,
		direction: "NORTH",
		fov: 1.6,
		range: 480
	}), i.push({
		id: "eye-2",
		partIndex: 0,
		direction: "SOUTH",
		fov: 1.6,
		range: 480
	}), r.push(Z("part-1", 0, "WEST", 6, 2, 1.2, 0, 0, .8, 1)), r.push(Z("part-2", 0, "NORTH", 5, 2, 1.2, -Math.PI / 2, .2, .8, 1)), r.push(Z("part-3", 0, "SOUTH", 5, 2, 1.2, Math.PI / 2, .2, .8, 1));
	let o = Y(r, i, a), s = X(r, 1), { weightsIH: c, weightsHH: l, biasesH: u, weightsHO: d, biasesO: f } = Pt(n);
	return {
		id: `GLI-${n.nextUint32().toString(36).substring(0, 5).toUpperCase()}`,
		name: "Hydrofoil Glider",
		archetype: "Hydrofoil Glider",
		generation: e,
		parentIds: t,
		hue: 285,
		saturation: 90,
		lightness: 60,
		parts: r,
		eyes: i,
		mouths: a,
		motorFrequency: 3,
		motorForce: 3,
		weightsIH: c,
		weightsHH: l,
		biasesH: u,
		weightsHO: d,
		biasesO: f,
		targetClutchSize: 1 + Math.floor(n.nextFloat() * 4),
		maturityAge: n.range(16, 24),
		incubationTime: 10.5,
		eggReserveFraction: .38,
		reproductionThreshold: .6,
		reproductionCooldown: 18,
		maxLifespan: 350,
		metabolicEfficiency: 1.2,
		bodyCost: o,
		storageTraitMultiplier: 1,
		maxEnergyCapacity: s
	};
}
function un(e = 1, t = [], n = V) {
	let r = [], i = [], a = [], o = n.rangeInt(4, 6), s = n.rangeInt(3, 5);
	r.push(Z("part-0", -1, "EAST", o, s, 1.2, 0, 0, 1, 1)), a.push({
		id: "mouth-0",
		partIndex: 0,
		direction: "EAST",
		intakeWidth: s * 7 * .85,
		mouthType: [
			"herbivore",
			"carnivore",
			"omnivore"
		][n.rangeInt(0, 2)]
	}), i.push({
		id: "eye-0",
		partIndex: 0,
		direction: "EAST",
		fov: n.range(1.6, 2.3),
		range: n.range(480, 620)
	});
	let c = n.rangeInt(2, 3);
	for (let e = 1; e <= c; e++) {
		let t = r[e - 1], i = xt("WEST", t.dimN, t.dimM, n);
		r.push(Z(`part-${e}`, e - 1, "WEST", i.dimN, i.dimM, 1.2, 0, (e - 1) * Math.PI * .5, .8, 1));
	}
	let l = Y(r, i, a), u = n.range(.85, 1.25), d = X(r, u), { weightsIH: f, weightsHH: p, biasesH: m, weightsHO: h, biasesO: g } = Pt(n), _ = a.some((e) => e.mouthType === "carnivore"), v = a.some((e) => e.mouthType === "omnivore"), y = n.range(0, 360);
	return {
		id: `GEN-${n.nextUint32().toString(36).substring(0, 5).toUpperCase()}`,
		name: _ ? "Predator Morph" : v ? "Omnivore Morph" : "Grazer Morph",
		archetype: _ ? "Predator Morph" : v ? "Omnivore Morph" : "Grazer Morph",
		generation: e,
		parentIds: t,
		hue: y,
		saturation: n.range(82, 98),
		lightness: n.range(52, 65),
		parts: r,
		eyes: i,
		mouths: a,
		motorFrequency: n.range(2.8, 3.4),
		motorForce: n.range(2.8, 3.4),
		weightsIH: f,
		weightsHH: p,
		biasesH: m,
		weightsHO: h,
		biasesO: g,
		targetClutchSize: 1 + Math.floor(n.nextFloat() * 4),
		maturityAge: n.range(14, 26),
		incubationTime: n.range(8, 13),
		eggReserveFraction: n.range(.3, .45),
		reproductionThreshold: n.range(.55, .7),
		reproductionCooldown: n.range(15, 22),
		maxLifespan: n.range(280, 420),
		metabolicEfficiency: n.range(1, 1.28),
		bodyCost: l,
		storageTraitMultiplier: u,
		maxEnergyCapacity: d
	};
}
function dn(e) {
	for (let t of e.slice(1)) Math.abs(Math.abs(t.baseAngleOffset) - Math.PI / 2) < 1e-7 && ([t.dimN, t.dimM] = [t.dimM, t.dimN], [t.width, t.height] = [t.height, t.width], t.baseAngleOffset = 0);
}
function fn(e, t = 1, n = [], r = V) {
	let i;
	switch (e) {
		case "eel":
			i = an(t, n, r);
			break;
		case "flapper":
			i = sn(t, n, r);
			break;
		case "tadpole":
			i = cn(t, n, r);
			break;
		case "glider":
			i = ln(t, n, r);
			break;
		case "predator":
			i = on(t, n, r);
			break;
		case "nematode":
			i = rn();
			break;
		default: i = un(t, n, r);
	}
	return (e === "flapper" || e === "glider") && dn(i.parts), Ot(i), i.anatomyVersion = 1, i;
}
function pn(e, t, n, r) {
	let i = t === "ho" ? e.outputKeys[n] : e.hiddenIds[n], a = t === "ih" ? e.inputKeys[r] : e.hiddenIds[r], o = t === "ih" ? e.weightsIH[n][r] : t === "hh" ? e.weightsHH[n][r] : e.weightsHO[n][r];
	return {
		kind: t,
		target: n,
		source: r,
		key: Q(t, i, a),
		weight: o
	};
}
function mn(e, t, n) {
	t.kind === "ih" ? e.weightsIH[t.target][t.source] = n : t.kind === "hh" ? e.weightsHH[t.target][t.source] = n : e.weightsHO[t.target][t.source] = n;
}
function hn(e, t) {
	let n;
	try {
		n = JSON.parse(t);
	} catch {
		return null;
	}
	if (!Array.isArray(n) || n.length !== 3) return null;
	let [r, i, a] = n;
	if (r !== "ih" && r !== "hh" && r !== "ho") return null;
	let o = (r === "ho" ? e.outputKeys : e.hiddenIds).indexOf(i), s = (r === "ih" ? e.inputKeys : e.hiddenIds).indexOf(a);
	return o < 0 || s < 0 ? null : pn(e, r, o, s);
}
function gn(e, t, n = V) {
	$t(e), L(e);
	let r = e.hiddenIds.length, i = e.inputKeys.length, a = e.outputKeys.length, o = new Set(e.disabledConnections);
	if (t === "add-neuron") {
		let t = i + a + 2 * r - 1;
		if (r >= 96 || !i || !a || Xt(e) + 2 > 65536 || e.disabledConnections.length + t > 65536) return !1;
		let s = structuredClone(e), c;
		do
			c = `hidden:mut-${n.nextUint32().toString(36)}`;
		while (e.hiddenIds.includes(c));
		e.hiddenIds = [...e.hiddenIds, c];
		for (let t of e.inputKeys) o.add(Q("ih", c, t));
		for (let t of e.hiddenIds) o.add(Q("hh", c, t)), o.add(Q("hh", t, c));
		for (let t of e.outputKeys) o.add(Q("ho", t, c));
		e.disabledConnections = [...o], Qt(e, s);
		let l = n.rangeInt(0, i - 1), u = n.rangeInt(0, a - 1);
		return e.disabledConnections = e.disabledConnections.filter((t) => t !== Q("ih", c, e.inputKeys[l]) && t !== Q("ho", e.outputKeys[u], c)), e.weightsIH[r][l] = n.range(-.04, .04), e.weightsHO[u][r] = n.range(-.04, .04), !0;
	}
	if (t === "wire-injury-motor") {
		let t = e.inputKeys.indexOf("body:injury");
		if (t < 0 || e.parts.length < 2 || r >= 96 || Xt(e) + e.parts.length > 65536 || !gn(e, "add-neuron", n)) return !1;
		let i = e.hiddenIds.length - 1, a = e.hiddenIds[i], o = [
			"Angle",
			"Drive",
			"Torque",
			"Stiff",
			"Amp",
			"Engage"
		], s = o[n.rangeInt(0, o.length - 1)], c = e.outputKeys.map((e, t) => e.endsWith(":" + s) ? t : -1).filter((e) => e >= 0), l = new Set(e.disabledConnections), u = (n.nextFloat() < .5 ? -1 : 1) * n.range(.4, 3), d = (n.nextFloat() < .5 ? -1 : 1) * n.range(.4, 3);
		for (let n = 0; n < e.inputKeys.length; n++) {
			let r = Q("ih", a, e.inputKeys[n]);
			e.weightsIH[i][n] = n === t ? u : 0, n === t ? l.delete(r) : l.add(r);
		}
		for (let t = 0; t < e.outputKeys.length; t++) {
			let n = Q("ho", e.outputKeys[t], a), r = c.includes(t);
			e.weightsHO[t][i] = r ? d : 0, r ? l.delete(n) : l.add(n);
		}
		return e.disabledConnections = [...l], Zt(e), !0;
	}
	if (t === "wire-retinal-turn") {
		if (!e.eyes.length || e.parts.length < 2 || r >= 96 || Xt(e) + 5 + e.parts.length > 65536 || !gn(e, "add-neuron", n)) return !1;
		let t = e.hiddenIds.length - 1, i = e.hiddenIds[t], a = e.eyes[n.rangeInt(0, e.eyes.length - 1)], o = [
			"red",
			"green",
			"blue"
		][n.rangeInt(0, 2)], s = n.range(1, 4) * (n.nextFloat() < .5 ? -1 : 1), c = n.range(1, 4) * (n.nextFloat() < .5 ? -1 : 1), l = new Set(e.disabledConnections);
		for (let n = 0; n < e.inputKeys.length; n++) {
			let r = e.inputKeys[n], c = Q("ih", i, r), u = 0;
			for (let e = 0; e < 5; e++) if (r === `eye:${a.id}:ray:${e}:${o}`) {
				let t = (e / 4 - .5) * a.fov;
				u = Math.sin(t) * s;
				break;
			}
			e.weightsIH[t][n] = u, Math.abs(u) > 1e-12 ? l.delete(c) : l.add(c);
		}
		for (let n = 0; n < e.outputKeys.length; n++) {
			let r = e.outputKeys[n], a = Q("ho", r, i), o = r.endsWith(":Angle");
			e.weightsHO[n][t] = o ? c : 0, o ? l.delete(a) : l.add(a);
		}
		return e.disabledConnections = [...l], Zt(e), !0;
	}
	if (t === "remove-neuron") {
		if (r <= 1) return !1;
		let t = 0, n = Infinity;
		for (let i = 0; i < r; i++) {
			let s = 0;
			for (let t = 0; t < a; t++) {
				let n = pn(e, "ho", t, i);
				o.has(n.key) || (s += Math.abs(n.weight));
			}
			for (let t = 0; t < r; t++) {
				let n = pn(e, "hh", t, i);
				o.has(n.key) || (s += Math.abs(n.weight));
			}
			s < n && (t = i, n = s);
		}
		let i = structuredClone(e);
		return e.hiddenIds = e.hiddenIds.filter((e, n) => n !== t), Qt(e, i), !0;
	}
	let s = () => {
		let t = e.disabledConnections;
		if (!t.length) return null;
		for (let r = 0; r < 48; r++) {
			let r = hn(e, t[n.rangeInt(0, t.length - 1)]);
			if (r && Math.abs(r.weight) <= .12) return r;
		}
		return null;
	}, c = () => {
		for (let t = 0; t < 96; t++) {
			let t = [
				"ih",
				"hh",
				"ho"
			][n.rangeInt(0, 2)], s = t === "ho" ? a : r, c = t === "ih" ? i : r;
			if (!s || !c) continue;
			let l = pn(e, t, n.rangeInt(0, s - 1), n.rangeInt(0, c - 1));
			if (!o.has(l.key) && Math.abs(l.weight) <= .12) return l;
		}
		return null;
	};
	if (t === "enable-connection" || t === "reconnect") {
		let r = s();
		if (!r) return !1;
		let i = t === "reconnect" ? c() : null;
		return t === "reconnect" && !i || !i && Xt(e) >= 65536 ? !1 : (o.delete(r.key), i && o.add(i.key), Math.abs(r.weight) < 1e-12 && mn(e, r, n.range(-.04, .04)), e.disabledConnections = [...o], !0);
	}
	if (t === "disable-connection" || t === "prune-connection") {
		let n = c();
		return n ? (o.add(n.key), t === "prune-connection" && mn(e, n, 0), e.disabledConnections = [...o], !0) : !1;
	}
	return !1;
}
function _n(e, t = .25, n = V, r) {
	let i = q(t, 0, 1), a = i * 1.2;
	if (i === 0) return {
		...structuredClone(e),
		id: `GEN-${n.nextUint32().toString(36).toUpperCase()}`,
		generation: e.generation + 1,
		parentIds: [e.id]
	};
	if (e = structuredClone(e), e.anatomyVersion === void 0 && nn(e.parts).length > 0) {
		let t = e.parts.map((e) => ({ ...e }));
		dn(t), nn(t).length === 0 && (e = {
			...e,
			parts: t
		});
	}
	$t(e);
	let o = (e, t, r, o) => n.nextFloat() < i ? q(e + n.range(-t, t) * a, r, o) : e, s = e.parts.map((e) => ({ ...e }));
	if (n.nextFloat() < i * .25 && s.length < 7) {
		let e = n.rangeInt(0, s.length - 1), t = s[e], r = [
			"WEST",
			"NORTH",
			"SOUTH",
			"EAST"
		], i = r[n.rangeInt(0, r.length - 1)], a = xt(i, t.dimN, t.dimM, n);
		bt(i, t.dimN, t.dimM, a.dimN, a.dimM) && s.push(Z(`part-${n.nextUint32().toString(36)}`, e, i, a.dimN, a.dimM, 2, 0, n.range(0, Math.PI * 2), 1.2, 1));
	} else if (n.nextFloat() < i * .15 && s.length > 2) {
		let e = (e) => !s.some((t) => t.parentIndex === e), t = s.map((e, t) => t).filter((t) => t > 0 && e(t));
		if (t.length > 0) {
			let e = t[t.length - 1];
			s.splice(e, 1), s = s.map((t) => ({
				...t,
				parentIndex: t.parentIndex >= e ? Math.max(0, t.parentIndex - 1) : t.parentIndex
			}));
		}
	}
	if (s.length > 1 && n.nextFloat() < i * .15) {
		let e = n.rangeInt(1, s.length - 1), t = s.map((e) => ({ ...e }));
		t[e].parentIndex = n.rangeInt(0, e - 1), t[e].attachmentPoint = [
			"NORTH",
			"SOUTH",
			"EAST",
			"WEST"
		][n.rangeInt(0, 3)], t[e].baseAngleOffset = 0, nn(t).length === 0 && (s = t);
	}
	nn(s).length && (s = e.parts.map((e) => ({ ...e })));
	for (let e = 0; e < s.length; e++) {
		let t = s[e], r = t.dimN, c = t.dimM, l = !1;
		if (n.nextFloat() < i && (r = q(r + (n.nextFloat() < .5 ? -1 : 1), 1, 10), l = !0), n.nextFloat() < i && (c = q(c + (n.nextFloat() < .5 ? -1 : 1), 1, 10), l = !0), l) {
			let n = !0;
			if (e > 0) {
				let i = Math.max(0, Math.min(e - 1, t.parentIndex)), a = s[i];
				bt(t.attachmentPoint, a.dimN, a.dimM, r, c) || (n = !1);
			}
			n &&= nn(s.map((t, n) => n === e ? {
				...t,
				dimN: r,
				dimM: c,
				width: r * 7,
				height: c * 7
			} : t)).length === 0, n && (t.dimN = r, t.dimM = c, t.width = r * 7, t.height = c * 7);
		}
		t.maxAngle = o(t.maxAngle, .2, .6, 2.35), n.nextFloat() < i && (t.cpgPhaseOffset = (t.cpgPhaseOffset + n.range(-.4, .4) * a + Math.PI * 2) % (Math.PI * 2)), t.cpgAmp = o(t.cpgAmp, .2, .1, 2.6), t.cpgFreqMult = o(t.cpgFreqMult, .2, .5, 2.5);
	}
	let c = (4 * s.length - 2 * (s.length - 1)) * 3;
	e.eyes.length + e.mouths.length > c && (s = e.parts.map((e) => ({ ...e })));
	let l = (t) => {
		let n = t;
		for (; n >= 0;) {
			let t = s.findIndex((t) => t.id === e.parts[n]?.id);
			if (t >= 0) return t;
			n = e.parts[n]?.parentIndex ?? -1;
		}
		return 0;
	}, u = e.eyes.map((e) => ({
		...e,
		partIndex: l(e.partIndex),
		fov: o(e.fov, .2, .8, 2.4),
		range: o(e.range, 30, 280, 680)
	})), d = e.mouths.map((e) => ({
		...e,
		partIndex: l(e.partIndex)
	}));
	if (Ot({
		parts: s,
		eyes: u,
		mouths: d
	}), n.nextFloat() < i * .25 && u.length + e.mouths.length < 84) {
		let e = Et({
			parts: s,
			eyes: u,
			mouths: d
		}), t = e.length ? e[n.rangeInt(0, e.length - 1)] : null;
		t && u.push({
			id: `eye-${n.nextUint32().toString(36)}`,
			...t,
			fov: n.range(1.5, 2.3),
			range: n.range(450, 620)
		});
	} else n.nextFloat() < i * .15 && u.length > 1 && u.pop();
	let f = [
		"herbivore",
		"carnivore",
		"omnivore"
	], p = d.map((e) => {
		let t = e.mouthType || "herbivore";
		if (n.nextFloat() < i * .18) {
			let e = f.filter((e) => e !== t);
			t = e[n.rangeInt(0, e.length - 1)];
		}
		return {
			...e,
			mouthType: t,
			intakeLength: Math.max(t === "carnivore" ? 9 : t === "omnivore" ? 8 : 7, o(e.intakeLength ?? e.intakeWidth, 2, 3, 38)),
			intakeWidth: t === "carnivore" ? 9 : t === "omnivore" ? 8 : 7
		};
	});
	if (n.nextFloat() < i * .2 && u.length + p.length < 84) {
		let e = Et({
			parts: s,
			eyes: u,
			mouths: p
		}), t = e.length ? e[n.rangeInt(0, e.length - 1)] : null, r = f[n.rangeInt(0, f.length - 1)];
		t && p.push({
			id: `mouth-${n.nextUint32().toString(36)}`,
			...t,
			intakeLength: n.range(14, 28),
			intakeWidth: r === "carnivore" ? 9 : r === "omnivore" ? 8 : 7,
			mouthType: r
		});
	} else n.nextFloat() < i * .12 && p.length > 1 && p.pop();
	Ot({
		parts: s,
		eyes: u,
		mouths: p
	});
	let m = new Set(e.disabledConnections), h = e.weightsIH.map((t, r) => t.map((t, o) => m.has(Q("ih", e.hiddenIds[r], e.inputKeys[o])) ? t : n.nextFloat() < i ? q(t + n.range(-.3, .3) * a, -3.5, 3.5) : t)), g = e.weightsHH.map((t, r) => t.map((t, o) => m.has(Q("hh", e.hiddenIds[r], e.hiddenIds[o])) ? t : n.nextFloat() < i ? q(t + n.range(-.25, .25) * a, -3, 3) : t)), _ = e.biasesH.map((e) => n.nextFloat() < i ? q(e + n.range(-.15, .15) * a, -1.5, 1.5) : e), v = e.weightsHO.map((t, r) => t.map((t, o) => m.has(Q("ho", e.outputKeys[r], e.hiddenIds[o])) ? t : n.nextFloat() < i ? q(t + n.range(-.3, .3) * a, -3.5, 3.5) : t)), y = e.biasesO.map((e) => n.nextFloat() < i ? q(e + n.range(-.15, .15) * a, -1.5, 1.5) : e), b = q((e.storageTraitMultiplier || 1) + (n.nextFloat() < i ? n.range(-.1, .1) * a : 0), .8, 2), x = Y(s, u, p), S = X(s, b), C = i * (e.colorMutationRate ?? 1), w = (e) => n.nextFloat() < C ? q(e + n.range(-4, 4) * a, 0, 100) : e, T = n.nextFloat() < C ? ct(e.hue + n.range(-20, 20) * a) : e.hue, E = w(e.saturation), D = w(e.lightness), O = o(e.colorMutationRate ?? 1, .1, 0, 1), k = e.targetClutchSize || 2;
	if (n.nextFloat() < i) {
		let e = n.nextFloat() < .5 ? -1 : 1;
		k = q(k + e, 1, 6);
	}
	let A = e.maturityAge || 20;
	if (n.nextFloat() < i) {
		let e = n.range(-3, 3) * a;
		A = q(A + e, 10, 45);
	}
	let j = {
		anatomyVersion: 1,
		id: `GEN-${n.nextUint32().toString(36).substring(0, 5).toUpperCase()}`,
		name: e.name,
		archetype: e.archetype,
		generation: e.generation + 1,
		parentIds: [e.id],
		hue: T,
		saturation: E,
		lightness: D,
		colorMutationRate: O,
		parts: s,
		eyes: u,
		mouths: p,
		motorFrequency: o(e.motorFrequency, .3, .1, 5.2),
		motorForce: o(e.motorForce, .5, 0, 19.5),
		weightsIH: h,
		weightsHH: g,
		biasesH: _,
		weightsHO: v,
		biasesO: y,
		hiddenIds: [...e.hiddenIds],
		plasticityRate: e.plasticityRate,
		forgettingRate: e.forgettingRate,
		plasticMotorScope: e.plasticMotorScope,
		injuryAversionRate: e.injuryAversionRate,
		sensoryPlasticityRate: e.sensoryPlasticityRate,
		memoryConsolidationRate: e.memoryConsolidationRate,
		disabledConnections: [...e.disabledConnections ?? []],
		targetClutchSize: k,
		maturityAge: A,
		incubationTime: o(e.incubationTime, 1, 5, 20),
		eggReserveFraction: o(e.eggReserveFraction, .05, .2, .55),
		reproductionThreshold: (() => {
			let t = o(e.reproductionThreshold, .04, .5, .8);
			return te(r) ? e.reproductionThreshold : t;
		})(),
		reproductionCooldown: o(e.reproductionCooldown, 1, 12, 25),
		maxLifespan: o(e.maxLifespan, 20, 220, 550),
		metabolicEfficiency: o(e.metabolicEfficiency, .05, .85, 1.35),
		bodyCost: x,
		storageTraitMultiplier: b,
		maxEnergyCapacity: S
	}, M = {
		...e,
		weightsIH: h,
		weightsHH: g,
		biasesH: _,
		weightsHO: v,
		biasesO: y
	};
	try {
		Qt(j, M);
	} catch (t) {
		if (!(t instanceof Error) || !t.message.includes("edge budget")) throw t;
		j.parts = structuredClone(e.parts), j.eyes = structuredClone(e.eyes), j.mouths = structuredClone(e.mouths), j.bodyCost = Y(j.parts, j.eyes, j.mouths), j.maxEnergyCapacity = X(j.parts, j.storageTraitMultiplier), Qt(j, M);
	}
	if (n.nextFloat() < i * .16) {
		let e = [
			"add-neuron",
			"remove-neuron",
			"enable-connection",
			"disable-connection",
			"prune-connection",
			"reconnect",
			"wire-injury-motor",
			"wire-retinal-turn"
		];
		gn(j, e[n.rangeInt(0, e.length - 1)], n);
	}
	if (n.nextFloat() < i * .22) {
		let e = n.rangeInt(0, j.hiddenTimeConstants.length - 1), t = j.hiddenTimeConstants[e], r = n.range(-.3, .45) * a;
		j.hiddenTimeConstants[e] = q(t === 0 ? Math.max(0, r) : t + r, 0, 4);
	}
	for (let e of j.parts.slice(1)) if (n.nextFloat() < i * .32 && (e.oscillatorMix = q((e.oscillatorMix ?? 1) + n.range(-.7, .35) * a, 0, 1)), n.nextFloat() < i * .24) {
		let t = [...e.waveHarmonics ?? [
			0,
			0,
			0,
			0
		]], r = n.rangeInt(0, 3);
		t[r] = q(t[r] + n.range(-.6, .6) * a, -1, 1), e.waveHarmonics = t;
	}
	for (let e of j.eyes) if (n.nextFloat() < i * .55) {
		let t = [...e.spectralSensitivity ?? [
			1,
			1,
			1
		]], r = n.rangeInt(0, 2);
		t[r] = n.nextFloat() < .15 ? t[r] === 0 ? n.range(.1, .5) : 0 : q(t[r] + n.range(-.85, .35) * a, 0, 1), e.spectralSensitivity = t;
	}
	return n.nextFloat() < i * .12 && (j.plasticityRate = q((j.plasticityRate ?? 0) + n.range(-.15, .25) * a, 0, .8), j.plasticityRate > 0 && j.forgettingRate === void 0 && (j.forgettingRate = .1)), (j.plasticityRate ?? 0) > 0 && n.nextFloat() < i * .1 && (j.forgettingRate = q((j.forgettingRate ?? .1) + n.range(-.05, .05) * a, 0, 1)), (j.plasticityRate ?? 0) > 0 && (n.nextFloat() < i * .1 && (j.plasticMotorScope = (j.plasticMotorScope ?? "angle") === "all" ? "angle" : "all"), n.nextFloat() < i * .12 && (j.injuryAversionRate = q((j.injuryAversionRate ?? 0) + n.range(-.15, .3) * a, 0, 1))), n.nextFloat() < i * .12 && (j.sensoryPlasticityRate = q((j.sensoryPlasticityRate ?? 0) + n.range(-.15, .25) * a, 0, .8)), ((j.plasticityRate ?? 0) > 0 || (j.sensoryPlasticityRate ?? 0) > 0) && n.nextFloat() < i * .12 && (j.memoryConsolidationRate = q((j.memoryConsolidationRate ?? 0) + n.range(-.3, .65) * a, 0, 2)), j;
}
function vn(e, t, n, r = 0, i, a, o = V) {
	$t(e);
	let s = [], c = [], l = e.parts.length;
	s.push({
		x: t,
		y: n,
		vx: 0,
		vy: 0,
		angle: isNaN(r) ? 0 : r,
		angVel: 0
	});
	for (let r = 1; r < l; r++) {
		let i = e.parts[r], a = Math.max(0, Math.min(r - 1, i.parentIndex)), o = s[a], l = e.parts[a], u = Math.cos(o.angle), d = Math.sin(o.angle), f = wt(i.attachmentPoint, l.width, l.height), p = o.x + u * f.x - d * f.y, m = o.y + d * f.x + u * f.y, h = o.angle + (i.baseAngleOffset || 0), g = Math.cos(h), _ = Math.sin(h), v = At(i.attachmentPoint, i.width, i.height), y = p - (g * v.x - _ * v.y), b = m - (_ * v.x + g * v.y);
		s.push({
			x: isNaN(y) ? t : y,
			y: isNaN(b) ? n : b,
			vx: 0,
			vy: 0,
			angle: isNaN(h) ? 0 : h,
			angVel: 0
		}), c.push({
			phase: i.cpgPhaseOffset || 0,
			targetAngle: 0,
			currentRelAngle: 0,
			currentRelAngVel: 0,
			appliedTorque: 0,
			stiffness: 1,
			amplitude: 1,
			engagement: 1
		});
	}
	let u = a === void 0 ? e.generation === 1 ? Be : Math.max(1e3, e.maxEnergyCapacity * .15) : Math.max(0, a);
	return {
		id: `ORG-${o.nextUint32().toString(36)}-${o.nextUint32().toString(36)}`,
		clutchId: i,
		genome: e,
		segments: s,
		joints: c,
		energy: u,
		structuralBiomass: e.bodyCost,
		basalEnergyRate: 0,
		sensoryEnergyRate: 0,
		motorEnergyRate: 0,
		totalEnergyRate: 0,
		age: 0,
		maxLifespan: e.maxLifespan || 340,
		foodEaten: 0,
		preyEaten: 0,
		eggsPredated: 0,
		offspringCount: 0,
		clutchesLaid: 0,
		isGravid: !1,
		lastReproductionAge: 0,
		lastReproductionTime: 0,
		distanceTraveled: 0,
		speed: 0,
		neuralInputs: Array(e.inputKeys.length).fill(0),
		neuralHidden: Array(e.hiddenIds.length).fill(0),
		neuralOutputs: Array(e.outputKeys.length).fill(0),
		rayHits: [],
		glowPulse: 0,
		dissolving: !1,
		dissolveAlpha: 1,
		isFeedingHighlight: 0,
		traceHistory: [],
		recentFeedings: [],
		mouthFeedback: {},
		biteFeedbackJ: 0
	};
}
function yn(e) {
	let t = 0, n = 0, r = 0, i = 0, a = 0;
	for (let o = 0; o < e.segments.length; o++) {
		let s = e.genome.parts[o], c = Math.max(.35, s.dimN * s.dimM * H);
		t += c, n += e.segments[o].x * c, r += e.segments[o].y * c, i += e.segments[o].vx * c, a += e.segments[o].vy * c;
	}
	return {
		x: t > 0 ? n / t : e.segments[0].x,
		y: t > 0 ? r / t : e.segments[0].y,
		totalMass: t,
		vxCOM: t > 0 ? i / t : 0,
		vyCOM: t > 0 ? a / t : 0
	};
}
function bn(e, t, n, r, i, a, o, s) {
	let c = (e - n) * (a - s) - (t - r) * (i - o);
	if (Math.abs(c) < 1e-6) return {
		hit: !1,
		t: 0,
		u: 0,
		x: 0,
		y: 0
	};
	let l = ((e - i) * (a - s) - (t - a) * (i - o)) / c, u = -((e - n) * (t - a) - (t - r) * (e - i)) / c;
	return l >= 0 && l <= 1 && u >= 0 && u <= 1 ? {
		hit: !0,
		t: l,
		u,
		x: e + l * (n - e),
		y: t + l * (r - t)
	} : {
		hit: !1,
		t: 0,
		u: 0,
		x: 0,
		y: 0
	};
}
function xn(e, t, n, r, i, a, o, s) {
	let c = e - a, l = t - o, u = c * n + l * r, d = c * c + l * l - s * s, f = u * u - d;
	if (f < 0) return {
		hit: !1,
		dist: 0,
		pointX: 0,
		pointY: 0
	};
	let p = Math.sqrt(f), m = -u - p;
	return m < 0 && (m = -u + p), m >= 0 && m <= i ? {
		hit: !0,
		dist: m,
		pointX: e + n * m,
		pointY: t + r * m
	} : {
		hit: !1,
		dist: 0,
		pointX: 0,
		pointY: 0
	};
}
function Sn(e, t) {
	let n = t.width * .5, r = t.height * .5, i = Math.cos(e.angle), a = Math.sin(e.angle);
	return [
		{
			x: e.x + i * n - a * r,
			y: e.y + a * n + i * r
		},
		{
			x: e.x - i * n - a * r,
			y: e.y - a * n + i * r
		},
		{
			x: e.x - i * n + a * r,
			y: e.y - a * n - i * r
		},
		{
			x: e.x + i * n + a * r,
			y: e.y + a * n - i * r
		}
	];
}
function Cn(e, t, n, r, i, a, o, s, c) {
	let l = e - s.x, u = t - s.y, d = Math.cos(s.angle), f = Math.sin(s.angle), p = d * l + f * u, m = -f * l + d * u;
	if (Math.abs(p) <= c.width * .5 && Math.abs(m) <= c.height * .5) return !0;
	let h = Sn(s, c);
	for (let s = 0; s < 4; s++) {
		let c = h[s], l = h[(s + 1) % 4];
		if (bn(n, r, i, a, c.x, c.y, l.x, l.y).hit || wn(e, t, c.x, c.y, l.x, l.y) <= o) return !0;
	}
	return !1;
}
function wn(e, t, n, r, i, a) {
	let o = i - n, s = a - r, c = o * o + s * s;
	if (c === 0) return Math.hypot(e - n, t - r);
	let l = q(((e - n) * o + (t - r) * s) / c, 0, 1), u = n + l * o, d = r + l * s;
	return Math.hypot(e - u, t - d);
}
function Tn(e, t, n) {
	e = e % 360 / 360, t /= 100, n /= 100;
	let r, i, a;
	if (t === 0) r = i = a = n;
	else {
		let o = (e, t, n) => (n < 0 && (n += 1), n > 1 && --n, n < 1 / 6 ? e + (t - e) * 6 * n : n < 1 / 2 ? t : n < 2 / 3 ? e + (t - e) * (2 / 3 - n) * 6 : e), s = n < .5 ? n * (1 + t) : n + t - n * t, c = 2 * n - s;
		r = o(c, s, e + 1 / 3), i = o(c, s, e), a = o(c, s, e - 1 / 3);
	}
	return [
		r,
		i,
		a
	];
}
var En = Array.from({ length: 6 }, () => ({
	aim: 0,
	bim: 0,
	aii: 0,
	bii: 0,
	paX: 0,
	paY: 0,
	pbX: 0,
	pbY: 0
}));
function Dn(e, t) {
	let n = e.genome.parts;
	for (let e = 1; e < n.length; e++) {
		let t = n[e], r = n[t.parentIndex], i = En[e - 1], a = Math.max(.35, r.dimN * r.dimM * H), o = Math.max(.35, t.dimN * t.dimM * H);
		i.aim = 1 / a, i.bim = 1 / o, i.aii = 12 / (a * (r.width ** 2 + r.height ** 2)), i.bii = 12 / (o * (t.width ** 2 + t.height ** 2));
		let s = wt(t.attachmentPoint, r.width, r.height), c = At(t.attachmentPoint, t.width, t.height);
		i.paX = s.x, i.paY = s.y, i.pbX = c.x, i.pbY = c.y;
	}
	for (let r = 0; r < t; r++) for (let t = 1; t < n.length; t++) {
		let r = n[t];
		n[r.parentIndex];
		let i = e.segments[r.parentIndex], a = e.segments[t], { aim: o, bim: s, aii: c, bii: l, paX: u, paY: d, pbX: f, pbY: p } = En[t - 1], m = Math.cos(i.angle) * u - Math.sin(i.angle) * d, h = Math.sin(i.angle) * u + Math.cos(i.angle) * d, g = Math.cos(a.angle) * f - Math.sin(a.angle) * p, _ = Math.sin(a.angle) * f + Math.cos(a.angle) * p, v = a.x + g - i.x - m, y = a.y + _ - i.y - h, b = o + s + h * h * c + _ * _ * l, x = o + s + m * m * c + g * g * l, S = -m * h * c - g * _ * l, C = b * x - S * S, w = (-x * v + S * y) * .8 / C, T = (S * v - b * y) * .8 / C;
		a.x += w * s, a.y += T * s, a.angle += (g * T - _ * w) * l, i.x -= w * o, i.y -= T * o, i.angle -= (m * T - h * w) * c;
		let E = a.angle - i.angle - r.baseAngleOffset;
		E = Math.atan2(Math.sin(E), Math.cos(E));
		let D = -.5 * (E - q(E, -r.maxAngle, r.maxAngle)) / (c + l);
		a.angle += D * l, i.angle -= D * c;
	}
}
function On(e, t) {
	if (!t || t.every((e) => e === 0)) return Math.sin(e);
	let n = Math.sin(e), r = 1;
	for (let i = 0; i < t.length; i++) n += t[i] * Math.sin((i + 2) * e), r += Math.abs(t[i]);
	return n / r;
}
function kn(e, t, n, r) {
	if (e.oscillatorMix === void 0 && e.waveHarmonics === void 0) return q((Math.sin(t) * e.cpgAmp * n + r * .45) * e.maxAngle, -e.maxAngle, e.maxAngle);
	let i = e.oscillatorMix ?? 1;
	return q((On(t, e.waveHarmonics) * e.cpgAmp * n * i + r * (.45 + .55 * (1 - i * q(n, 0, 1)))) * e.maxAngle, -e.maxAngle, e.maxAngle);
}
function An(e, t, n, r, i) {
	let a = e.genome, o = e.joints.length, s = te(t.physicsRegime), l = t.physicsRegime === "surface-work-v1", u = t.physicsRegime === "passive-work-v3", d = t.physicsRegime === "paid-work-v2" || u, f = t.waterViscosity ?? .22, p = t.gravity ?? 0, { worldWidth: m, worldHeight: h } = t, g = e.segments.length;
	for (let e = 0; e < g; e++) {
		let t = a.parts[e], n = Math.max(.35, t.dimN * t.dimM * H), r = 1 / 12 * n * (t.width * t.width + t.height * t.height);
		rt[e] = n, it[e] = 1 / n, at[e] = r, G[e] = 1 / r;
	}
	let _ = 0;
	Xe.fill(0), Ze.fill(0), W.fill(0);
	for (let t = 0; t < o; t++) {
		let i = e.joints[t], o = t + 1, c = a.parts[o], u = Math.max(0, Math.min(o - 1, c.parentIndex)), f = e.segments[u], p = e.segments[o], m = t * 6, h = e.neuralOutputs[m] || 0, g = 1 + (e.neuralOutputs[m + 1] || 0) * .35, v = q(1 + (e.neuralOutputs[m + 2] || 0) * .4, .5, 1.6), y = q(1 + (e.neuralOutputs[m + 3] || 0) * .4, .4, 1.8);
		i.stiffness = y;
		let b = q(1 + (e.neuralOutputs[m + 4] || 0) * 1.5, 0, 1.75), x = q(1 + (e.neuralOutputs[m + 5] || 0) * 1.5, 0, 1), S = 1 - Math.exp(-n / Le);
		i.amplitude = (i.amplitude ?? 1) + (b - (i.amplitude ?? 1)) * S, i.engagement = (i.engagement ?? 1) + (x - (i.engagement ?? 1)) * S, b === 0 && i.amplitude < .001 && (i.amplitude = 0), x === 0 && i.engagement < .001 && (i.engagement = 0);
		let C = a.motorFrequency * c.cpgFreqMult * g;
		i.phase = (i.phase + 2 * Math.PI * C * n) % (2 * Math.PI);
		let w = kn(c, i.phase, i.amplitude, h);
		i.targetAngle = w;
		let T = p.angle - f.angle - (c.baseAngleOffset || 0);
		for (; T > Math.PI;) T -= Math.PI * 2;
		for (; T < -Math.PI;) T += Math.PI * 2;
		i.currentRelAngle = T;
		let E = p.angVel - f.angVel;
		i.currentRelAngVel = E;
		let D = (at[u] + at[o]) * .5, O = l ? ie(a.parts[u], c, at[u], at[o], a.motorForce, y, v) : null, k = O?.kp ?? a.motorForce * D * 480 * y, A = O?.kd ?? Math.sqrt(k * D) * 1.4 * y, j = k * (w - T) - A * E, M = O?.maxTorque ?? D * 2200 * v;
		if (j = q(j, -M, M) * i.engagement, s && !Number.isFinite(j)) throw Error("Non-finite muscle torque");
		if (isNaN(j) && (j = 0), l) {
			let t = r ? F(f, a.parts[u], H) + F(p, c, H) : 0, s = P(j, n, E, G[u] + G[o], e.energy);
			p.angVel += s.impulse * G[o], f.angVel -= s.impulse * G[u], r && r("sequential-motor", t, F(f, a.parts[u], H) + F(p, c, H)), e.energy = Math.max(0, e.energy - s.costJ), _ += s.costJ, e.motorDiagnostics.positiveWorkJ += s.positiveJ, e.motorDiagnostics.negativeWorkJ += s.negativeJ, e.motorDiagnostics.energyLimitedImpulses += Number(s.limited), i.appliedTorque = s.impulse / n;
		} else {
			i.appliedTorque = j;
			let e = Math.abs(E * n), t = Math.abs(j) * e * Oe;
			!d && !isNaN(t) && isFinite(t) && (_ += t), W[o] += j, W[u] -= j;
		}
	}
	d && Qe.set(W);
	for (let t = 0; t < g; t++) {
		let n = e.segments[t], r = a.parts[t], o = Math.cos(n.angle), s = Math.sin(n.angle), u = n.vx * o + n.vy * s, d = -n.vx * s + n.vy * o, g = l ? re(r.width, r.height, f) : null, _ = -(g?.x ?? .05 * f * r.height) * u, v = l ? -g.y * d : -2 * f * r.width * d, y = _ * o - v * s, b = _ * s + v * o, x = l ? -g.angular * n.angVel : -(f * n.angVel * (r.width * r.width * r.width + r.height * r.height * r.height)) / 6;
		Xe[t] += y, Ze[t] += b + p * rt[t], W[t] += x;
		let S = Sn(n, r), C = 24 * rt[t], w = 4 * rt[t];
		for (let e of S) {
			let r = e.x - n.x, a = e.y - n.y, o = n.vx - n.angVel * a, s = n.vy + n.angVel * r;
			if (i) {
				let n = c(i, e.x, e.y);
				if (n) {
					let e = o * n.nx + s * n.ny, i = n.dx * C - e * n.nx * w, c = n.dy * C - e * n.ny * w;
					Xe[t] += i, Ze[t] += c, W[t] += r * c - a * i;
				}
			} else {
				if (e.x < 0) {
					let n = -e.x * C - o * w;
					Xe[t] += n, W[t] += r * 0 - a * n;
				} else if (e.x > m) {
					let n = -(e.x - m) * C - o * w;
					Xe[t] += n, W[t] += r * 0 - a * n;
				}
				if (e.y < 0) {
					let n = -e.y * C - s * w;
					Ze[t] += n, W[t] += r * n - a * 0;
				} else if (e.y > h) {
					let n = -(e.y - h) * C - s * w;
					Ze[t] += n, W[t] += r * n - a * 0;
				}
			}
		}
	}
	if (d) {
		for (let t = 0; t < o; t++) {
			let r = t + 1, i = a.parts[r].parentIndex;
			$e[t] = e.joints[t].appliedTorque * n, et[t] = e.segments[r].angVel - e.segments[i].angVel, nt[t] = n * (Qe[r] * G[r] - Qe[i] * G[i]), tt[t] = n * ((W[r] - Qe[r]) * G[r] - (W[i] - Qe[i]) * G[i]);
		}
		let t = ae($e, et, tt, nt, o, e.energy);
		if (t.scale < 1) {
			for (let e = 0; e < g; e++) W[e] += (t.scale - 1) * Qe[e];
			for (let n = 0; n < o; n++) e.joints[n].appliedTorque !== 0 && e.motorDiagnostics.energyLimitedImpulses++, e.joints[n].appliedTorque *= t.scale;
		}
		e.energy = Math.max(0, e.energy - t.costJ), _ += t.costJ, e.motorDiagnostics.positiveWorkJ += t.positiveJ, e.motorDiagnostics.negativeWorkJ += t.negativeJ;
	}
	for (let t = 0; t < g; t++) {
		let i = e.segments[t], o = r ? F(i, a.parts[t], H) : 0;
		i.vx += Xe[t] * it[t] * n, i.vy += Ze[t] * it[t] * n, i.angVel += W[t] * G[t] * n;
		let c = r ? F(i, a.parts[t], H) : 0;
		r?.("forces-and-motors", o, c);
		let l = Math.hypot(i.vx, i.vy);
		s && (l > 400 || Math.abs(i.angVel) > 20) && e.motorDiagnostics.numericalGuardEvents++, l > 400 && (i.vx = i.vx / l * 400, i.vy = i.vy / l * 400), i.angVel = q(i.angVel, -20, 20), r && r("speed-guards", c, F(i, a.parts[t], H));
	}
	let v = 0;
	if (u) for (let t = 0; t < g; t++) {
		let n = e.segments[t], i = t * 3;
		K[i] = n.vx, K[i + 1] = n.vy, K[i + 2] = n.angVel, r && (v += F(n, a.parts[t], H));
	}
	for (let t = 0; t < o; t++) {
		let r = t + 1, i = a.parts[r], o = Math.max(0, Math.min(r - 1, i.parentIndex)), s = e.segments[o], c = e.segments[r], l = a.parts[o], u = st[t];
		u.parentIdx = o, u.childIdx = r;
		let d = wt(i.attachmentPoint, l.width, l.height), f = At(i.attachmentPoint, i.width, i.height), p = Math.cos(s.angle), m = Math.sin(s.angle), h = Math.cos(c.angle), g = Math.sin(c.angle), _ = u.rPx = p * d.x - m * d.y, v = u.rPy = m * d.x + p * d.y, y = u.rCx = h * f.x - g * f.y, b = u.rCy = g * f.x + h * f.y, x = s.x + _, S = s.y + v, C = c.x + y, w = c.y + b, T = C - x, E = w - S, D = .35;
		u.biasX = D / n * T, u.biasY = D / n * E;
		let O = u.wP = it[o], k = u.wC = it[r], A = u.iP = G[o], j = u.iC = G[r], M = u.k11 = O + k + v * v * A + b * b * j, ee = u.k22 = O + k + _ * _ * A + y * y * j, te = u.k12 = -_ * v * A - y * b * j;
		u.det = M * ee - te * te;
		let N = c.angle - s.angle - (i.baseAngleOffset || 0);
		for (; N > Math.PI;) N -= Math.PI * 2;
		for (; N < -Math.PI;) N += Math.PI * 2;
		if (u.limited = Math.abs(N) > i.maxAngle, u.limited) {
			let e = Math.sign(N) * (Math.abs(N) - i.maxAngle);
			u.angularBias = .2 / n * e;
		}
	}
	let y = !1;
	for (let t = 0; t < 10; t++) for (let t = 0; t < o; t++) {
		let { parentIdx: n, childIdx: i, rPx: o, rPy: s, rCx: c, rCy: l, biasX: d, biasY: f, wP: p, wC: m, iP: h, iC: g, k11: _, k22: v, k12: y, det: b, limited: x, angularBias: S } = st[t], C = e.segments[n], w = e.segments[i], T = C.vx - C.angVel * s, E = C.vy + C.angVel * o, D = w.vx - w.angVel * l, O = w.vy + w.angVel * c, k = D - T, A = O - E, j = r && !u ? () => F(C, a.parts[n], H) + F(w, a.parts[i], H) : void 0;
		if (b > 1e-7) {
			let e = j?.() ?? 0, t = -(k + d), n = -(A + f), i = (v * t - y * n) / b, a = (-y * t + _ * n) / b;
			w.vx += i * m, w.vy += a * m, w.angVel += (c * a - l * i) * g, C.vx -= i * p, C.vy -= a * p, C.angVel -= (o * a - s * i) * h, r && !u && r("anchor-constraint", e, j());
		}
		if (x) {
			let e = j?.() ?? 0, t = -(w.angVel - C.angVel + S) / (h + g);
			w.angVel += t * g, C.angVel -= t * h, r && !u && r("angular-limit", e, j());
		}
	}
	if (u) {
		let t = 0, n = 0;
		for (let r = 0; r < g; r++) {
			let i = e.segments[r], a = r * 3, o = i.vx - K[a], s = i.vy - K[a + 1], c = i.angVel - K[a + 2];
			t += rt[r] * (K[a] * o + K[a + 1] * s) + at[r] * K[a + 2] * c, n += .5 * (rt[r] * (o * o + s * s) + at[r] * c * c);
		}
		let i = oe(t, n);
		if (i < 1) {
			e.motorDiagnostics.constraintLimitedBatches++, y = i <= 64 * 2 ** -52;
			for (let t = 0; t < g; t++) {
				let n = e.segments[t], r = t * 3;
				n.vx = K[r] + i * (n.vx - K[r]), n.vy = K[r + 1] + i * (n.vy - K[r + 1]), n.angVel = K[r + 2] + i * (n.angVel - K[r + 2]);
			}
		}
		r && r("constraint-batch", v, e.segments.reduce((e, t, n) => e + F(t, a.parts[n], H), 0));
	}
	if (u && y) {
		let t = r ? e.segments.reduce((e, t, n) => e + F(t, a.parts[n], H), 0) : 0;
		Dn(e, 12), r && r("position-projection", t, e.segments.reduce((e, t, n) => e + F(t, a.parts[n], H), 0));
	}
	for (let t = 0; t < g; t++) {
		let r = e.segments[t];
		r.x += r.vx * n, r.y += r.vy * n, r.angle += r.angVel * n;
	}
	return _;
}
function jn(e, t) {
	let n = Infinity, r = -Infinity, i = Infinity, a = -Infinity;
	for (let o = 0; o < e.length; o++) for (let s of Sn(t[o], e[o])) n = Math.min(n, s.x), r = Math.max(r, s.x), i = Math.min(i, s.y), a = Math.max(a, s.y);
	return {
		left: n,
		right: r,
		top: i,
		bottom: a
	};
}
function Mn(e) {
	return e.filter((e) => !e.dissolving).flatMap((e) => e.segments.map((t, n) => jn([e.genome.parts[n]], [t])));
}
function Nn(e, t, n, r, i) {
	let o = tn(e.genome.parts), c = r ?? Mn(n), l = !1;
	for (let n = 0; n < 8; n++) {
		let r = (e.hatchHeading ?? 0) + n * Math.PI / 4, u = Math.cos(r), d = Math.sin(r), f = o.map((t) => ({
			...t,
			x: e.x + u * t.x - d * t.y,
			y: e.y + d * t.x + u * t.y,
			angle: t.angle + r
		})), p = jn(e.genome.parts, f), m = a(t, i);
		if (!(m ? !s(m, p, 2) : p.left < 2 || p.top < 2 || p.right > t.worldWidth - 2 || p.bottom > t.worldHeight - 2) && (l = !0, !c.some((e) => e.left < p.right + 2 && e.right > p.left - 2 && e.top < p.bottom + 2 && e.bottom > p.top - 2))) return {
			heading: r,
			reason: "clear"
		};
	}
	return {
		heading: null,
		reason: l ? "occupied" : "tank-boundary"
	};
}
function Pn(e, t) {
	let n = e.genome, r = n.hiddenIds.length, i = R(n), a = e.learnedMotorWeights?.length ? pe(e, i) : null, o = e.learnedSensoryWeights?.length ? a ?? pe(e, i) : null, s = e.neuralInputs.length;
	for (let t = 0; t < r; t++) ot[t] = e.neuralHidden[t] || 0;
	for (let a = 0; a < r; a++) {
		let c = n.biasesH[a] || 0, l = n.weightsIH[a], u = n.weightsHH[a], d = a * s, f = i.enabledIH[a];
		if (f) for (let t = 0; t < f.length; t++) {
			let n = f[t];
			if (c += (e.neuralInputs[n] || 0) * (l?.[n] || 0), o) {
				let t = o.sensory[d + n];
				t !== 0 && (c += (e.neuralInputs[n] || 0) * t);
			}
		}
		else for (let t = 0; t < e.neuralInputs.length; t++) if (c += (e.neuralInputs[t] || 0) * (l?.[t] || 0), o) {
			let n = o.sensory[d + t];
			n !== 0 && (c += (e.neuralInputs[t] || 0) * n);
		}
		let p = i.enabledHH[a];
		if (p) for (let e = 0; e < p.length; e++) {
			let t = p[e];
			c += ot[t] * (u?.[t] || 0);
		}
		else for (let e = 0; e < r; e++) c += ot[e] * (u?.[e] || 0);
		let m = isNaN(c) ? 0 : Math.tanh(c);
		e.neuralHidden[a] = zt(ot[a], m, n.hiddenTimeConstants[a], t);
	}
	let c = e.segments.length - 1;
	for (let t = 0; t < c * 6; t++) {
		let o = n.biasesO[t] || 0, s = n.weightsHO[t], c = i.enabledHO[t];
		if (c) for (let t = 0; t < c.length; t++) {
			let n = c[t];
			o += e.neuralHidden[n] * (s?.[n] || 0);
		}
		else for (let t = 0; t < r; t++) o += e.neuralHidden[t] * (s?.[t] || 0);
		if (a && (n.plasticMotorScope === "all" || n.outputKeys[t].endsWith(":Angle"))) {
			if (c) for (let n = 0; n < c.length; n++) {
				let i = c[n], s = t * r + i;
				o += e.neuralHidden[i] * a.motor[s];
			}
			else for (let n = 0; n < r; n++) {
				let i = t * r + n;
				o += e.neuralHidden[n] * a.motor[i];
			}
		}
		e.neuralOutputs[t] = isNaN(o) ? 0 : Math.tanh(o);
	}
}
function Fn(e, t, n, r, i) {
	if (i <= 0) return;
	let a = e.nutrients.length >= 2200 ? e.nutrients.find((e) => e.kind === "carrion") : void 0;
	a ? (a.energyValue += i, a.radius = J(a.energyValue, t.nutrientCycle), a.decayTimeRemaining = 60) : e.nutrients.push({
		id: `REM-${e.prng.nextUint32().toString(36)}`,
		kind: "carrion",
		decayTimeRemaining: 60,
		x: n,
		y: r,
		vx: 0,
		vy: 0,
		energyValue: i,
		radius: J(i, t.nutrientCycle),
		bottomTimer: 0,
		pulseTimer: e.prng.range(0, Math.PI * 2)
	});
}
function In(e, t, n) {
	let r = e.energyPool, i = [], o = 0, s = 0;
	for (let a of e.nutrients) {
		let c = Math.min(a.energyValue, (t.nutrientCycle === "decay-v1" ? 30 : 1) * n);
		if (a.energyValue -= c, r.reserve += c, e.ledger.recordedLosses += c, !(a.energyValue <= 0)) {
			if (a.radius = J(a.energyValue, t.nutrientCycle), a.kind === "carrion") {
				if (a.decayTimeRemaining = Math.max(0, (a.decayTimeRemaining ?? 60) - n), a.decayTimeRemaining < 1e-10) {
					i.push(a);
					continue;
				}
			} else s++;
			e.nutrients[o++] = a;
		}
	}
	e.nutrients.length = o;
	let c = Math.max(0, Math.min(Math.floor(t.targetNutrients), t.nutrientLimit ?? Infinity) - s);
	c = Math.min(c, Math.max(0, w - o));
	let l = a(t, e.selfTubes);
	for (let n of i) {
		let i = Math.min(c, Math.ceil(n.energyValue / U)), a = n.energyValue, o = i ? e.prng.range(0, Math.PI * 2) : 0, s = Math.cos(o), f = Math.sin(o), p = Math.ceil(Math.sqrt(i)), m = Math.max(0, p - 1) * Math.SQRT2 + 1e-6, h = l ? u(l) : [{
			left: 35,
			right: t.worldWidth - 35,
			top: 35,
			bottom: t.worldHeight - 35
		}], g = Infinity, _ = {
			x: n.x,
			y: n.y
		};
		for (let e of h) {
			let r = e.left < 0 ? e.left + 18 : e.left, i = e.right > t.worldWidth ? e.right - 18 : e.right, a = q(n.x, r + m, i - m), o = q(n.y, e.top + m, e.bottom - m), s = (a - n.x) ** 2 + (o - n.y) ** 2;
			s < g && (g = s, _ = {
				x: a,
				y: o
			});
		}
		let v = i ? Math.min(U, a / i) : 0;
		for (let r = 0; r < i; r++) {
			let o = Math.min(U, r === i - 1 ? a : v), c = (r % p - (p - 1) / 2) * 2, u = (Math.floor(r / p) - (p - 1) / 2) * 2, m = _.x + c * s - u * f, h = _.y + c * f + u * s, g = l ? d(l, m, h) : {
				x: q(m, 35, t.worldWidth - 35),
				y: q(h, 35, t.worldHeight - 35)
			};
			e.nutrients.push({
				id: `NUT-${e.prng.nextUint32().toString(36)}`,
				...g,
				vx: n.vx,
				vy: n.vy,
				energyValue: o,
				radius: J(o, t.nutrientCycle),
				bottomTimer: 0,
				kind: "nutrient",
				pulseTimer: e.prng.range(0, Math.PI * 2)
			}), a -= o;
		}
		c -= i, r.reserve += a, e.ledger.recordedLosses += a;
	}
}
function Ln(e, t, n, r, i, o) {
	let s = a(t, e.selfTubes), c = s ? new Map(e.organisms.map((e) => [e.id, e.segments[0].x])) : void 0, l = t.waterViscosity ?? .22, u = t.worldWidth, f = t.worldHeight, p = t.targetNutrients ?? 800, g = t.inflowRate ?? 15, _ = t.kinshipProtection ?? !0, v = t.mutationSeverity ?? .25, y = t.gravity ?? 0;
	e.simTime += n;
	let b = e.organisms, x = e.eggs, C = e.nutrients, w = e.bubbles, T = e.caustics, D = e.ledger, M = e.prng, N = 0, ne = C.filter((e) => e.kind !== "carrion").length;
	if ((e.energyPool ? gt(e, t) <= 0 : ne >= p) || g <= 0) e.nutrientAccumulator = 0;
	else if (e.nutrientAccumulator += g * n, e.nutrientAccumulator >= 1) {
		let n = _t(e, t, Math.floor(e.nutrientAccumulator));
		e.nutrientAccumulator -= n;
	}
	let re = !!e.energyPool && (t.nutrientCycle === "decay-v1" || t.nutrientCycle === "decay-v2");
	re && In(e, t, n);
	let ie = Math.max(0, p - C.filter((e) => e.kind !== "carrion").length), P = Math.exp(-l * 12 * n);
	for (let t = 0; t < C.length; t++) {
		let r = C[t];
		if (!re && r.kind === "carrion") {
			if (r.decayTimeRemaining = Math.max(0, (r.decayTimeRemaining ?? 60) - n), e.energyPool && r.decayTimeRemaining === 0) {
				e.energyPool.reserve += r.energyValue, C.splice(t--, 1);
				continue;
			}
			r.decayTimeRemaining === 0 && ie > 0 && (ie--, r.kind = "nutrient", delete r.decayTimeRemaining);
		}
		r.vy += y * n, r.vx *= P, r.vy *= P, r.x += r.vx * n, r.y += r.vy * n, r.pulseTimer = (r.pulseTimer || 0) + n * (r.isSuper ? 4 : 2.5), s ? h(r, s) : (r.x < 35 && (r.x = 35, r.vx = 0), r.x > u - 35 && (r.x = u - 35, r.vx = 0), r.y < 35 && (r.y = 35, r.vy = 0), r.y > f - 35 && (r.y = f - 35, r.vy = 0));
	}
	for (let e of T) e.angle += e.speed * n, e.x += Math.cos(e.angle) * 12 * n, e.y += Math.sin(e.angle) * 12 * n, e.x < 0 && (e.x = u), e.x > u && (e.x = 0), e.y < 0 && (e.y = f), e.y > f && (e.y = 0);
	let ae;
	A(e, n);
	for (let i = x.length - 1; i >= 0; i--) {
		let a = x[i];
		if (e.energyPool && (a.ageSeconds = (a.ageSeconds ?? 0) + n, a.ageSeconds >= 3 * a.totalIncubationTime)) {
			Fn(e, t, a.x, a.y, a.fundedStructural + a.fundedReserve), x.splice(i, 1), r?.("egg_loss");
			continue;
		}
		a.incubationProgress = Math.min(1, a.incubationProgress + n / a.totalIncubationTime), a.pulseTimer += n * 4.5, a.vy += y * n, a.vx *= P, a.vy *= P, a.x += a.vx * n, a.y += a.vy * n, s ? h(a, s) : (a.x < 35 && (a.x = 35, a.vx = 0), a.x > u - 35 && (a.x = u - 35, a.vx = 0), a.y < 35 && (a.y = 35, a.vy = 0), a.y > f - 35 && (a.y = f - 35, a.vy = 0));
		let o = a.fundedStructural + a.fundedReserve;
		if (a.incubationProgress >= 1) {
			let n = a.genome.bodyCost;
			if (e.energyPool && (e.energyPool.reserve < 0 || o < n || o + 1e-7 < k(a))) {
				a.readyToHatch = !0;
				continue;
			}
			if (o < n) {
				o > 5 && C.length < 2200 ? C.push({
					id: `REM-${M.nextUint32().toString(36)}`,
					kind: "carrion",
					decayTimeRemaining: 60,
					x: a.x,
					y: a.y,
					vx: 0,
					vy: 0,
					energyValue: o,
					radius: J(o),
					bottomTimer: 0,
					pulseTimer: M.range(0, Math.PI * 2)
				}) : D.recordedLosses += o, x.splice(i, 1), r && r("egg_loss");
				continue;
			}
			if (a.readyToHatch = !0, e.energyPool || b.filter((e) => !e.dissolving).length < (t.maxOrganisms ?? 50)) {
				a.hatchHeading ??= M.range(0, Math.PI * 2), ae ??= Mn(b);
				let s = Nn(a, t, b, ae, e.selfTubes).heading;
				if (s === null) continue;
				let c = o - n, l = vn(a.genome, a.x, a.y, s, a.clutchId, c, M);
				l.structuralBiomass = n, b.push(l);
				for (let e = 0; e < l.segments.length; e++) ae.push(jn([l.genome.parts[e]], [l.segments[e]]));
				e.totalBirths += 1, e.lineage.set(l.id, {
					id: l.id,
					parentIds: [a.parentOrgId],
					generation: l.genome.generation,
					birthTime: e.simTime,
					offspringCount: 0,
					archetype: l.genome.archetype || "Offspring",
					hue: l.genome.hue,
					diet: pt(l.genome.mouths).label,
					genome: l.genome
				}), S(e.lineage, l.id), x.splice(i, 1), r && r("birth");
			}
		}
	}
	let oe = b.flatMap((e) => e.dissolving ? [] : e.segments.map((t, n) => {
		let r = e.genome.parts[n], i = Sn(t, r);
		return {
			kind: "body",
			other: e,
			part: n,
			seg: t,
			def: r,
			corners: i,
			bounds: {
				left: Math.min(...i.map((e) => e.x)),
				right: Math.max(...i.map((e) => e.x)),
				top: Math.min(...i.map((e) => e.y)),
				bottom: Math.max(...i.map((e) => e.y))
			}
		};
	})), F = x.map((e) => ({
		kind: "egg",
		egg: e,
		bounds: {
			left: e.x - 16,
			right: e.x + 16,
			top: e.y - 16,
			bottom: e.y + 16
		}
	})), I, se = -1, ce = [];
	for (let i = b.length - 1; i >= 0; i--) {
		let a = b[i], o = a.genome;
		if (a.dissolving) {
			if (a.dissolveAlpha -= n * 1.5, a.dissolveAlpha <= 0) {
				let n = a.segments[0], o = Math.max(0, a.structuralBiomass) + Math.max(0, a.energy), c = s ? d(s, n.x, n.y, 40) : {
					x: q(n.x, 40, u - 40),
					y: q(n.y, 40, f - 40)
				};
				e.energyPool ? Fn(e, t, c.x, c.y, o) : o > 0 && C.length < 2200 ? C.push({
					id: `REM-${M.nextUint32().toString(36)}`,
					kind: "carrion",
					decayTimeRemaining: 60,
					x: c.x,
					y: c.y,
					vx: 0,
					vy: 0,
					energyValue: o,
					radius: J(o),
					bottomTimer: 0,
					pulseTimer: M.range(0, Math.PI * 2)
				}) : D.recordedLosses += o;
				let l = a.deathCause || (a.age >= a.maxLifespan ? "Old Age" : a.energy <= 0 ? "Starvation" : "Predation"), p = e.lineage.get(a.id);
				p && (p.deathTime = e.simTime, p.deathCause = l, p.deathAge = a.age, p.deathEnergy = Math.max(0, a.energy), S(e.lineage, a.id)), e.recentDeaths ||= [], e.recentDeaths.unshift({
					id: a.id,
					name: a.genome.name || a.id,
					generation: a.genome.generation,
					cause: l,
					age: a.age,
					energyAtDeath: Math.max(0, a.energy),
					offspringCount: a.offspringCount,
					timestamp: e.simTime
				}), e.recentDeaths.length > 30 && e.recentDeaths.pop(), b.splice(i, 1), e.totalDeaths += 1, r && r("death");
			}
			continue;
		}
		a.age += n, a.glowPulse += n * 3.5, a.isFeedingHighlight > 0 && (a.isFeedingHighlight = Math.max(0, a.isFeedingHighlight - n)), a.traceHistory ||= [], (a.traceHistory.length === 0 || Math.hypot(a.segments[0].x - a.traceHistory[a.traceHistory.length - 1].x, a.segments[0].y - a.traceHistory[a.traceHistory.length - 1].y) > 12) && (a.traceHistory.push({
			x: a.segments[0].x,
			y: a.segments[0].y,
			time: e.simTime
		}), a.traceHistory.length > 30 && a.traceHistory.shift()), (!I || se !== C.length) && (ce = [
			...C.map((e) => ({
				kind: "food",
				food: e,
				bounds: {
					left: e.x - e.radius,
					right: e.x + e.radius,
					top: e.y - e.radius,
					bottom: e.y + e.radius
				}
			})),
			...F,
			...oe
		], I = new Te(ce.map((e) => e.bounds)), se = C.length), a.rayHits = [], a.neuralInputs.fill(0);
		let c = 0, l = o.eyes.length;
		for (let e = 0; e < l; e++) {
			let t = o.eyes[e], n = Math.min(t.partIndex, a.segments.length - 1), r = a.segments[n], i = o.parts[n], s = kt(t, i.width, i.height), l = Math.cos(r.angle), u = Math.sin(r.angle), d = r.x + l * s.x - u * s.y, f = r.y + u * s.x + l * s.y, p = r.angle + jt(t.direction), m = t.fov, h = t.range;
			for (let e = 0; e < 5; e++) {
				let n = p + (e / 4 - .5) * m, r = Math.cos(n), i = Math.sin(n), o = h, s = !1, l = d + r * h, u = f + i * h, g = Ge[0], _ = Ge[1], v = Ge[2], y = "none", b = I.query(d, f, d + r * h, f + i * h);
				for (let e of b) {
					let t = ce[e];
					if (t.kind === "food") {
						let e = t.food;
						if (Math.abs(e.x - d) > o + e.radius || Math.abs(e.y - f) > o + e.radius) continue;
						let n = xn(d, f, r, i, o, e.x, e.y, e.radius);
						n.hit && n.dist < o && (o = n.dist, s = !0, l = n.pointX, u = n.pointY, [g, _, v] = ut(e), y = e.kind === "carrion" ? "carrion" : "nutrient");
					} else if (t.kind === "egg") {
						let e = t.egg;
						if (Math.abs(e.x - d) > o + 24 || Math.abs(e.y - f) > o + 24) continue;
						let n = xn(d, f, r, i, o, e.x, e.y, 16);
						n.hit && n.dist < o && (o = n.dist, s = !0, l = n.pointX, u = n.pointY, [g, _, v] = Ke, y = "egg");
					} else {
						let { other: e, part: n, seg: c, corners: p } = t;
						if (e.id === a.id || e.dissolving || Math.abs(c.x - d) > o + 50 || Math.abs(c.y - f) > o + 50) continue;
						for (let t = 0; t < 4; t++) {
							let a = p[t], c = p[(t + 1) % 4], m = bn(d, f, d + r * o, f + i * o, a.x, a.y, c.x, c.y);
							if (m.hit) {
								let t = Math.hypot(m.x - d, m.y - f);
								t < o && (o = t, s = !0, l = m.x, u = m.y, [g, _, v] = Tn(...lt(e, n)), y = "creature");
							}
						}
					}
				}
				let x = 1 / (h * .55), S = Math.exp(-x * o), C = (1 - S) * Ge[0] + S * g, w = (1 - S) * Ge[1] + S * _, T = (1 - S) * Ge[2] + S * v, E = t.spectralSensitivity, D = E ? C * E[0] : C, O = E ? w * E[1] : w, k = E ? T * E[2] : T, A = D > 1e-12 || O > 1e-12 || k > 1e-12;
				a.neuralInputs[c++] = D, a.neuralInputs[c++] = O, a.neuralInputs[c++] = k, a.neuralInputs[c++] = A ? q(o / h, 0, 1) : 1, a.rayHits.push({
					eyeId: t.id,
					rayIndex: e,
					hit: s,
					dist: o,
					pointX: l,
					pointY: u,
					r: D,
					g: O,
					b: k,
					objectType: y
				});
			}
		}
		for (let e = 0; e < a.joints.length; e++) a.neuralInputs[c++] = q(a.joints[e].currentRelAngle / Math.max(.01, o.parts[e + 1].maxAngle), -1, 1), a.neuralInputs[c++] = q(a.joints[e].currentRelAngVel / 20, -1, 1);
		a.neuralInputs[c++] = q(a.speed / 60, 0, 1), a.neuralInputs[c++] = q(a.energy / Math.max(1, o.maxEnergyCapacity), 0, 1);
		let p = a.joints[0]?.phase ?? 0;
		a.neuralInputs[c++] = Math.sin(p), a.neuralInputs[c++] = Math.cos(p);
		for (let e of o.mouths) {
			let t = a.mouthFeedback?.[e.id];
			a.neuralInputs[c++] = t?.contact ?? 0, a.neuralInputs[c++] = t?.intake ?? 0;
		}
		if (a.neuralInputs[c++] = +!!o.mouths.some((e) => (a.mouthFeedback?.[e.id]?.intake ?? 0) > 0), a.neuralInputs[c++] = q(yn(a).y / Math.max(1, f), 0, 1), a.neuralInputs[c++] = q((a.biteFeedbackJ ?? 0) / 60, 0, 1), a.biteFeedbackJ = 0, Pn(a, n), (o.plasticityRate ?? 0) > 0) {
			let e = Yt(a, n, D);
			a.plasticityEnergyRate = e / n, N += e;
		}
		if ((o.sensoryPlasticityRate ?? 0) > 0) {
			let e = Jt(a, n, D);
			N += e;
			let t = e / n;
			a.plasticityEnergyRate = ((o.plasticityRate ?? 0) > 0 ? a.plasticityEnergyRate ?? 0 : 0) + t;
		}
	}
	let L = b.filter((e) => !e.dissolving), R = te(t.physicsRegime);
	if (R) for (let e of L) e.motorDiagnostics = {
		positiveWorkJ: 0,
		negativeWorkJ: 0,
		energyLimitedImpulses: 0,
		numericalGuardEvents: 0,
		...t.physicsRegime === "passive-work-v3" ? { constraintLimitedBatches: 0 } : {}
	};
	let le = new Map(L.map((e) => [e, 0])), ue = Math.max(4, Math.ceil(n * 240));
	for (let e = 0; e < ue; e++) {
		for (let e of L) le.set(e, le.get(e) + An(e, t, n / ue, i, s));
		we(L, H, Dn, i);
	}
	for (let e = L.length - 1; e >= 0; e--) {
		let t = L[e], r = t.genome, i = le.get(t);
		R || (i = Math.min(40, i));
		let a = yn(t);
		t.speed = Math.hypot(a.vxCOM, a.vyCOM), t.distanceTraveled += t.speed * n;
		let o = 12 * (Nt(r.parts) / 36) * r.metabolicEfficiency, s = 24 * (r.inputKeys.length + 24 + r.outputKeys.length), c = Math.max(0, ke * (Ye(r.eyes) + r.hiddenIds.length + r.mouths.length * 2) + Ae * (Xt(r) - s) + Bt(r)), l = i / n, u = o * n + c * n;
		t.basalEnergyRate = o, t.sensoryEnergyRate = c, t.motorEnergyRate = l, t.totalEnergyRate = o + c + l + (t.plasticityEnergyRate ?? 0);
		let d = u + (R ? 0 : i), f = d > 0 ? Math.min(1, t.energy / d) : 0;
		t.energy = Math.max(0, t.energy - d), D.metabolicDissipation += u * f, D.mechanicalWorkHeat += i * (R ? 1 : f), N += u * f + i * (R ? 1 : f);
	}
	let de = new Te(b.map((e) => jn(e.genome.parts, e.segments))), fe, pe, me = -1;
	for (let i = L.length - 1; i >= 0; i--) {
		let a = L[i], s = a.genome;
		if (a.dissolving) continue;
		let c = Object.create(null);
		for (let i of s.mouths) {
			let l = c[i.id] = {
				contact: 0,
				intake: 0
			}, u = Math.min(i.partIndex, a.segments.length - 1), d = a.segments[u], f = s.parts[u], p = kt(i, f.width, f.height), m = Math.cos(d.angle), h = Math.sin(d.angle), g = d.x + m * p.x - h * p.y, v = d.y + h * p.x + m * p.y, { radius: y, length: S } = j(i), w = Mt(i.direction), T = m * w.x - h * w.y, E = h * w.x + m * w.y, O = g, k = v, A = g + T * S, M = v + E * S, te = i.mouthType !== "herbivore", ne = i.mouthType !== "carnivore", re = (i.mouthType === "omnivore" ? Ue : He) * n, ie = re, P = () => ie > 0 && a.energy < s.maxEnergyCapacity, ae = (t, n, r = 1) => {
				let c = We * r, u = Math.min(Math.max(0, t), ie, Math.max(0, s.maxEnergyCapacity - a.energy) / c);
				if (u <= 0) return 0;
				let d = u * c;
				return l.intake = q(l.intake + d / Math.max(1e-9, re), 0, 1), ie = Math.max(0, ie - u), o?.(a.id, e.simTime, d, a.energy + a.structuralBiomass, Math.max(s.maxEnergyCapacity, s.bodyCost), -1), a.energy += d, D.metabolicDissipation += u - d, N += u - d, a.isFeedingHighlight = .2, mt(a, e.simTime, i.id, i.mouthType, n, d), u;
			}, oe = Math.min(O, A) - y, F = Math.max(O, A) + y, I = Math.min(k, M) - y, se = Math.max(k, M) + y;
			if (te) {
				for (let n of de.queryBounds(oe, I, F, se).reverse()) {
					if (!P() && l.contact) break;
					let i = b[n];
					if (i.id === a.id || i.dissolving || _ && St(a, i)) continue;
					let s = !1, c = -1;
					for (let e = 0; e < i.segments.length && !s; e++) {
						let n = i.segments[e], r = i.genome.parts[e], a = Math.hypot(r.width, r.height) * .5 + S + y;
						Math.abs(n.x - g) > a || Math.abs(n.y - v) > a || (s = t.mouthContactModel === "capsule-v1" ? ee(O, k, A, M, y, n, r) : Cn(g, v, O, k, A, M, y, n, r), s && (c = e));
					}
					if (!s) continue;
					l.contact = 1;
					let u = i.energy > 0, d = ae(u ? i.energy : i.structuralBiomass, "Prey", u ? 1 : .85);
					d <= 0 || (o?.(i.id, e.simTime, d, i.energy + i.structuralBiomass, Math.max(i.genome.maxEnergyCapacity, i.genome.bodyCost), c), u ? i.energy = Math.max(0, i.energy - d) : i.structuralBiomass = Math.max(0, i.structuralBiomass - d), i.biteFeedbackJ = (i.biteFeedbackJ ?? 0) + d, i.energy <= 0 && (i.deathCause = "Predation", i.dissolving = !0, i.dissolveAlpha = 1, a.preyEaten++, a.foodEaten++, r && r("clash")));
				}
				(!pe || me !== x.length) && (pe = new Te(x.map((e) => ({
					left: e.x - 16,
					right: e.x + 16,
					top: e.y - 16,
					bottom: e.y + 16
				}))), me = x.length);
				for (let e of pe.queryBounds(oe, I, F, se).reverse()) {
					if (!P() && l.contact) break;
					let t = x[e];
					if (_ && Ct(a, t) || wn(t.x, t.y, O, k, A, M) > 16 + y) continue;
					l.contact = 1;
					let n = ae(t.fundedReserve + t.fundedStructural, "Egg");
					if (n <= 0) continue;
					let i = Math.min(t.fundedReserve, n);
					t.fundedReserve -= i, t.fundedStructural = Math.max(0, t.fundedStructural - (n - i)), t.fundedReserve + t.fundedStructural <= 2 && (D.recordedLosses += t.fundedReserve + t.fundedStructural, N += t.fundedReserve + t.fundedStructural, a.eggsPredated = (a.eggsPredated || 0) + 1, a.preyEaten++, a.foodEaten++, x.splice(e, 1), pe = void 0, r && r("clash"));
				}
			}
			(!fe || fe.nutrientCount !== C.length) && (fe = new Ee(C));
			for (let e of fe.queryBounds(oe, I, F, se).reverse()) {
				if (!P() && l.contact) break;
				let n = C[e], i = n.kind === "carrion";
				if (i ? !te : !ne) continue;
				let o = n.radius + S + y;
				if (Math.abs(n.x - g) > o || Math.abs(n.y - v) > o || wn(n.x, n.y, O, k, A, M) > n.radius + y) continue;
				l.contact = 1;
				let s = ae(n.energyValue, i ? "Carrion" : "Nutrient", i ? .85 : 1);
				s <= 0 || (n.energyValue = Math.max(0, n.energyValue - s), n.radius = J(n.energyValue, t.nutrientCycle), n.energyValue <= 1 && (D.recordedLosses += n.energyValue, N += n.energyValue, a.foodEaten++, C.splice(e, 1), r && r("eat")));
			}
		}
		a.mouthFeedback = c;
		let l = s.maturityAge || 20, u = s.reproductionCooldown || 18, d = Math.max(Re, s.maxEnergyCapacity * ze), f = s.bodyCost + dt(s), p = a.energy - d, m = e.simTime >= (a.lastReproductionTime || 0) + u, h = a.age >= l, g = s.targetClutchSize || 2, y = Math.max(0, Math.floor(p / f)), w = Math.min(g, y);
		if (a.isGravid = h && m && w >= 1, a.isGravid && O(e) < (t.maxOrganisms ?? 50) && x.length < 75) {
			let n = Math.min(w, 75 - x.length, e.energyPool ? (t.maxOrganisms ?? 50) - O(e) : Infinity);
			if (n >= 1) {
				let i = a.segments[a.segments.length - 1], o = `CLUTCH-${M.nextUint32().toString(36).substring(0, 5)}`, c = !1;
				for (let r = 0; r < n && !(x.length >= 75); r++) {
					let l = _n(s, v, M, t.physicsRegime);
					l.parentIds = [a.id];
					let u = l.bodyCost, f = dt(s), p = u + f;
					if (a.energy >= p + d) {
						a.energy -= p, a.offspringCount += 1, c = !0;
						let t = e.lineage.get(a.id);
						t && (t.offspringCount += 1, S(e.lineage, a.id));
						let s = (r - (n - 1) / 2) * .35, d = i.angle + Math.PI + s, m = {
							id: `EGG-${M.nextUint32().toString(36).substring(0, 5)}`,
							clutchId: o,
							parentOrgId: a.id,
							x: i.x + Math.cos(d) * 25,
							y: i.y + Math.sin(d) * 25,
							vx: Math.cos(d) * M.range(.6, 1.2),
							vy: Math.sin(d) * M.range(.6, 1.2),
							genome: l,
							fundedStructural: u,
							fundedReserve: f,
							initialFundedReserve: f,
							incubationProgress: 0,
							totalIncubationTime: l.incubationTime || M.range(8.5, 14),
							pulseTimer: r * .4,
							colorHue: l.hue,
							readyToHatch: !1
						};
						e.energyPool && E(m), x.push(m);
					}
				}
				c && (a.lastReproductionAge = a.age, a.lastReproductionTime = e.simTime, a.clutchesLaid += 1, r && r("birth"));
			}
		}
		a.isGravid = ft(a, e.simTime, b.filter((e) => !e.dissolving).length, x.length, t.maxOrganisms ?? 50, 75, !!e.energyPool).eligible, a.dissolving || (a.age >= a.maxLifespan ? (a.deathCause = "Old Age", a.dissolving = !0, a.dissolveAlpha = 1) : a.energy <= 0 && (a.deathCause = "Starvation", a.dissolving = !0, a.dissolveAlpha = 1));
	}
	for (let e = w.length - 1; e >= 0; e--) {
		let t = w[e];
		t.life += n, t.x += t.vx * n * 60, t.y += t.vy * n * 60, t.vy -= .05 * n * 60, t.alpha = (1 - t.life / t.maxLife) * .6, t.life >= t.maxLife && w.splice(e, 1);
	}
	w.length > 60 && w.splice(0, w.length - 60), c && m(e, t, c), e.energyPool && (e.energyPool.reserve += N);
}
//#endregion
//#region ../vidAI/eggReserve.ts
function Rn(e) {
	return e.initialFundedReserve === void 0 ? {
		initialFundedReserve: e.fundedReserve,
		initialReserveIsLegacy: !0
	} : {};
}
//#endregion
//#region ../vidAI/persistence.ts
var zn = "0.39.0", Bn = {
	physicsRegime: "paid-work-v2",
	worldWidth: 2400,
	worldHeight: 1500,
	waterViscosity: .18,
	targetNutrients: 275,
	inflowRate: 15,
	nutrientPattern: "uniform",
	kinshipProtection: !0,
	mutationSeverity: .25,
	gravity: 0,
	maxOrganisms: 30
};
({ ...Bn });
function Vn(e) {
	return e.energyPool ? T(e) + e.energyPool.reserve : e.organisms.reduce((e, t) => e + t.energy + t.structuralBiomass, 0) + e.eggs.reduce((e, t) => e + t.fundedReserve + t.fundedStructural, 0) + e.nutrients.reduce((e, t) => e + t.energyValue, 0) + e.ledger.metabolicDissipation + e.ledger.mechanicalWorkHeat + e.ledger.recordedLosses;
}
function Hn(e) {
	let t = e.nutrients.filter((e) => e.kind !== "carrion").reduce((e, t) => e + t.energyValue, 0);
	return e.ledger.recordedLosses += t, e.energyPool && (e.energyPool.reserve += t), e.nutrients = e.nutrients.filter((e) => e.kind === "carrion"), e.nutrientAccumulator = 0, t;
}
function Un(e, t, n, r) {
	let i = (n - t.worldWidth) / 2, a = (r - t.worldHeight) / 2;
	for (let t of e.organisms) {
		let e = t.segments.flatMap((e, n) => Sn(e, t.genome.parts[n])), o = Math.min(...e.map((e) => e.x)) + i, s = Math.max(...e.map((e) => e.x)) + i, c = Math.min(...e.map((e) => e.y)) + a, l = Math.max(...e.map((e) => e.y)) + a, u = i + (o < 5 ? 5 - o : s > n - 5 ? n - 5 - s : 0), d = a + (c < 5 ? 5 - c : l > r - 5 ? r - 5 - l : 0);
		for (let e of t.segments) e.x += u, e.y += d;
		for (let e of t.traceHistory ?? []) e.x += u, e.y += d;
	}
	for (let t of [...e.eggs, ...e.nutrients]) t.x = q(t.x + i, 35, n - 35), t.y = q(t.y + a, 35, r - 35);
	for (let t of [...e.caustics, ...e.bubbles]) t.x = q(t.x + i, 0, n), t.y = q(t.y + a, 0, r);
}
function Wn(e, t, n = {}) {
	let { prng: r, lineage: i, ...a } = e, o = structuredClone(a), s = structuredClone([...i]), c = (e) => {
		if (e && Array.isArray(e.mouths)) for (let t of e.mouths) {
			let e = (t.mouthType === "carnivore" ? 4.5 : t.mouthType === "omnivore" ? 4 : 3.5) * 2;
			t.intakeLength === void 0 && (t.intakeLength = Math.max(e, t.intakeWidth), t.intakeWidth = e);
		}
	};
	for (let e of o.organisms) c(e.genome);
	for (let e of o.eggs) c(e.genome);
	for (let [, e] of s) c(e.genome);
	let l = {
		schemaVersion: t.nutrientCycle === "decay-v2" ? "19.0.0" : t.nutrientCycle === "decay-v1" ? "18.0.0" : e.selfTubes ? "17.0.0" : "16.0.0",
		build: zn,
		metadata: n,
		settings: {
			...t,
			...e.energyPool ? {
				ecologyRegime: "closed-v1",
				nutrientLimit: t.nutrientLimit ?? null
			} : {},
			physicsRegime: t.physicsRegime ?? "legacy-v0"
		},
		state: {
			...o,
			eggs: o.eggs.map((e) => ({
				...e,
				...Rn(e)
			})),
			prngState: r.getState(),
			lineage: s
		}
	};
	return JSON.parse(JSON.stringify(l));
}
function $(e, t) {
	if (!e) throw Error(`Invalid snapshot: ${t}`);
}
function Gn(e, t = 0) {
	if ($(t < 40, "excessive nesting"), typeof e == "number" && $(Number.isFinite(e), "non-finite number"), e && typeof e == "object") for (let n of Object.values(e)) Gn(n, t + 1);
}
function Kn(e, t = !1) {
	$(e && typeof e == "object", "genome");
	let n = structuredClone(e);
	if (t) for (let e of Array.isArray(n.mouths) ? n.mouths : []) {
		let t = (e.mouthType === "carnivore" ? 4.5 : e.mouthType === "omnivore" ? 4 : 3.5) * 2;
		e.intakeLength === void 0 && (e.intakeLength = Math.max(t, e.intakeWidth), e.intakeWidth = t);
	}
	Gn(n), $(typeof n.id == "string", "genome ID"), $(Array.isArray(n.parts) && n.parts.length >= 1 && n.parts.length <= 7, "body part count"), $(Array.isArray(n.eyes) && Array.isArray(n.mouths) && n.eyes.length + n.mouths.length <= 84, "organ count"), $(n.anatomyVersion === void 0 || n.anatomyVersion === 1, "anatomy version"), $(new Set(n.eyes.map((e) => e.id)).size === n.eyes.length && new Set(n.mouths.map((e) => e.id)).size === n.mouths.length, "duplicate organ IDs"), $(n.brainVersion === void 0 || n.brainVersion === 2 || n.brainVersion === 3 || n.brainVersion === 4 || n.brainVersion === 5 || n.brainVersion === 6 || n.brainVersion === 7, "brain version");
	let r = [
		"NORTH",
		"SOUTH",
		"EAST",
		"WEST"
	], i = /* @__PURE__ */ new Set();
	for (let [e, t] of n.parts.entries()) $(t && typeof t.id == "string" && !i.has(t.id), "part ID"), i.add(t.id), $(Number.isInteger(t.parentIndex) && (e === 0 ? t.parentIndex === -1 : t.parentIndex >= 0 && t.parentIndex < e), "body tree"), $([t.dimN, t.dimM].every((e) => Number.isInteger(e) && e >= 1 && e <= 10), "part dimensions"), $(t.width === t.dimN * 7 && t.height === t.dimM * 7 && r.includes(t.attachmentPoint), "part geometry"), $(Number.isFinite(t.maxAngle) && Number.isFinite(t.baseAngleOffset) && Number.isFinite(t.cpgPhaseOffset) && Number.isFinite(t.cpgAmp) && Number.isFinite(t.cpgFreqMult), "joint parameters"), $(t.oscillatorMix === void 0 || typeof t.oscillatorMix == "number" && Number.isFinite(t.oscillatorMix) && t.oscillatorMix >= 0 && t.oscillatorMix <= 1, "oscillator blend"), $(t.waveHarmonics === void 0 || Array.isArray(t.waveHarmonics) && t.waveHarmonics.length === 4 && t.waveHarmonics.every((e) => typeof e == "number" && Number.isFinite(e) && e >= -1 && e <= 1), "wave harmonics");
	for (let e of [...n.eyes, ...n.mouths]) $(typeof e.id == "string" && Number.isInteger(e.partIndex) && e.partIndex >= 0 && e.partIndex < n.parts.length && r.includes(e.direction), "organ placement");
	for (let e of [...n.eyes, ...n.mouths]) $(e.slot === void 0 || [
		0,
		1,
		2
	].includes(e.slot), "organ slot");
	n.anatomyVersion === 1 && ($(nn(n.parts).length === 0, "body geometry"), $(Dt(n).length === 0, "exclusive face occupancy")), $(n.eyes.every((e) => e.fov > 0 && e.fov <= Math.PI * 2 && e.range > 0 && e.range <= 5e3), "eye parameters"), $(n.eyes.every((e) => e.spectralSensitivity === void 0 || Array.isArray(e.spectralSensitivity) && e.spectralSensitivity.length === 3 && e.spectralSensitivity.every((e) => typeof e == "number" && Number.isFinite(e) && e >= 0 && e <= 1)), "eye spectral sensitivity"), $(n.mouths.every((e) => {
		if (![
			"herbivore",
			"omnivore",
			"carnivore"
		].includes(e.mouthType)) return !1;
		let t = e.mouthType === "carnivore" ? 9 : e.mouthType === "omnivore" ? 8 : 7;
		return Number.isFinite(e.intakeWidth) && e.intakeWidth === t && Number.isFinite(e.intakeLength) && e.intakeLength >= t;
	}), "mouth parameters");
	for (let e of [
		n.weightsIH,
		n.weightsHH,
		n.weightsHO
	]) $(Array.isArray(e) && e.length <= 96 && e.every((e) => Array.isArray(e) && e.length <= 1699 && e.every(Number.isFinite)), "neural weights");
	$(Array.isArray(n.biasesH) && n.biasesH.every(Number.isFinite) && Array.isArray(n.biasesO) && n.biasesO.length <= 36 && n.biasesO.every(Number.isFinite), "neural biases");
	let a = n.biasesH.length;
	if ($(a >= 1 && a <= 96 && n.weightsIH.length === a && n.weightsHH.length === a && n.weightsHH.every((e) => e.length === a), "hidden layer"), n.brainVersion === 5 || n.brainVersion === 6 || n.brainVersion === 7) {
		$(Array.isArray(n.hiddenIds) && n.hiddenIds.length === a && n.hiddenIds.every((e) => typeof e == "string" && e.length > 0 && e.length <= 128) && new Set(n.hiddenIds).size === a, "hidden neuron IDs"), $(Array.isArray(n.disabledConnections) && n.disabledConnections.length <= 65536 && new Set(n.disabledConnections).size === n.disabledConnections.length, "disabled neural edges");
		let e = new Set(n.inputKeys), t = new Set(n.outputKeys), r = new Set(n.hiddenIds);
		for (let i of n.disabledConnections) {
			let n;
			try {
				n = JSON.parse(i);
			} catch {
				$(!1, "neural edge key");
			}
			$(Array.isArray(n) && n.length === 3 && n.every((e) => typeof e == "string"), "neural edge key");
			let [a, o, s] = n;
			$((a === "ih" && r.has(o) && e.has(s) || a === "hh" && r.has(o) && r.has(s) || a === "ho" && t.has(o) && r.has(s)) && i === Q(a, o, s), "neural edge reference");
		}
	}
	if ((n.brainVersion === 6 || n.brainVersion === 7) && $(Array.isArray(n.hiddenTimeConstants) && n.hiddenTimeConstants.length === a && n.hiddenTimeConstants.every((e) => typeof e == "number" && Number.isFinite(e) && e >= 0 && e <= 4), "hidden memory time constants"), $([
		n.motorForce,
		n.motorFrequency,
		n.maturityAge,
		n.incubationTime,
		n.maxLifespan,
		n.metabolicEfficiency,
		n.eggReserveFraction,
		n.reproductionThreshold,
		n.reproductionCooldown,
		n.hue,
		n.saturation,
		n.lightness
	].every(Number.isFinite), "life-history parameters"), $(n.motorForce >= 0 && n.motorForce <= 100 && n.motorFrequency >= 0 && n.motorFrequency <= 20 && n.maturityAge >= 0 && n.maxLifespan > 0 && n.incubationTime > 0 && n.metabolicEfficiency > 0 && Number.isInteger(n.targetClutchSize) && n.targetClutchSize >= 1 && n.targetClutchSize <= 8, "trait bounds"), $(n.plasticityRate === void 0 || typeof n.plasticityRate == "number" && Number.isFinite(n.plasticityRate) && n.plasticityRate >= 0 && n.plasticityRate <= .8, "plastic learning rate"), $(n.forgettingRate === void 0 || typeof n.forgettingRate == "number" && Number.isFinite(n.forgettingRate) && n.forgettingRate >= 0 && n.forgettingRate <= 1, "learned forgetting rate"), $(n.plasticMotorScope === void 0 || n.plasticMotorScope === "angle" || n.plasticMotorScope === "all", "plastic motor scope"), $(n.injuryAversionRate === void 0 || typeof n.injuryAversionRate == "number" && Number.isFinite(n.injuryAversionRate) && n.injuryAversionRate >= 0 && n.injuryAversionRate <= 1, "injury aversion rate"), $(n.sensoryPlasticityRate === void 0 || typeof n.sensoryPlasticityRate == "number" && Number.isFinite(n.sensoryPlasticityRate) && n.sensoryPlasticityRate >= 0 && n.sensoryPlasticityRate <= .8, "sensory plasticity rate"), $(n.memoryConsolidationRate === void 0 || typeof n.memoryConsolidationRate == "number" && Number.isFinite(n.memoryConsolidationRate) && n.memoryConsolidationRate >= 0 && n.memoryConsolidationRate <= 2 && ((n.plasticityRate ?? 0) > 0 || (n.sensoryPlasticityRate ?? 0) > 0), "memory consolidation rate"), $(n.colorMutationRate === void 0 || Number.isFinite(n.colorMutationRate) && n.colorMutationRate >= 0 && n.colorMutationRate <= 1, "pigment variability"), $(Array.isArray(n.parentIds) && n.parentIds.every((e) => typeof e == "string"), "parent IDs"), n.bodyCost = Y(n.parts, n.eyes, n.mouths), n.maxEnergyCapacity = X(n.parts, n.storageTraitMultiplier ?? 1), n.brainVersion === 3 || n.brainVersion === 4 || n.brainVersion === 5 || n.brainVersion === 6 || n.brainVersion === 7) {
		let e = Ft(n, n.brainVersion !== 3, n.brainVersion === 7);
		$(JSON.stringify(n.inputKeys) === JSON.stringify(e.inputs) && JSON.stringify(n.outputKeys) === JSON.stringify(e.outputs), "current neural channel identities");
	}
	$t(n);
	let o = Ft(n);
	$(JSON.stringify(n.inputKeys) === JSON.stringify(o.inputs) && JSON.stringify(n.outputKeys) === JSON.stringify(o.outputs), "neural channel identities"), $(n.weightsIH.every((e) => e.length === o.inputs.length) && n.weightsHO.length === o.outputs.length && n.weightsHO.every((e) => e.length === a) && n.biasesO.length === o.outputs.length, "neural dimensions");
	let s = a * (o.inputs.length + a + o.outputs.length) - n.disabledConnections.length;
	return $(s <= 65536 && s >= 0, "enabled neural edge budget"), n;
}
function qn(e) {
	let t = typeof e == "string" ? ($(e.length <= 25e6, "file exceeds 25 MB"), JSON.parse(e)) : structuredClone(e);
	$(t && typeof t == "object", "document"), $([
		"19.0.0",
		"18.0.0",
		"17.0.0",
		"16.0.0",
		"15.0.0",
		"14.0.0",
		"13.0.0",
		"12.0.0",
		"11.0.0",
		"10.0.0",
		"9.0.0",
		"8.0.0",
		"7.0.0",
		"6.0.0",
		"5.0.0",
		"4.0.0",
		"3.0.0"
	].includes(t.schemaVersion), "unsupported schema");
	let n = t.schemaVersion === "3.0.0", r = n ? t : t.state;
	$(r && typeof r == "object", "state"), Gn(r), t.schemaVersion === "17.0.0" || ["18.0.0", "19.0.0"].includes(t.schemaVersion) && r.selfTubes !== void 0 ? r.selfTubes = i(r.selfTubes) : $(r.selfTubes === void 0, "self-tube topology requires schema 17");
	let a = {
		...Bn,
		targetNutrients: 400,
		maxOrganisms: 100,
		physicsRegime: "legacy-v0",
		...t.settings
	};
	[
		"19.0.0",
		"18.0.0",
		"17.0.0",
		"16.0.0",
		"15.0.0",
		"14.0.0",
		"13.0.0",
		"12.0.0"
	].includes(t.schemaVersion) ? $(t.schemaVersion === "15.0.0" ? t.settings?.physicsRegime === "passive-work-v3" : [
		"16.0.0",
		"17.0.0",
		"18.0.0",
		"19.0.0"
	].includes(t.schemaVersion) ? [
		"legacy-v0",
		"surface-work-v1",
		"paid-work-v2",
		"passive-work-v3"
	].includes(t.settings?.physicsRegime) : [
		"legacy-v0",
		"surface-work-v1",
		"paid-work-v2"
	].includes(t.settings?.physicsRegime), "physics regime") : a.physicsRegime = "legacy-v0", $([
		"15.0.0",
		"16.0.0",
		"17.0.0",
		"18.0.0",
		"19.0.0"
	].includes(t.schemaVersion) ? a.mouthContactModel === void 0 || a.mouthContactModel === "capsule-v1" : t.schemaVersion === "14.0.0" ? a.mouthContactModel === "capsule-v1" : a.mouthContactModel === void 0, "mouth contact model");
	let o = t.schemaVersion === "13.0.0" || [
		"19.0.0",
		"18.0.0",
		"17.0.0",
		"16.0.0",
		"15.0.0",
		"14.0.0"
	].includes(t.schemaVersion) && a.ecologyRegime === "closed-v1";
	if ($(o ? a.ecologyRegime === "closed-v1" && r.energyPool?.regime === "closed-v1" : a.ecologyRegime === void 0 && r.energyPool === void 0, "ecology regime"), $(t.schemaVersion === "19.0.0" ? o && a.nutrientCycle === "decay-v2" : t.schemaVersion === "18.0.0" ? o && a.nutrientCycle === "decay-v1" : a.nutrientCycle === void 0, "nutrient cycle"), o) {
		let e = r.energyPool;
		$(Number.isFinite(e.budget) && e.budget >= 0 && e.budget <= 1e9 && Number.isFinite(e.reserve), "world energy pool"), $(a.nutrientLimit === null || Number.isInteger(a.nutrientLimit) && a.nutrientLimit >= 0 && a.nutrientLimit <= 2200, "nutrient limit");
	}
	for (let [e, t, n] of [
		[
			"worldWidth",
			800,
			4800
		],
		[
			"worldHeight",
			600,
			3e3
		],
		[
			"waterViscosity",
			0,
			.8
		],
		[
			"targetNutrients",
			0,
			800
		],
		[
			"inflowRate",
			0,
			150
		],
		[
			"gravity",
			-200,
			200
		],
		[
			"maxOrganisms",
			1,
			150
		],
		[
			"mutationSeverity",
			0,
			1
		]
	]) $(typeof a[e] == "number" && Number.isFinite(a[e]) && a[e] >= t && a[e] <= n, `setting ${e}`);
	$(Number.isInteger(a.targetNutrients) && Number.isInteger(a.maxOrganisms), "integer settings"), $(a.nutrientPattern === "uniform" || a.nutrientPattern === "blooms", "nutrient distribution"), $(typeof a.kinshipProtection == "boolean", "kinship setting");
	for (let [e, t] of [
		["organisms", 500],
		["eggs", 300],
		["nutrients", 2200],
		["lineage", 2e4]
	]) $(Array.isArray(r[e]) && r[e].length <= (o && e === "nutrients" ? 2201 : t), e);
	$(Array.isArray(r.prngState) && r.prngState.length === 4 && r.prngState.every((e) => Number.isInteger(e) && Number(e) >= 0 && Number(e) <= 4294967295) && r.prngState.some((e) => e !== 0), "PRNG state");
	let s = new De();
	s.setState(r.prngState);
	let c = r.organisms.map((e) => {
		if ([
			"19.0.0",
			"18.0.0",
			"17.0.0",
			"16.0.0",
			"15.0.0",
			"14.0.0",
			"13.0.0",
			"12.0.0",
			"11.0.0"
		].includes(t.schemaVersion) ? $(e.genome.brainVersion === 7, "current brain version") : (t.schemaVersion === "10.0.0" && $(e.genome.brainVersion === 6, "previous brain version"), t.schemaVersion === "9.0.0" && $(e.genome.brainVersion === 5, "previous brain version"), t.schemaVersion === "8.0.0" && $(e.genome.brainVersion === 4, "previous brain version"), en(e)), e.genome = Kn(e.genome, !0), e.motorDiagnostics !== void 0) {
			let t = e.motorDiagnostics;
			$(t && [
				t.positiveWorkJ,
				t.negativeWorkJ,
				t.energyLimitedImpulses,
				t.numericalGuardEvents
			].every((e) => typeof e == "number" && Number.isFinite(e) && e >= 0) && Number.isInteger(t.energyLimitedImpulses) && Number.isInteger(t.numericalGuardEvents) && (t.constraintLimitedBatches === void 0 || Number.isInteger(t.constraintLimitedBatches) && t.constraintLimitedBatches >= 0), "motor diagnostics");
		}
		$(typeof e.id == "string" && Array.isArray(e.segments) && e.segments.length === e.genome.parts.length && Array.isArray(e.joints) && e.joints.length === e.segments.length - 1, "organism articulation"), $(e.segments.every((e) => [
			e.x,
			e.y,
			e.vx,
			e.vy,
			e.angle,
			e.angVel
		].every(Number.isFinite)), "physical state"), $(e.joints.every((e) => [
			e.phase,
			e.targetAngle,
			e.currentRelAngle,
			e.currentRelAngVel,
			e.appliedTorque,
			e.stiffness
		].every(Number.isFinite)), "joint state"), $(e.joints.every((e) => Number.isFinite(e.amplitude) && e.amplitude >= 0 && e.amplitude <= 1.75 && Number.isFinite(e.engagement) && e.engagement >= 0 && e.engagement <= 1), "motor control state"), $(e.plasticityEnergyRate === void 0 || typeof e.plasticityEnergyRate == "number" && Number.isFinite(e.plasticityEnergyRate) && e.plasticityEnergyRate >= 0 && e.plasticityEnergyRate <= 1e6, "plasticity energy meter"), $(e.mouthFeedback && typeof e.mouthFeedback == "object" && !Array.isArray(e.mouthFeedback), "oral feedback"), $(typeof e.biteFeedbackJ == "number" && Number.isFinite(e.biteFeedbackJ) && e.biteFeedbackJ >= 0 && e.biteFeedbackJ <= 1e9, "bite sensory feedback");
		for (let [t, n] of Object.entries(e.mouthFeedback)) $(e.genome.mouths.some((e) => e.id === t) && n && (n.contact === 0 || n.contact === 1) && Number.isFinite(n.intake) && n.intake >= 0 && n.intake <= 1, "oral feedback value");
		if ($(e.energy >= 0 && Number.isFinite(e.energy) && e.structuralBiomass >= 0 && Number.isFinite(e.structuralBiomass) && Number.isFinite(e.age) && Number.isFinite(e.maxLifespan) && typeof e.dissolving == "boolean", "organism state"), $(Array.isArray(e.neuralInputs) && e.neuralInputs.length <= 1699 && e.neuralInputs.every(Number.isFinite) && Array.isArray(e.neuralHidden) && e.neuralHidden.length === e.genome.hiddenIds.length && e.neuralHidden.every(Number.isFinite) && Array.isArray(e.neuralOutputs) && e.neuralOutputs.length <= 36 && e.neuralOutputs.every(Number.isFinite), "activations"), e.learnedMotorWeights !== void 0) {
			$((e.genome.plasticityRate ?? 0) > 0 && Array.isArray(e.learnedMotorWeights) && e.learnedMotorWeights.length <= 96, "somatic learned motor state");
			let t = new Set(e.genome.hiddenIds), n = new Set(e.genome.outputKeys), r = new Set(e.genome.disabledConnections), i = new Set(Vt(e.genome).map((e) => e.edge)), a = /* @__PURE__ */ new Set();
			for (let o of e.learnedMotorWeights) {
				$(o && typeof o.edge == "string" && o.edge.length <= 320 && !a.has(o.edge), "unique plastic synapse ID"), a.add(o.edge);
				let s;
				try {
					s = JSON.parse(o.edge);
				} catch {
					$(!1, "plastic synapse ID");
				}
				$(Array.isArray(s) && s.length === 3 && s[0] === "ho" && typeof s[1] == "string" && n.has(s[1]) && (e.genome.plasticMotorScope === "all" || s[1].endsWith(":Angle")) && typeof s[2] == "string" && t.has(s[2]) && o.edge === Q("ho", s[1], s[2]) && !r.has(o.edge) && i.has(o.edge), "plastic edge identity"), $(typeof o.delta == "number" && Number.isFinite(o.delta) && Math.abs(o.delta) <= .8 && typeof o.eligibility == "number" && Number.isFinite(o.eligibility) && Math.abs(o.eligibility) <= 1, "plastic state bounds"), $(o.consolidation === void 0 || (e.genome.memoryConsolidationRate ?? 0) > 0 && typeof o.consolidation == "number" && Number.isFinite(o.consolidation) && o.consolidation >= 0 && o.consolidation <= 1, "somatic motor consolidation bounds");
			}
		}
		if (e.learnedSensoryWeights !== void 0) {
			$((e.genome.sensoryPlasticityRate ?? 0) > 0 && Array.isArray(e.learnedSensoryWeights) && e.learnedSensoryWeights.length <= 96, "somatic sensory learning state");
			let t = new Set(Ht(e.genome).map((e) => e.edge)), n = /* @__PURE__ */ new Set();
			for (let r of e.learnedSensoryWeights) $(r && typeof r.edge == "string" && r.edge.length <= 320 && t.has(r.edge) && !n.has(r.edge), "learned retina edge identity"), n.add(r.edge), $(typeof r.delta == "number" && Number.isFinite(r.delta) && Math.abs(r.delta) <= .8 && typeof r.eligibility == "number" && Number.isFinite(r.eligibility) && Math.abs(r.eligibility) <= 1, "learned retina state bounds"), $(r.consolidation === void 0 || (e.genome.memoryConsolidationRate ?? 0) > 0 && typeof r.consolidation == "number" && Number.isFinite(r.consolidation) && r.consolidation >= 0 && r.consolidation <= 1, "somatic retinal consolidation bounds");
		}
		return $(e.neuralInputs.length === e.genome.inputKeys.length && e.neuralOutputs.length === e.genome.outputKeys.length, "activation buffer sizes"), e;
	});
	$(new Set(c.map((e) => e.id)).size === c.length, "duplicate organism IDs");
	for (let e of r.eggs) e.genome = Kn(e.genome, !0), $([
		e.x,
		e.y,
		e.vx,
		e.vy,
		e.fundedReserve,
		e.fundedStructural,
		e.incubationProgress,
		e.totalIncubationTime
	].every(Number.isFinite) && (e.hatchHeading === void 0 || Number.isFinite(e.hatchHeading)) && e.fundedReserve >= 0 && e.fundedStructural >= 0 && e.totalIncubationTime > 0, "egg state"), $(e.initialFundedReserve === void 0 || Number.isFinite(e.initialFundedReserve) && e.initialFundedReserve >= 0, "initial egg reserve"), $(e.initialReserveIsLegacy === void 0 || typeof e.initialReserveIsLegacy == "boolean", "egg reserve reference provenance"), Object.assign(e, Rn(e)), o && $(Number.isFinite(e.ageSeconds) && e.ageSeconds >= 0 && Number.isFinite(e.hatchReserveTarget) && e.hatchReserveTarget >= 0 && e.hatchReserveTarget <= e.genome.maxEnergyCapacity && e.incubationProgress >= 0 && e.incubationProgress <= 1, "closed egg state");
	for (let e of r.nutrients) $([
		e.x,
		e.y,
		e.vx,
		e.vy,
		e.energyValue,
		e.radius
	].every(Number.isFinite) && e.energyValue >= 0 && e.radius > 0, "nutrient state"), $(e.kind === void 0 || e.kind === "nutrient" || e.kind === "carrion", "food type"), $(e.decayTimeRemaining === void 0 || Number.isFinite(e.decayTimeRemaining) && e.decayTimeRemaining >= 0 && e.decayTimeRemaining <= 60, "food decay timer"), $(e.kind !== "carrion" || e.decayTimeRemaining !== void 0, "carrion decay timer");
	o && r.nutrients.length > 2200 && $(r.nutrients.some((e) => e.kind === "carrion"), "overflow carrion slot");
	let l = r.ledger;
	$(l && [
		"externalInflow",
		"metabolicDissipation",
		"mechanicalWorkHeat",
		"recordedLosses"
	].every((e) => Number.isFinite(l[e]) && l[e] >= 0), "energy ledger"), $(Number.isFinite(r.simTime) && r.simTime >= 0, "simulation time"), n || ($(Number.isFinite(r.nutrientAccumulator) && r.nutrientAccumulator >= 0, "fractional inflow"), $([r.totalBirths, r.totalDeaths].every((e) => Number.isInteger(e) && e >= 0), "counters"), $(Array.isArray(r.recentDeaths) && r.recentDeaths.length <= 2e3, "death history")), $((r.bubbles ?? []).length <= 1e3 && (r.caustics ?? []).length <= 1e3, "effects count");
	let u = {
		...r,
		organisms: c,
		prng: s,
		lineage: new Map(r.lineage),
		ledger: l,
		bubbles: r.bubbles ?? [],
		caustics: r.caustics ?? [],
		nutrientAccumulator: r.nutrientAccumulator ?? 0,
		totalBirths: r.totalBirths ?? c.length,
		totalDeaths: r.totalDeaths ?? 0,
		recentDeaths: r.recentDeaths ?? []
	};
	delete u.prngState;
	for (let e of u.lineage.values()) e.genome = Kn(e.genome, !0);
	return o && $(Math.abs(Vn(u) - u.energyPool.budget) <= Math.max(1e-5, u.energyPool.budget * 1e-10), "world energy conservation"), {
		state: u,
		settings: a,
		metadata: t.metadata ?? { legacyImport: !0 }
	};
}
//#endregion
//#region ../vidAI/founders.ts
var Jn = /* @__PURE__ */ JSON.parse("[{\"id\":\"FND-001\",\"name\":\"Three-link Darter\",\"family\":\"Axial swimmers\",\"diet\":\"herbivore\",\"seed\":710097,\"morphology\":{\"parts\":[{\"id\":\"FND-001-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":5,\"dimM\":3,\"width\":35,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-001-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":2,\"width\":35,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-001-P2\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":6,\"dimM\":1,\"width\":42,\"height\":7,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-001-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":450,\"slot\":1},{\"id\":\"FND-001-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":450,\"slot\":2}],\"mouths\":[{\"id\":\"FND-001-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":242,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.6,\"motorForce\":2.8},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":18,\"incubationTime\":8,\"reproductionCooldown\":18,\"maxLifespan\":340,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-002\",\"name\":\"Ribbon Eel\",\"family\":\"Axial swimmers\",\"diet\":\"herbivore\",\"seed\":710194,\"morphology\":{\"parts\":[{\"id\":\"FND-002-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":5,\"dimM\":3,\"width\":35,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-002-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":6,\"dimM\":2,\"width\":42,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-002-P2\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":1,\"width\":28,\"height\":7,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-002-P3\",\"parentIndex\":2,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":2,\"width\":35,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-002-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":475,\"slot\":1},{\"id\":\"FND-002-E1\",\"partIndex\":0,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":420,\"slot\":0},{\"id\":\"FND-002-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":475,\"slot\":2},{\"id\":\"FND-002-E1-mirror\",\"partIndex\":0,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":420,\"slot\":0}],\"mouths\":[{\"id\":\"FND-002-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":289,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.75,\"motorForce\":2.8},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":20,\"incubationTime\":9,\"reproductionCooldown\":18,\"maxLifespan\":350,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-003\",\"name\":\"Longtail Threadfin\",\"family\":\"Axial swimmers\",\"diet\":\"herbivore\",\"seed\":710291,\"morphology\":{\"parts\":[{\"id\":\"FND-003-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":6,\"dimM\":3,\"width\":42,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-003-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":2.7289280726364566,\"cpgAmp\":0.6105203804560005,\"cpgFreqMult\":1},{\"id\":\"FND-003-P2\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":1,\"width\":35,\"height\":7,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.176313908854777,\"cpgAmp\":0.8218989646993577,\"cpgFreqMult\":1},{\"id\":\"FND-003-P3\",\"parentIndex\":2,\"attachmentPoint\":\"WEST\",\"dimN\":6,\"dimM\":2,\"width\":42,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.767279077815094,\"cpgAmp\":0.5133053380995989,\"cpgFreqMult\":1},{\"id\":\"FND-003-P4\",\"parentIndex\":3,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":1,\"width\":28,\"height\":7,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":5.339504201587977,\"cpgAmp\":0.7015173849649727,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-003-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":500,\"slot\":1},{\"id\":\"FND-003-E1\",\"partIndex\":0,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":440,\"slot\":0},{\"id\":\"FND-003-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":500,\"slot\":2},{\"id\":\"FND-003-E1-mirror\",\"partIndex\":0,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":440,\"slot\":0}],\"mouths\":[{\"id\":\"FND-003-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":336,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.9,\"motorForce\":2.8},\"lifeHistory\":{\"targetClutchSize\":3,\"maturityAge\":22,\"incubationTime\":10,\"reproductionCooldown\":18,\"maxLifespan\":360,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-004\",\"name\":\"Six-link Whip\",\"family\":\"Axial swimmers\",\"diet\":\"omnivore\",\"seed\":710388,\"morphology\":{\"parts\":[{\"id\":\"FND-004-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":6,\"dimM\":3,\"width\":42,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-004-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":2,\"width\":35,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-004-P2\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":6,\"dimM\":1,\"width\":42,\"height\":7,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-004-P3\",\"parentIndex\":2,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-004-P4\",\"parentIndex\":3,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":1,\"width\":35,\"height\":7,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-004-P5\",\"parentIndex\":4,\"attachmentPoint\":\"WEST\",\"dimN\":6,\"dimM\":2,\"width\":42,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-004-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":525,\"slot\":1},{\"id\":\"FND-004-E1\",\"partIndex\":0,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":460,\"slot\":0},{\"id\":\"FND-004-E2\",\"partIndex\":0,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":460,\"slot\":0},{\"id\":\"FND-004-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":525,\"slot\":2}],\"mouths\":[{\"id\":\"FND-004-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":8,\"mouthType\":\"omnivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":23,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":3.05,\"motorForce\":2.8},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":24,\"incubationTime\":11,\"reproductionCooldown\":18,\"maxLifespan\":370,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-005\",\"name\":\"Seven-link Streamer\",\"family\":\"Axial swimmers\",\"diet\":\"carnivore\",\"seed\":710485,\"morphology\":{\"parts\":[{\"id\":\"FND-005-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":7,\"dimM\":3,\"width\":49,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-005-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":6,\"dimM\":2,\"width\":42,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.5702450098009995,\"cpgAmp\":0.4776282556355,\"cpgFreqMult\":1},{\"id\":\"FND-005-P2\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":1,\"width\":28,\"height\":7,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":2.852546888599193,\"cpgAmp\":0.5893327194266021,\"cpgFreqMult\":1},{\"id\":\"FND-005-P3\",\"parentIndex\":2,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":2,\"width\":35,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.1491718507566344,\"cpgAmp\":0.47162065012380483,\"cpgFreqMult\":1},{\"id\":\"FND-005-P4\",\"parentIndex\":3,\"attachmentPoint\":\"WEST\",\"dimN\":6,\"dimM\":1,\"width\":42,\"height\":7,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":5.083290382282557,\"cpgAmp\":0.8365028201602399,\"cpgFreqMult\":1},{\"id\":\"FND-005-P5\",\"parentIndex\":4,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":2.208301797845224,\"cpgAmp\":0.47891896357759833,\"cpgFreqMult\":1},{\"id\":\"FND-005-P6\",\"parentIndex\":5,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":1,\"width\":35,\"height\":7,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0.3508464349622807,\"cpgAmp\":0.5121861138381064,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-005-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":550,\"slot\":1},{\"id\":\"FND-005-E1\",\"partIndex\":0,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":480,\"slot\":0},{\"id\":\"FND-005-E2\",\"partIndex\":0,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":480,\"slot\":0},{\"id\":\"FND-005-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":550,\"slot\":2}],\"mouths\":[{\"id\":\"FND-005-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":9,\"mouthType\":\"carnivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":180,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":3.2,\"motorForce\":2.8},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":26,\"incubationTime\":12,\"reproductionCooldown\":18,\"maxLifespan\":380,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-006\",\"name\":\"Twin Oar\",\"family\":\"Paired paddles\",\"diet\":\"herbivore\",\"seed\":710582,\"morphology\":{\"parts\":[{\"id\":\"FND-006-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":4,\"width\":28,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-006-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-006-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-006-P3\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-006-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":450,\"slot\":1},{\"id\":\"FND-006-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":450,\"slot\":2}],\"mouths\":[{\"id\":\"FND-006-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":23.8}],\"hue\":227,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.6,\"motorForce\":2.8299999999999996},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":18,\"incubationTime\":8,\"reproductionCooldown\":18,\"maxLifespan\":340,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-007\",\"name\":\"Broadwing Skater\",\"family\":\"Paired paddles\",\"diet\":\"herbivore\",\"seed\":710679,\"morphology\":{\"parts\":[{\"id\":\"FND-007-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":4,\"width\":28,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-007-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.562346781541995,\"cpgAmp\":0.6750847885385156,\"cpgFreqMult\":1},{\"id\":\"FND-007-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":5.712177448901746,\"cpgAmp\":0.6575729916803539,\"cpgFreqMult\":1},{\"id\":\"FND-007-P3\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":2,\"width\":35,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":2.293926094589443,\"cpgAmp\":0.5399830448441207,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-007-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":475,\"slot\":1},{\"id\":\"FND-007-E1\",\"partIndex\":1,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":420,\"slot\":0},{\"id\":\"FND-007-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":475,\"slot\":2},{\"id\":\"FND-007-E1-mirror\",\"partIndex\":2,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":420,\"slot\":0}],\"mouths\":[{\"id\":\"FND-007-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":23.8}],\"hue\":164,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.75,\"motorForce\":2.8299999999999996},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":20,\"incubationTime\":9,\"reproductionCooldown\":18,\"maxLifespan\":350,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-008\",\"name\":\"Forktail Paddler\",\"family\":\"Paired paddles\",\"diet\":\"herbivore\",\"seed\":710776,\"morphology\":{\"parts\":[{\"id\":\"FND-008-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":4,\"width\":28,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-008-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":5,\"width\":14,\"height\":35,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-008-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":5,\"width\":14,\"height\":35,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-008-P3\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-008-P4\",\"parentIndex\":3,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":2,\"width\":21,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-008-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":500,\"slot\":1},{\"id\":\"FND-008-E1\",\"partIndex\":1,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":440,\"slot\":0},{\"id\":\"FND-008-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":500,\"slot\":2},{\"id\":\"FND-008-E1-mirror\",\"partIndex\":2,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":440,\"slot\":0}],\"mouths\":[{\"id\":\"FND-008-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":23.8}],\"hue\":211,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.9,\"motorForce\":2.8299999999999996},\"lifeHistory\":{\"targetClutchSize\":3,\"maturityAge\":22,\"incubationTime\":10,\"reproductionCooldown\":18,\"maxLifespan\":360,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-009\",\"name\":\"Doubletail Rowfish\",\"family\":\"Paired paddles\",\"diet\":\"omnivore\",\"seed\":710873,\"morphology\":{\"parts\":[{\"id\":\"FND-009-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":4,\"width\":28,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-009-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-009-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-009-P3\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":2,\"width\":35,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-009-P4\",\"parentIndex\":3,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":2,\"width\":21,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-009-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":525,\"slot\":1},{\"id\":\"FND-009-E1\",\"partIndex\":1,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":460,\"slot\":0},{\"id\":\"FND-009-E2\",\"partIndex\":2,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":460,\"slot\":0},{\"id\":\"FND-009-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":525,\"slot\":2}],\"mouths\":[{\"id\":\"FND-009-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":8,\"mouthType\":\"omnivore\",\"slot\":0,\"intakeLength\":23.8}],\"hue\":258,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":3.05,\"motorForce\":2.8299999999999996},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":24,\"incubationTime\":11,\"reproductionCooldown\":18,\"maxLifespan\":370,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-010\",\"name\":\"Nosecone Ray\",\"family\":\"Paired paddles\",\"diet\":\"carnivore\",\"seed\":710970,\"morphology\":{\"parts\":[{\"id\":\"FND-010-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":4,\"width\":28,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-010-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-010-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-010-P3\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-010-P4\",\"parentIndex\":3,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":2,\"width\":21,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-010-P5\",\"parentIndex\":0,\"attachmentPoint\":\"EAST\",\"dimN\":2,\"dimM\":2,\"width\":14,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-010-E0\",\"partIndex\":5,\"direction\":\"EAST\",\"fov\":2,\"range\":550,\"slot\":1},{\"id\":\"FND-010-E1\",\"partIndex\":1,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":480,\"slot\":0},{\"id\":\"FND-010-E2\",\"partIndex\":2,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":480,\"slot\":0},{\"id\":\"FND-010-E0-mirror\",\"partIndex\":5,\"direction\":\"EAST\",\"fov\":2,\"range\":550,\"slot\":2}],\"mouths\":[{\"id\":\"FND-010-M0\",\"partIndex\":5,\"direction\":\"EAST\",\"intakeWidth\":9,\"mouthType\":\"carnivore\",\"slot\":0,\"intakeLength\":11.9}],\"hue\":305,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":3.2,\"motorForce\":2.8299999999999996},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":26,\"incubationTime\":12,\"reproductionCooldown\":18,\"maxLifespan\":380,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-011\",\"name\":\"Four-oar Cruiser\",\"family\":\"Four paddles\",\"diet\":\"herbivore\",\"seed\":711067,\"morphology\":{\"parts\":[{\"id\":\"FND-011-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":5,\"dimM\":3,\"width\":35,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-011-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":3,\"width\":28,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.909585686233683,\"cpgAmp\":0.4923393287695944,\"cpgFreqMult\":1},{\"id\":\"FND-011-P2\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":1,\"dimM\":3,\"width\":7,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.3138975487639097,\"cpgAmp\":0.5897018808871508,\"cpgFreqMult\":1},{\"id\":\"FND-011-P3\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":1,\"dimM\":3,\"width\":7,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.3608389355582309,\"cpgAmp\":0.45822955984622243,\"cpgFreqMult\":1},{\"id\":\"FND-011-P4\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":1,\"dimM\":4,\"width\":7,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.8049283559051215,\"cpgAmp\":0.4864461523480713,\"cpgFreqMult\":1},{\"id\":\"FND-011-P5\",\"parentIndex\":1,\"attachmentPoint\":\"SOUTH\",\"dimN\":1,\"dimM\":4,\"width\":7,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.9925335965192799,\"cpgAmp\":0.4865429958328605,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-011-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":450,\"slot\":1},{\"id\":\"FND-011-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":450,\"slot\":2}],\"mouths\":[{\"id\":\"FND-011-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":352,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.6,\"motorForce\":2.86},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":18,\"incubationTime\":8,\"reproductionCooldown\":18,\"maxLifespan\":340,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-012\",\"name\":\"Longfin Quadrant\",\"family\":\"Four paddles\",\"diet\":\"herbivore\",\"seed\":711164,\"morphology\":{\"parts\":[{\"id\":\"FND-012-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":6,\"dimM\":3,\"width\":42,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-012-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":3,\"width\":35,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":2.32369324006482,\"cpgAmp\":0.484894800465554,\"cpgFreqMult\":1},{\"id\":\"FND-012-P2\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":5.124411660680287,\"cpgAmp\":0.6522529143840075,\"cpgFreqMult\":1},{\"id\":\"FND-012-P3\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.944101021149829,\"cpgAmp\":0.6762348764576018,\"cpgFreqMult\":1},{\"id\":\"FND-012-P4\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":5,\"width\":14,\"height\":35,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":5.507070283559314,\"cpgAmp\":0.6742489066906273,\"cpgFreqMult\":1},{\"id\":\"FND-012-P5\",\"parentIndex\":1,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":5,\"width\":14,\"height\":35,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":5.780677411777295,\"cpgAmp\":0.6107367903925478,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-012-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":475,\"slot\":1},{\"id\":\"FND-012-E1\",\"partIndex\":4,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":420,\"slot\":0},{\"id\":\"FND-012-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":475,\"slot\":2},{\"id\":\"FND-012-E1-mirror\",\"partIndex\":5,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":420,\"slot\":0}],\"mouths\":[{\"id\":\"FND-012-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":39,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.75,\"motorForce\":2.86},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":20,\"incubationTime\":9,\"reproductionCooldown\":18,\"maxLifespan\":350,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-013\",\"name\":\"Widewake Paddler\",\"family\":\"Four paddles\",\"diet\":\"herbivore\",\"seed\":711261,\"morphology\":{\"parts\":[{\"id\":\"FND-013-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":5,\"dimM\":3,\"width\":35,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-013-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":6,\"dimM\":3,\"width\":42,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0.4031559074846337,\"cpgAmp\":0.45233497582376003,\"cpgFreqMult\":1},{\"id\":\"FND-013-P2\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":1,\"dimM\":5,\"width\":7,\"height\":35,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0.35245592280390964,\"cpgAmp\":0.6670645072124899,\"cpgFreqMult\":1},{\"id\":\"FND-013-P3\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":1,\"dimM\":5,\"width\":7,\"height\":35,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.92847868282816,\"cpgAmp\":0.6937830456532538,\"cpgFreqMult\":1},{\"id\":\"FND-013-P4\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":1,\"dimM\":3,\"width\":7,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":6.10496488938954,\"cpgAmp\":0.46213264726102354,\"cpgFreqMult\":1},{\"id\":\"FND-013-P5\",\"parentIndex\":1,\"attachmentPoint\":\"SOUTH\",\"dimN\":1,\"dimM\":3,\"width\":7,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.020528192691533,\"cpgAmp\":0.5296065983362496,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-013-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":500,\"slot\":1},{\"id\":\"FND-013-E1\",\"partIndex\":2,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":440,\"slot\":0},{\"id\":\"FND-013-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":500,\"slot\":2},{\"id\":\"FND-013-E1-mirror\",\"partIndex\":3,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":440,\"slot\":0}],\"mouths\":[{\"id\":\"FND-013-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":196,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.9,\"motorForce\":2.86},\"lifeHistory\":{\"targetClutchSize\":3,\"maturityAge\":22,\"incubationTime\":10,\"reproductionCooldown\":18,\"maxLifespan\":360,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-014\",\"name\":\"Fourfin Comet\",\"family\":\"Four paddles\",\"diet\":\"omnivore\",\"seed\":711358,\"morphology\":{\"parts\":[{\"id\":\"FND-014-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":6,\"dimM\":3,\"width\":42,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-014-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":3,\"width\":28,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":2.76616904567818,\"cpgAmp\":0.7041294796392321,\"cpgFreqMult\":1},{\"id\":\"FND-014-P2\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.153652783686237,\"cpgAmp\":0.8125658322125673,\"cpgFreqMult\":1},{\"id\":\"FND-014-P3\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0.01849874540414116,\"cpgAmp\":0.799638690892607,\"cpgFreqMult\":1},{\"id\":\"FND-014-P4\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.3455424783308174,\"cpgAmp\":0.7175243866629899,\"cpgFreqMult\":1},{\"id\":\"FND-014-P5\",\"parentIndex\":1,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":2.3060843321374103,\"cpgAmp\":0.6638885816559196,\"cpgFreqMult\":1},{\"id\":\"FND-014-P6\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":2,\"width\":21,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.5595548345719115,\"cpgAmp\":0.6019649595953525,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-014-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":525,\"slot\":1},{\"id\":\"FND-014-E1\",\"partIndex\":4,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":460,\"slot\":0},{\"id\":\"FND-014-E2\",\"partIndex\":5,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":460,\"slot\":0},{\"id\":\"FND-014-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":525,\"slot\":2}],\"mouths\":[{\"id\":\"FND-014-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":8,\"mouthType\":\"omnivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":243,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":3.05,\"motorForce\":2.86},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":24,\"incubationTime\":11,\"reproductionCooldown\":18,\"maxLifespan\":370,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-015\",\"name\":\"Seven-part Rowfish\",\"family\":\"Four paddles\",\"diet\":\"carnivore\",\"seed\":711455,\"morphology\":{\"parts\":[{\"id\":\"FND-015-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":5,\"dimM\":3,\"width\":35,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-015-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":3,\"width\":35,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-015-P2\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":1,\"dimM\":4,\"width\":7,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-015-P3\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":1,\"dimM\":4,\"width\":7,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-015-P4\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":1,\"dimM\":5,\"width\":7,\"height\":35,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-015-P5\",\"parentIndex\":1,\"attachmentPoint\":\"SOUTH\",\"dimN\":1,\"dimM\":5,\"width\":7,\"height\":35,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-015-P6\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":2,\"width\":21,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-015-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":550,\"slot\":1},{\"id\":\"FND-015-E1\",\"partIndex\":4,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":480,\"slot\":0},{\"id\":\"FND-015-E2\",\"partIndex\":5,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":480,\"slot\":0},{\"id\":\"FND-015-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":550,\"slot\":2}],\"mouths\":[{\"id\":\"FND-015-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":9,\"mouthType\":\"carnivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":180,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":3.2,\"motorForce\":2.86},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":26,\"incubationTime\":12,\"reproductionCooldown\":18,\"maxLifespan\":380,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-016\",\"name\":\"Forktail Grazer\",\"family\":\"Forked bodies\",\"diet\":\"herbivore\",\"seed\":711552,\"morphology\":{\"parts\":[{\"id\":\"FND-016-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":3,\"width\":28,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-016-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":3,\"width\":28,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":2.5683659187039787,\"cpgAmp\":0.45486670192331075,\"cpgFreqMult\":1},{\"id\":\"FND-016-P2\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":5.660293141334934,\"cpgAmp\":0.76204279884696,\"cpgFreqMult\":1},{\"id\":\"FND-016-P3\",\"parentIndex\":1,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.328533058536212,\"cpgAmp\":0.7019415265880524,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-016-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":450,\"slot\":1},{\"id\":\"FND-016-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":450,\"slot\":2}],\"mouths\":[{\"id\":\"FND-016-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":227,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.6,\"motorForce\":2.8899999999999997},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":18,\"incubationTime\":8,\"reproductionCooldown\":18,\"maxLifespan\":340,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-017\",\"name\":\"Highfork Drifter\",\"family\":\"Forked bodies\",\"diet\":\"herbivore\",\"seed\":711649,\"morphology\":{\"parts\":[{\"id\":\"FND-017-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":3,\"width\":28,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-017-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":3,\"width\":28,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-017-P2\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-017-P3\",\"parentIndex\":1,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-017-P4\",\"parentIndex\":2,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-017-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":475,\"slot\":1},{\"id\":\"FND-017-E1\",\"partIndex\":4,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":420,\"slot\":0}],\"mouths\":[{\"id\":\"FND-017-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":274,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.75,\"motorForce\":2.8899999999999997},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":20,\"incubationTime\":9,\"reproductionCooldown\":18,\"maxLifespan\":350,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-018\",\"name\":\"Trident Swimmer\",\"family\":\"Forked bodies\",\"diet\":\"herbivore\",\"seed\":711746,\"morphology\":{\"parts\":[{\"id\":\"FND-018-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":3,\"width\":28,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-018-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":3,\"width\":28,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":5.836292649060876,\"cpgAmp\":0.4597616222687066,\"cpgFreqMult\":1},{\"id\":\"FND-018-P2\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.082846814041204,\"cpgAmp\":0.4844166207127273,\"cpgFreqMult\":1},{\"id\":\"FND-018-P3\",\"parentIndex\":1,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.894393653785312,\"cpgAmp\":0.8181128236465156,\"cpgFreqMult\":1},{\"id\":\"FND-018-P4\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":2,\"width\":21,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.2568292227476359,\"cpgAmp\":0.8343099242076277,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-018-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":500,\"slot\":1},{\"id\":\"FND-018-E1\",\"partIndex\":2,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":440,\"slot\":0},{\"id\":\"FND-018-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":500,\"slot\":2},{\"id\":\"FND-018-E1-mirror\",\"partIndex\":3,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":440,\"slot\":0}],\"mouths\":[{\"id\":\"FND-018-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":321,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.9,\"motorForce\":2.8899999999999997},\"lifeHistory\":{\"targetClutchSize\":3,\"maturityAge\":22,\"incubationTime\":10,\"reproductionCooldown\":18,\"maxLifespan\":360,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-019\",\"name\":\"Extended Fork\",\"family\":\"Forked bodies\",\"diet\":\"omnivore\",\"seed\":711843,\"morphology\":{\"parts\":[{\"id\":\"FND-019-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":3,\"width\":28,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-019-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":3,\"width\":28,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.550906879195573,\"cpgAmp\":0.660418102145195,\"cpgFreqMult\":1},{\"id\":\"FND-019-P2\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.660653397458571,\"cpgAmp\":0.5960560032166541,\"cpgFreqMult\":1},{\"id\":\"FND-019-P3\",\"parentIndex\":1,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.4784590939728022,\"cpgAmp\":0.8214369291439652,\"cpgFreqMult\":1},{\"id\":\"FND-019-P4\",\"parentIndex\":2,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.7048236659144012,\"cpgAmp\":0.7583429844118654,\"cpgFreqMult\":1},{\"id\":\"FND-019-P5\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":2,\"width\":21,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.698859669680307,\"cpgAmp\":0.4862351491115987,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-019-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":525,\"slot\":1},{\"id\":\"FND-019-E1\",\"partIndex\":4,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":460,\"slot\":0},{\"id\":\"FND-019-E2\",\"partIndex\":3,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":460,\"slot\":0}],\"mouths\":[{\"id\":\"FND-019-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":8,\"mouthType\":\"omnivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":8,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":3.05,\"motorForce\":2.8899999999999997},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":24,\"incubationTime\":11,\"reproductionCooldown\":18,\"maxLifespan\":370,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-020\",\"name\":\"Broadstem Trident\",\"family\":\"Forked bodies\",\"diet\":\"carnivore\",\"seed\":711940,\"morphology\":{\"parts\":[{\"id\":\"FND-020-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":5,\"dimM\":3,\"width\":35,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-020-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":3,\"width\":28,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-020-P2\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-020-P3\",\"parentIndex\":1,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-020-P4\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":2,\"width\":21,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-020-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":550,\"slot\":1},{\"id\":\"FND-020-E1\",\"partIndex\":2,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":480,\"slot\":0},{\"id\":\"FND-020-E2\",\"partIndex\":3,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":480,\"slot\":0},{\"id\":\"FND-020-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":550,\"slot\":2}],\"mouths\":[{\"id\":\"FND-020-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":9,\"mouthType\":\"carnivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":55,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":3.2,\"motorForce\":2.8899999999999997},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":26,\"incubationTime\":12,\"reproductionCooldown\":18,\"maxLifespan\":380,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-021\",\"name\":\"Fourway Fan\",\"family\":\"Radial fans\",\"diet\":\"herbivore\",\"seed\":712037,\"morphology\":{\"parts\":[{\"id\":\"FND-021-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-021-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.549787760031196,\"cpgAmp\":0.8100813755765557,\"cpgFreqMult\":1},{\"id\":\"FND-021-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":5.090897089623878,\"cpgAmp\":0.64905921574682,\"cpgFreqMult\":1},{\"id\":\"FND-021-P3\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":2.625470377333892,\"cpgAmp\":0.6581815992482006,\"cpgFreqMult\":1},{\"id\":\"FND-021-P4\",\"parentIndex\":0,\"attachmentPoint\":\"EAST\",\"dimN\":5,\"dimM\":2,\"width\":35,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":2.134249986250034,\"cpgAmp\":0.48791694566607474,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-021-E0\",\"partIndex\":4,\"direction\":\"EAST\",\"fov\":2,\"range\":450,\"slot\":1},{\"id\":\"FND-021-E0-mirror\",\"partIndex\":4,\"direction\":\"EAST\",\"fov\":2,\"range\":450,\"slot\":2}],\"mouths\":[{\"id\":\"FND-021-M0\",\"partIndex\":4,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":11.9}],\"hue\":212,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.6,\"motorForce\":2.92},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":18,\"incubationTime\":8,\"reproductionCooldown\":18,\"maxLifespan\":340,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-022\",\"name\":\"Crossfin Rover\",\"family\":\"Radial fans\",\"diet\":\"herbivore\",\"seed\":712134,\"morphology\":{\"parts\":[{\"id\":\"FND-022-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":4,\"width\":28,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-022-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":5,\"width\":14,\"height\":35,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-022-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":5,\"width\":14,\"height\":35,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-022-P3\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":2,\"width\":35,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-022-P4\",\"parentIndex\":0,\"attachmentPoint\":\"EAST\",\"dimN\":6,\"dimM\":2,\"width\":42,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-022-E0\",\"partIndex\":4,\"direction\":\"EAST\",\"fov\":2,\"range\":475,\"slot\":1},{\"id\":\"FND-022-E1\",\"partIndex\":1,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":420,\"slot\":0},{\"id\":\"FND-022-E0-mirror\",\"partIndex\":4,\"direction\":\"EAST\",\"fov\":2,\"range\":475,\"slot\":2},{\"id\":\"FND-022-E1-mirror\",\"partIndex\":2,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":420,\"slot\":0}],\"mouths\":[{\"id\":\"FND-022-M0\",\"partIndex\":4,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":11.9}],\"hue\":259,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.75,\"motorForce\":2.92},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":20,\"incubationTime\":9,\"reproductionCooldown\":18,\"maxLifespan\":350,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-023\",\"name\":\"Uneven Star\",\"family\":\"Radial fans\",\"diet\":\"herbivore\",\"seed\":712231,\"morphology\":{\"parts\":[{\"id\":\"FND-023-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-023-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":5.1023113879780775,\"cpgAmp\":0.5380301176570356,\"cpgFreqMult\":1},{\"id\":\"FND-023-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":5,\"width\":14,\"height\":35,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0.06768283535319355,\"cpgAmp\":0.5807928865775466,\"cpgFreqMult\":1},{\"id\":\"FND-023-P3\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":6,\"dimM\":2,\"width\":42,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.647171823234033,\"cpgAmp\":0.6403530878014863,\"cpgFreqMult\":1},{\"id\":\"FND-023-P4\",\"parentIndex\":0,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0.6439324285874776,\"cpgAmp\":0.7280282204039394,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-023-E0\",\"partIndex\":4,\"direction\":\"EAST\",\"fov\":2,\"range\":500,\"slot\":1},{\"id\":\"FND-023-E1\",\"partIndex\":1,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":440,\"slot\":0}],\"mouths\":[{\"id\":\"FND-023-M0\",\"partIndex\":4,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":11.9}],\"hue\":196,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.9,\"motorForce\":2.92},\"lifeHistory\":{\"targetClutchSize\":3,\"maturityAge\":22,\"incubationTime\":10,\"reproductionCooldown\":18,\"maxLifespan\":360,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-024\",\"name\":\"Tallstar Browser\",\"family\":\"Radial fans\",\"diet\":\"omnivore\",\"seed\":712328,\"morphology\":{\"parts\":[{\"id\":\"FND-024-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":4,\"width\":28,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-024-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":5,\"width\":14,\"height\":35,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":5.718747787039844,\"cpgAmp\":0.7290720041841268,\"cpgFreqMult\":1},{\"id\":\"FND-024-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":2.630708424273858,\"cpgAmp\":0.7597522739320993,\"cpgFreqMult\":1},{\"id\":\"FND-024-P3\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":6.217005982956524,\"cpgAmp\":0.47894758051261305,\"cpgFreqMult\":1},{\"id\":\"FND-024-P4\",\"parentIndex\":0,\"attachmentPoint\":\"EAST\",\"dimN\":5,\"dimM\":2,\"width\":35,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":2.8042162577429948,\"cpgAmp\":0.6710017326287925,\"cpgFreqMult\":1},{\"id\":\"FND-024-P5\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":2,\"width\":14,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.0529623176662626,\"cpgAmp\":0.7232848472893239,\"cpgFreqMult\":1},{\"id\":\"FND-024-P6\",\"parentIndex\":2,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":2,\"width\":14,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":6.194554971256055,\"cpgAmp\":0.7232848472893239,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-024-E0\",\"partIndex\":4,\"direction\":\"EAST\",\"fov\":2,\"range\":525,\"slot\":1},{\"id\":\"FND-024-E1\",\"partIndex\":5,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":460,\"slot\":0},{\"id\":\"FND-024-E2\",\"partIndex\":2,\"direction\":\"EAST\",\"fov\":1.8,\"range\":460,\"slot\":0}],\"mouths\":[{\"id\":\"FND-024-M0\",\"partIndex\":4,\"direction\":\"EAST\",\"intakeWidth\":8,\"mouthType\":\"omnivore\",\"slot\":0,\"intakeLength\":11.9}],\"hue\":243,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":3.05,\"motorForce\":2.92},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":24,\"incubationTime\":11,\"reproductionCooldown\":18,\"maxLifespan\":370,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-025\",\"name\":\"Six-arm Fan\",\"family\":\"Radial fans\",\"diet\":\"carnivore\",\"seed\":712425,\"morphology\":{\"parts\":[{\"id\":\"FND-025-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-025-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-025-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":5,\"width\":14,\"height\":35,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-025-P3\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":2,\"width\":35,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-025-P4\",\"parentIndex\":0,\"attachmentPoint\":\"EAST\",\"dimN\":6,\"dimM\":2,\"width\":42,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-025-P5\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":2,\"width\":14,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-025-P6\",\"parentIndex\":4,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-025-E0\",\"partIndex\":4,\"direction\":\"EAST\",\"fov\":2,\"range\":550,\"slot\":1},{\"id\":\"FND-025-E1\",\"partIndex\":5,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":480,\"slot\":0},{\"id\":\"FND-025-E2\",\"partIndex\":2,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":480,\"slot\":0}],\"mouths\":[{\"id\":\"FND-025-M0\",\"partIndex\":4,\"direction\":\"EAST\",\"intakeWidth\":9,\"mouthType\":\"carnivore\",\"slot\":0,\"intakeLength\":11.9}],\"hue\":290,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":3.2,\"motorForce\":2.92},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":26,\"incubationTime\":12,\"reproductionCooldown\":18,\"maxLifespan\":380,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-026\",\"name\":\"T-head Drifter\",\"family\":\"Hammerheads\",\"diet\":\"herbivore\",\"seed\":712522,\"morphology\":{\"parts\":[{\"id\":\"FND-026-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-026-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":3,\"dimM\":2,\"width\":21,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-026-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":3,\"dimM\":2,\"width\":21,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-026-P3\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-026-P4\",\"parentIndex\":3,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":1,\"width\":35,\"height\":7,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-026-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":450,\"slot\":1},{\"id\":\"FND-026-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":450,\"slot\":2}],\"mouths\":[{\"id\":\"FND-026-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":337,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.6,\"motorForce\":2.9499999999999997},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":18,\"incubationTime\":8,\"reproductionCooldown\":18,\"maxLifespan\":340,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-027\",\"name\":\"Widecap Darter\",\"family\":\"Hammerheads\",\"diet\":\"herbivore\",\"seed\":712619,\"morphology\":{\"parts\":[{\"id\":\"FND-027-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-027-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-027-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-027-P3\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-027-P4\",\"parentIndex\":3,\"attachmentPoint\":\"WEST\",\"dimN\":6,\"dimM\":2,\"width\":42,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-027-E0\",\"partIndex\":1,\"direction\":\"EAST\",\"fov\":2,\"range\":475,\"slot\":1},{\"id\":\"FND-027-E1\",\"partIndex\":1,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":420,\"slot\":0},{\"id\":\"FND-027-E0-mirror\",\"partIndex\":2,\"direction\":\"EAST\",\"fov\":2,\"range\":475,\"slot\":2},{\"id\":\"FND-027-E1-mirror\",\"partIndex\":2,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":420,\"slot\":0}],\"mouths\":[{\"id\":\"FND-027-M0\",\"partIndex\":1,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":11.9}],\"hue\":24,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.75,\"motorForce\":2.9499999999999997},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":20,\"incubationTime\":9,\"reproductionCooldown\":18,\"maxLifespan\":350,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-028\",\"name\":\"Longcap Browser\",\"family\":\"Hammerheads\",\"diet\":\"herbivore\",\"seed\":712716,\"morphology\":{\"parts\":[{\"id\":\"FND-028-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-028-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":5,\"dimM\":2,\"width\":35,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-028-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":5,\"dimM\":2,\"width\":35,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-028-P3\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-028-P4\",\"parentIndex\":3,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":1,\"width\":35,\"height\":7,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-028-E0\",\"partIndex\":1,\"direction\":\"EAST\",\"fov\":2,\"range\":500,\"slot\":1},{\"id\":\"FND-028-E1\",\"partIndex\":1,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":440,\"slot\":0},{\"id\":\"FND-028-E0-mirror\",\"partIndex\":2,\"direction\":\"EAST\",\"fov\":2,\"range\":500,\"slot\":2},{\"id\":\"FND-028-E1-mirror\",\"partIndex\":2,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":440,\"slot\":0}],\"mouths\":[{\"id\":\"FND-028-M0\",\"partIndex\":1,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":11.9}],\"hue\":181,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.9,\"motorForce\":2.9499999999999997},\"lifeHistory\":{\"targetClutchSize\":3,\"maturityAge\":22,\"incubationTime\":10,\"reproductionCooldown\":18,\"maxLifespan\":360,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-029\",\"name\":\"Crested Hammer\",\"family\":\"Hammerheads\",\"diet\":\"omnivore\",\"seed\":712813,\"morphology\":{\"parts\":[{\"id\":\"FND-029-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-029-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":3,\"dimM\":2,\"width\":21,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-029-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":3,\"dimM\":2,\"width\":21,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-029-P3\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-029-P4\",\"parentIndex\":3,\"attachmentPoint\":\"WEST\",\"dimN\":6,\"dimM\":2,\"width\":42,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-029-P5\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-029-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":525,\"slot\":1},{\"id\":\"FND-029-E1\",\"partIndex\":5,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":460,\"slot\":0},{\"id\":\"FND-029-E2\",\"partIndex\":2,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":460,\"slot\":0}],\"mouths\":[{\"id\":\"FND-029-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":8,\"mouthType\":\"omnivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":228,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":3.05,\"motorForce\":2.9499999999999997},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":24,\"incubationTime\":11,\"reproductionCooldown\":18,\"maxLifespan\":370,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-030\",\"name\":\"Longtail Hammer\",\"family\":\"Hammerheads\",\"diet\":\"carnivore\",\"seed\":712910,\"morphology\":{\"parts\":[{\"id\":\"FND-030-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-030-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.413348063147308,\"cpgAmp\":0.6730180941522121,\"cpgFreqMult\":1},{\"id\":\"FND-030-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":2.750197308391213,\"cpgAmp\":0.5856768147088587,\"cpgFreqMult\":1},{\"id\":\"FND-030-P3\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.828159406161901,\"cpgAmp\":0.5605067182332277,\"cpgFreqMult\":1},{\"id\":\"FND-030-P4\",\"parentIndex\":3,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":1,\"width\":35,\"height\":7,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0.16839382296435768,\"cpgAmp\":0.6660428187809885,\"cpgFreqMult\":1},{\"id\":\"FND-030-P5\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0.8281231189261972,\"cpgAmp\":0.8035224942490458,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-030-E0\",\"partIndex\":1,\"direction\":\"EAST\",\"fov\":2,\"range\":550,\"slot\":1},{\"id\":\"FND-030-E1\",\"partIndex\":5,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":480,\"slot\":0},{\"id\":\"FND-030-E2\",\"partIndex\":2,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":480,\"slot\":0}],\"mouths\":[{\"id\":\"FND-030-M0\",\"partIndex\":1,\"direction\":\"EAST\",\"intakeWidth\":9,\"mouthType\":\"carnivore\",\"slot\":0,\"intakeLength\":11.9}],\"hue\":165,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":3.2,\"motorForce\":2.9499999999999997},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":26,\"incubationTime\":12,\"reproductionCooldown\":18,\"maxLifespan\":380,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-031\",\"name\":\"Barrelfin\",\"family\":\"Broad torsos\",\"diet\":\"herbivore\",\"seed\":713007,\"morphology\":{\"parts\":[{\"id\":\"FND-031-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":5,\"width\":21,\"height\":35,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-031-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-031-P2\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-031-P3\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-031-P4\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-031-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":450,\"slot\":1},{\"id\":\"FND-031-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":450,\"slot\":2}],\"mouths\":[{\"id\":\"FND-031-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":29.75}],\"hue\":212,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.6,\"motorForce\":2.98},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":18,\"incubationTime\":8,\"reproductionCooldown\":18,\"maxLifespan\":340,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-032\",\"name\":\"Tallbody Skimmer\",\"family\":\"Broad torsos\",\"diet\":\"herbivore\",\"seed\":713104,\"morphology\":{\"parts\":[{\"id\":\"FND-032-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":6,\"width\":28,\"height\":42,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-032-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-032-P2\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":2,\"width\":35,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-032-P3\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-032-P4\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-032-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":475,\"slot\":1},{\"id\":\"FND-032-E1\",\"partIndex\":3,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":420,\"slot\":0},{\"id\":\"FND-032-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":475,\"slot\":2},{\"id\":\"FND-032-E1-mirror\",\"partIndex\":4,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":420,\"slot\":0}],\"mouths\":[{\"id\":\"FND-032-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":34}],\"hue\":259,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.75,\"motorForce\":2.98},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":20,\"incubationTime\":9,\"reproductionCooldown\":18,\"maxLifespan\":350,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-033\",\"name\":\"Deepbody Browser\",\"family\":\"Broad torsos\",\"diet\":\"herbivore\",\"seed\":713201,\"morphology\":{\"parts\":[{\"id\":\"FND-033-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":7,\"width\":21,\"height\":49,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-033-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-033-P2\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-033-P3\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-033-P4\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-033-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":500,\"slot\":1},{\"id\":\"FND-033-E1\",\"partIndex\":3,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":440,\"slot\":0},{\"id\":\"FND-033-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":500,\"slot\":2},{\"id\":\"FND-033-E1-mirror\",\"partIndex\":4,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":440,\"slot\":0}],\"mouths\":[{\"id\":\"FND-033-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":34}],\"hue\":306,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.9,\"motorForce\":2.98},\"lifeHistory\":{\"targetClutchSize\":3,\"maturityAge\":22,\"incubationTime\":10,\"reproductionCooldown\":18,\"maxLifespan\":360,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-034\",\"name\":\"Broadtail Cruiser\",\"family\":\"Broad torsos\",\"diet\":\"omnivore\",\"seed\":713298,\"morphology\":{\"parts\":[{\"id\":\"FND-034-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":5,\"width\":28,\"height\":35,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-034-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-034-P2\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":2,\"width\":35,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-034-P3\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-034-P4\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-034-P5\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":1,\"dimM\":2,\"width\":7,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-034-P6\",\"parentIndex\":1,\"attachmentPoint\":\"SOUTH\",\"dimN\":1,\"dimM\":2,\"width\":7,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-034-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":525,\"slot\":1},{\"id\":\"FND-034-E1\",\"partIndex\":3,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":460,\"slot\":0},{\"id\":\"FND-034-E2\",\"partIndex\":4,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":460,\"slot\":0},{\"id\":\"FND-034-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":525,\"slot\":2}],\"mouths\":[{\"id\":\"FND-034-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":8,\"mouthType\":\"omnivore\",\"slot\":0,\"intakeLength\":29.75}],\"hue\":353,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":3.05,\"motorForce\":2.98},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":24,\"incubationTime\":11,\"reproductionCooldown\":18,\"maxLifespan\":370,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-035\",\"name\":\"Longbody Hunter\",\"family\":\"Broad torsos\",\"diet\":\"carnivore\",\"seed\":713395,\"morphology\":{\"parts\":[{\"id\":\"FND-035-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":6,\"width\":21,\"height\":42,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-035-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-035-P2\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-035-P3\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-035-P4\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-035-P5\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":1,\"dimM\":2,\"width\":7,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-035-P6\",\"parentIndex\":1,\"attachmentPoint\":\"SOUTH\",\"dimN\":1,\"dimM\":2,\"width\":7,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-035-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":550,\"slot\":1},{\"id\":\"FND-035-E1\",\"partIndex\":3,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":480,\"slot\":0},{\"id\":\"FND-035-E2\",\"partIndex\":4,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":480,\"slot\":0},{\"id\":\"FND-035-E0-mirror\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":550,\"slot\":2}],\"mouths\":[{\"id\":\"FND-035-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":9,\"mouthType\":\"carnivore\",\"slot\":0,\"intakeLength\":34}],\"hue\":40,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":3.2,\"motorForce\":2.98},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":26,\"incubationTime\":12,\"reproductionCooldown\":18,\"maxLifespan\":380,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-036\",\"name\":\"Left-hook Rover\",\"family\":\"Asymmetric branches\",\"diet\":\"herbivore\",\"seed\":713492,\"morphology\":{\"parts\":[{\"id\":\"FND-036-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":3,\"width\":28,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-036-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-036-P2\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-036-P3\",\"parentIndex\":2,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":1,\"width\":21,\"height\":7,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-036-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":450,\"slot\":1}],\"mouths\":[{\"id\":\"FND-036-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":197,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.6,\"motorForce\":3.01},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":18,\"incubationTime\":8,\"reproductionCooldown\":18,\"maxLifespan\":340,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-037\",\"name\":\"Offset Paddler\",\"family\":\"Asymmetric branches\",\"diet\":\"herbivore\",\"seed\":713589,\"morphology\":{\"parts\":[{\"id\":\"FND-037-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":3,\"width\":28,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-037-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":2,\"width\":35,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":6.134335976127481,\"cpgAmp\":0.4544671481475234,\"cpgFreqMult\":1},{\"id\":\"FND-037-P2\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":5.260808561358685,\"cpgAmp\":0.5985400819219648,\"cpgFreqMult\":1},{\"id\":\"FND-037-P3\",\"parentIndex\":2,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":2,\"width\":21,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.3408992521953373,\"cpgAmp\":0.5957627494819462,\"cpgFreqMult\":1},{\"id\":\"FND-037-P4\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":1,\"dimM\":3,\"width\":7,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":5.173173773372293,\"cpgAmp\":0.730005260463804,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-037-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":475,\"slot\":1},{\"id\":\"FND-037-E1\",\"partIndex\":2,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":420,\"slot\":0}],\"mouths\":[{\"id\":\"FND-037-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":244,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.75,\"motorForce\":3.01},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":20,\"incubationTime\":9,\"reproductionCooldown\":18,\"maxLifespan\":350,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-038\",\"name\":\"Crooked Grazer\",\"family\":\"Asymmetric branches\",\"diet\":\"herbivore\",\"seed\":713686,\"morphology\":{\"parts\":[{\"id\":\"FND-038-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":3,\"width\":28,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-038-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-038-P2\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":5,\"width\":14,\"height\":35,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-038-P3\",\"parentIndex\":2,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":1,\"width\":21,\"height\":7,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-038-P4\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":1,\"dimM\":3,\"width\":7,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-038-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":500,\"slot\":1},{\"id\":\"FND-038-E1\",\"partIndex\":2,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":440,\"slot\":0}],\"mouths\":[{\"id\":\"FND-038-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":181,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.9,\"motorForce\":3.01},\"lifeHistory\":{\"targetClutchSize\":3,\"maturityAge\":22,\"incubationTime\":10,\"reproductionCooldown\":18,\"maxLifespan\":360,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-039\",\"name\":\"Hooktail Generalist\",\"family\":\"Asymmetric branches\",\"diet\":\"omnivore\",\"seed\":713783,\"morphology\":{\"parts\":[{\"id\":\"FND-039-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":3,\"width\":28,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-039-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":2,\"width\":35,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-039-P2\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-039-P3\",\"parentIndex\":2,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":2,\"width\":21,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-039-P4\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":1,\"dimM\":3,\"width\":7,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-039-P5\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":2,\"width\":21,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-039-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":525,\"slot\":1},{\"id\":\"FND-039-E1\",\"partIndex\":2,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":460,\"slot\":0},{\"id\":\"FND-039-E2\",\"partIndex\":4,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":460,\"slot\":0}],\"mouths\":[{\"id\":\"FND-039-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":8,\"mouthType\":\"omnivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":228,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":3.05,\"motorForce\":3.01},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":24,\"incubationTime\":11,\"reproductionCooldown\":18,\"maxLifespan\":370,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-040\",\"name\":\"Seven-part Crook\",\"family\":\"Asymmetric branches\",\"diet\":\"carnivore\",\"seed\":713880,\"morphology\":{\"parts\":[{\"id\":\"FND-040-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":3,\"width\":28,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-040-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-040-P2\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-040-P3\",\"parentIndex\":2,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":1,\"width\":21,\"height\":7,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-040-P4\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":1,\"dimM\":3,\"width\":7,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-040-P5\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":2,\"width\":21,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-040-P6\",\"parentIndex\":2,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-040-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":550,\"slot\":1},{\"id\":\"FND-040-E1\",\"partIndex\":6,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":480,\"slot\":0},{\"id\":\"FND-040-E2\",\"partIndex\":4,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":480,\"slot\":0}],\"mouths\":[{\"id\":\"FND-040-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":9,\"mouthType\":\"carnivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":275,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":3.2,\"motorForce\":3.01},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":26,\"incubationTime\":12,\"reproductionCooldown\":18,\"maxLifespan\":380,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-041\",\"name\":\"Three-step Swimmer\",\"family\":\"Elbow chains\",\"diet\":\"herbivore\",\"seed\":713977,\"morphology\":{\"parts\":[{\"id\":\"FND-041-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-041-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-041-P2\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-041-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":450,\"slot\":1}],\"mouths\":[{\"id\":\"FND-041-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":322,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.6,\"motorForce\":3.04},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":18,\"incubationTime\":8,\"reproductionCooldown\":18,\"maxLifespan\":340,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-042\",\"name\":\"Four-step Climber\",\"family\":\"Elbow chains\",\"diet\":\"herbivore\",\"seed\":714074,\"morphology\":{\"parts\":[{\"id\":\"FND-042-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-042-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-042-P2\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-042-P3\",\"parentIndex\":2,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-042-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":475,\"slot\":1},{\"id\":\"FND-042-E1\",\"partIndex\":2,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":420,\"slot\":0}],\"mouths\":[{\"id\":\"FND-042-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":9,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.75,\"motorForce\":3.04},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":20,\"incubationTime\":9,\"reproductionCooldown\":18,\"maxLifespan\":350,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-043\",\"name\":\"Five-step Ribbon\",\"family\":\"Elbow chains\",\"diet\":\"herbivore\",\"seed\":714171,\"morphology\":{\"parts\":[{\"id\":\"FND-043-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-043-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.8412248401725275,\"cpgAmp\":0.5011860335245728,\"cpgFreqMult\":1},{\"id\":\"FND-043-P2\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.838551339208004,\"cpgAmp\":0.5597192510031164,\"cpgFreqMult\":1},{\"id\":\"FND-043-P3\",\"parentIndex\":2,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.142331048547667,\"cpgAmp\":0.6440204588696361,\"cpgFreqMult\":1},{\"id\":\"FND-043-P4\",\"parentIndex\":3,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0.8916440927840112,\"cpgAmp\":0.5608099167235195,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-043-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":500,\"slot\":1},{\"id\":\"FND-043-E1\",\"partIndex\":4,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":440,\"slot\":0}],\"mouths\":[{\"id\":\"FND-043-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":56,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.9,\"motorForce\":3.04},\"lifeHistory\":{\"targetClutchSize\":3,\"maturityAge\":22,\"incubationTime\":10,\"reproductionCooldown\":18,\"maxLifespan\":360,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-044\",\"name\":\"Six-step Stairfish\",\"family\":\"Elbow chains\",\"diet\":\"omnivore\",\"seed\":714268,\"morphology\":{\"parts\":[{\"id\":\"FND-044-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-044-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-044-P2\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-044-P3\",\"parentIndex\":2,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-044-P4\",\"parentIndex\":3,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-044-P5\",\"parentIndex\":4,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-044-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":525,\"slot\":1},{\"id\":\"FND-044-E1\",\"partIndex\":4,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":460,\"slot\":0},{\"id\":\"FND-044-E2\",\"partIndex\":0,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":460,\"slot\":0}],\"mouths\":[{\"id\":\"FND-044-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":8,\"mouthType\":\"omnivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":213,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":3.05,\"motorForce\":3.04},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":24,\"incubationTime\":11,\"reproductionCooldown\":18,\"maxLifespan\":370,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-045\",\"name\":\"Seven-step Crawler\",\"family\":\"Elbow chains\",\"diet\":\"carnivore\",\"seed\":714365,\"morphology\":{\"parts\":[{\"id\":\"FND-045-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-045-P1\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.1706291346136803,\"cpgAmp\":0.5490587052889169,\"cpgFreqMult\":1},{\"id\":\"FND-045-P2\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":6.2470427734922716,\"cpgAmp\":0.5431966237723828,\"cpgFreqMult\":1},{\"id\":\"FND-045-P3\",\"parentIndex\":2,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.576906336211603,\"cpgAmp\":0.596426104567945,\"cpgFreqMult\":1},{\"id\":\"FND-045-P4\",\"parentIndex\":3,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":2.3954539683414793,\"cpgAmp\":0.6510796089656651,\"cpgFreqMult\":1},{\"id\":\"FND-045-P5\",\"parentIndex\":4,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.8686494086798826,\"cpgAmp\":0.7970653539523482,\"cpgFreqMult\":1},{\"id\":\"FND-045-P6\",\"parentIndex\":5,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0.6492223769350597,\"cpgAmp\":0.6295241962186993,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-045-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":550,\"slot\":1},{\"id\":\"FND-045-E1\",\"partIndex\":6,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":480,\"slot\":0},{\"id\":\"FND-045-E2\",\"partIndex\":0,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":480,\"slot\":0}],\"mouths\":[{\"id\":\"FND-045-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":9,\"mouthType\":\"carnivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":260,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":3.2,\"motorForce\":3.04},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":26,\"incubationTime\":12,\"reproductionCooldown\":18,\"maxLifespan\":380,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-046\",\"name\":\"Branchlet\",\"family\":\"Irregular trees\",\"diet\":\"herbivore\",\"seed\":714462,\"morphology\":{\"parts\":[{\"id\":\"FND-046-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-046-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.514295591445626,\"cpgAmp\":0.6615079002454877,\"cpgFreqMult\":1},{\"id\":\"FND-046-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.1027956901576816,\"cpgAmp\":0.626282712817192,\"cpgFreqMult\":1},{\"id\":\"FND-046-P3\",\"parentIndex\":2,\"attachmentPoint\":\"SOUTH\",\"dimN\":6,\"dimM\":5,\"width\":42,\"height\":35,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":2.408469053100572,\"cpgAmp\":0.630353236477822,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-046-E0\",\"partIndex\":3,\"direction\":\"EAST\",\"fov\":2,\"range\":450,\"slot\":1}],\"mouths\":[{\"id\":\"FND-046-M0\",\"partIndex\":3,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":29.75}],\"hue\":197,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.6,\"motorForce\":3.07},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":18,\"incubationTime\":8,\"reproductionCooldown\":18,\"maxLifespan\":340,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-047\",\"name\":\"Splitbrush\",\"family\":\"Irregular trees\",\"diet\":\"herbivore\",\"seed\":714559,\"morphology\":{\"parts\":[{\"id\":\"FND-047-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":4,\"width\":28,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-047-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":2.8965182517943955,\"cpgAmp\":0.764782534353435,\"cpgFreqMult\":1},{\"id\":\"FND-047-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":5.753613554584725,\"cpgAmp\":0.8176986017264425,\"cpgFreqMult\":1},{\"id\":\"FND-047-P3\",\"parentIndex\":2,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":2,\"width\":21,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.973233590798291,\"cpgAmp\":0.6605104700662195,\"cpgFreqMult\":1},{\"id\":\"FND-047-P4\",\"parentIndex\":0,\"attachmentPoint\":\"EAST\",\"dimN\":2,\"dimM\":6,\"width\":14,\"height\":42,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":2.1612813344770463,\"cpgAmp\":0.8482249868102372,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-047-E0\",\"partIndex\":4,\"direction\":\"EAST\",\"fov\":2,\"range\":475,\"slot\":1},{\"id\":\"FND-047-E1\",\"partIndex\":1,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":420,\"slot\":0}],\"mouths\":[{\"id\":\"FND-047-M0\",\"partIndex\":4,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":34}],\"hue\":244,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.75,\"motorForce\":3.07},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":20,\"incubationTime\":9,\"reproductionCooldown\":18,\"maxLifespan\":350,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-048\",\"name\":\"Crooked Fan\",\"family\":\"Irregular trees\",\"diet\":\"herbivore\",\"seed\":714656,\"morphology\":{\"parts\":[{\"id\":\"FND-048-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-048-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0.5523772556784606,\"cpgAmp\":0.8064937866292894,\"cpgFreqMult\":1},{\"id\":\"FND-048-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.0651093448729885,\"cpgAmp\":0.46220968840643767,\"cpgFreqMult\":1},{\"id\":\"FND-048-P3\",\"parentIndex\":1,\"attachmentPoint\":\"NORTH\",\"dimN\":3,\"dimM\":6,\"width\":21,\"height\":42,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":5.9226222405548805,\"cpgAmp\":0.6902035117149353,\"cpgFreqMult\":1},{\"id\":\"FND-048-P4\",\"parentIndex\":0,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":6,\"width\":21,\"height\":42,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0.45317764969669366,\"cpgAmp\":0.47335331616923215,\"cpgFreqMult\":1},{\"id\":\"FND-048-P5\",\"parentIndex\":3,\"attachmentPoint\":\"NORTH\",\"dimN\":4,\"dimM\":2,\"width\":28,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0.2493634289077353,\"cpgAmp\":0.45549020506441595,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-048-E0\",\"partIndex\":4,\"direction\":\"EAST\",\"fov\":2,\"range\":500,\"slot\":1},{\"id\":\"FND-048-E1\",\"partIndex\":5,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":440,\"slot\":0}],\"mouths\":[{\"id\":\"FND-048-M0\",\"partIndex\":4,\"direction\":\"EAST\",\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"slot\":0,\"intakeLength\":34}],\"hue\":291,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":2.9,\"motorForce\":3.07},\"lifeHistory\":{\"targetClutchSize\":3,\"maturityAge\":22,\"incubationTime\":10,\"reproductionCooldown\":18,\"maxLifespan\":360,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-049\",\"name\":\"Manyfork Browser\",\"family\":\"Irregular trees\",\"diet\":\"omnivore\",\"seed\":714753,\"morphology\":{\"parts\":[{\"id\":\"FND-049-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":4,\"dimM\":4,\"width\":28,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-049-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.5707963267948966,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-049-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":4,\"width\":14,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-049-P3\",\"parentIndex\":0,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-049-P4\",\"parentIndex\":0,\"attachmentPoint\":\"WEST\",\"dimN\":6,\"dimM\":3,\"width\":42,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-049-P5\",\"parentIndex\":4,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":2,\"width\":35,\"height\":14,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-049-P6\",\"parentIndex\":5,\"attachmentPoint\":\"NORTH\",\"dimN\":3,\"dimM\":4,\"width\":21,\"height\":28,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.71238898038469,\"cpgAmp\":0.65,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-049-E0\",\"partIndex\":3,\"direction\":\"EAST\",\"fov\":2,\"range\":525,\"slot\":1},{\"id\":\"FND-049-E1\",\"partIndex\":1,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":460,\"slot\":0},{\"id\":\"FND-049-E2\",\"partIndex\":2,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":460,\"slot\":0}],\"mouths\":[{\"id\":\"FND-049-M0\",\"partIndex\":3,\"direction\":\"EAST\",\"intakeWidth\":8,\"mouthType\":\"omnivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":338,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":3.05,\"motorForce\":3.07},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":24,\"incubationTime\":11,\"reproductionCooldown\":18,\"maxLifespan\":370,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-050\",\"name\":\"Wildbranch Hunter\",\"family\":\"Irregular trees\",\"diet\":\"carnivore\",\"seed\":714850,\"morphology\":{\"parts\":[{\"id\":\"FND-050-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":3,\"width\":21,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-050-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.779363263069535,\"cpgAmp\":0.6324822065420449,\"cpgFreqMult\":1},{\"id\":\"FND-050-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":5.8024605384690995,\"cpgAmp\":0.4825675486586988,\"cpgFreqMult\":1},{\"id\":\"FND-050-P3\",\"parentIndex\":2,\"attachmentPoint\":\"SOUTH\",\"dimN\":3,\"dimM\":6,\"width\":21,\"height\":42,\"maxAngle\":0.9,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0.13588746286398204,\"cpgAmp\":0.648540164809674,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-050-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"fov\":2,\"range\":550,\"slot\":1},{\"id\":\"FND-050-E1\",\"partIndex\":1,\"direction\":\"NORTH\",\"fov\":1.8,\"range\":480,\"slot\":0},{\"id\":\"FND-050-E2\",\"partIndex\":3,\"direction\":\"SOUTH\",\"fov\":1.8,\"range\":480,\"slot\":0}],\"mouths\":[{\"id\":\"FND-050-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"intakeWidth\":9,\"mouthType\":\"carnivore\",\"slot\":0,\"intakeLength\":17.849999999999998}],\"hue\":25,\"saturation\":85,\"lightness\":60},\"locomotion\":{\"motorFrequency\":3.2,\"motorForce\":3.07},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":26,\"incubationTime\":12,\"reproductionCooldown\":18,\"maxLifespan\":380,\"metabolicEfficiency\":1,\"storageTraitMultiplier\":1}},{\"id\":\"FND-051\",\"name\":\"Moonbell Jellyfish\",\"family\":\"Bell swimmers\",\"diet\":\"omnivore\",\"seed\":715051,\"morphology\":{\"parts\":[{\"id\":\"FND-051-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":2,\"dimM\":6,\"width\":14,\"height\":42,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0,\"cpgFreqMult\":1},{\"id\":\"FND-051-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":3,\"dimM\":1,\"width\":21,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.7,\"cpgFreqMult\":1},{\"id\":\"FND-051-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":3,\"dimM\":1,\"width\":21,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.7,\"cpgFreqMult\":1},{\"id\":\"FND-051-P3\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":1,\"width\":35,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.883185307179586,\"cpgAmp\":0.85,\"cpgFreqMult\":1},{\"id\":\"FND-051-P4\",\"parentIndex\":2,\"attachmentPoint\":\"WEST\",\"dimN\":5,\"dimM\":1,\"width\":35,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.7415926535897932,\"cpgAmp\":0.85,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-051-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"slot\":1,\"fov\":2,\"range\":560},{\"id\":\"FND-051-E1\",\"partIndex\":0,\"direction\":\"EAST\",\"slot\":2,\"fov\":2,\"range\":560}],\"mouths\":[{\"id\":\"FND-051-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"slot\":0,\"intakeWidth\":8,\"mouthType\":\"omnivore\",\"intakeLength\":15}],\"hue\":285,\"saturation\":75,\"lightness\":70},\"locomotion\":{\"motorFrequency\":2.4,\"motorForce\":3.4},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":22,\"incubationTime\":11,\"reproductionCooldown\":18,\"maxLifespan\":360,\"metabolicEfficiency\":1.05,\"storageTraitMultiplier\":1}},{\"id\":\"FND-052\",\"name\":\"Lantern Jellyfish\",\"family\":\"Bell swimmers\",\"diet\":\"herbivore\",\"seed\":715052,\"morphology\":{\"parts\":[{\"id\":\"FND-052-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0,\"cpgFreqMult\":1},{\"id\":\"FND-052-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":1,\"width\":14,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.7,\"cpgFreqMult\":1},{\"id\":\"FND-052-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":1,\"width\":14,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.7,\"cpgFreqMult\":1},{\"id\":\"FND-052-P3\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":1,\"width\":21,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.883185307179586,\"cpgAmp\":0.85,\"cpgFreqMult\":1},{\"id\":\"FND-052-P4\",\"parentIndex\":2,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":1,\"width\":21,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.7415926535897932,\"cpgAmp\":0.85,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-052-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"slot\":1,\"fov\":2,\"range\":500},{\"id\":\"FND-052-E1\",\"partIndex\":0,\"direction\":\"EAST\",\"slot\":2,\"fov\":2,\"range\":500}],\"mouths\":[{\"id\":\"FND-052-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"slot\":0,\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"intakeLength\":10}],\"hue\":175,\"saturation\":70,\"lightness\":65},\"locomotion\":{\"motorFrequency\":2.8,\"motorForce\":3},\"lifeHistory\":{\"targetClutchSize\":2,\"maturityAge\":18,\"incubationTime\":8,\"reproductionCooldown\":16,\"maxLifespan\":340,\"metabolicEfficiency\":1.05,\"storageTraitMultiplier\":1}},{\"id\":\"FND-053\",\"name\":\"Sailbell Jellyfish\",\"family\":\"Bell swimmers\",\"diet\":\"herbivore\",\"seed\":715053,\"morphology\":{\"parts\":[{\"id\":\"FND-053-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":3,\"dimM\":8,\"width\":21,\"height\":56,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0,\"cpgFreqMult\":1},{\"id\":\"FND-053-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":4,\"dimM\":1,\"width\":28,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-053-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":4,\"dimM\":1,\"width\":28,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.65,\"cpgFreqMult\":1},{\"id\":\"FND-053-P3\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":1,\"width\":28,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.883185307179586,\"cpgAmp\":0.85,\"cpgFreqMult\":1},{\"id\":\"FND-053-P4\",\"parentIndex\":2,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":1,\"width\":28,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.7415926535897932,\"cpgAmp\":0.85,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-053-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"slot\":1,\"fov\":2,\"range\":560},{\"id\":\"FND-053-E1\",\"partIndex\":0,\"direction\":\"EAST\",\"slot\":2,\"fov\":2,\"range\":560}],\"mouths\":[{\"id\":\"FND-053-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"slot\":0,\"intakeWidth\":7,\"mouthType\":\"herbivore\",\"intakeLength\":18}],\"hue\":38,\"saturation\":85,\"lightness\":65},\"locomotion\":{\"motorFrequency\":1.9,\"motorForce\":4},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":28,\"incubationTime\":13,\"reproductionCooldown\":20,\"maxLifespan\":420,\"metabolicEfficiency\":1.05,\"storageTraitMultiplier\":1}},{\"id\":\"FND-054\",\"name\":\"Ribbon Jellyfish\",\"family\":\"Bell swimmers\",\"diet\":\"omnivore\",\"seed\":715054,\"morphology\":{\"parts\":[{\"id\":\"FND-054-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":2,\"dimM\":5,\"width\":14,\"height\":35,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0,\"cpgFreqMult\":1},{\"id\":\"FND-054-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":3,\"dimM\":1,\"width\":21,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.7,\"cpgFreqMult\":1},{\"id\":\"FND-054-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":3,\"dimM\":1,\"width\":21,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.7,\"cpgFreqMult\":1},{\"id\":\"FND-054-P3\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":1,\"width\":21,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.883185307179586,\"cpgAmp\":0.85,\"cpgFreqMult\":1},{\"id\":\"FND-054-P4\",\"parentIndex\":2,\"attachmentPoint\":\"WEST\",\"dimN\":3,\"dimM\":1,\"width\":21,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.7415926535897932,\"cpgAmp\":0.85,\"cpgFreqMult\":1},{\"id\":\"FND-054-P5\",\"parentIndex\":3,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":1,\"width\":28,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.633185307179586,\"cpgAmp\":0.8,\"cpgFreqMult\":1},{\"id\":\"FND-054-P6\",\"parentIndex\":4,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":1,\"width\":28,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0.4915926535897932,\"cpgAmp\":0.8,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-054-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"slot\":1,\"fov\":2,\"range\":560},{\"id\":\"FND-054-E1\",\"partIndex\":0,\"direction\":\"EAST\",\"slot\":2,\"fov\":2,\"range\":560}],\"mouths\":[{\"id\":\"FND-054-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"slot\":0,\"intakeWidth\":8,\"mouthType\":\"omnivore\",\"intakeLength\":15}],\"hue\":220,\"saturation\":70,\"lightness\":65},\"locomotion\":{\"motorFrequency\":2.2,\"motorForce\":3.6},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":24,\"incubationTime\":11,\"reproductionCooldown\":20,\"maxLifespan\":420,\"metabolicEfficiency\":1.05,\"storageTraitMultiplier\":1}},{\"id\":\"FND-055\",\"name\":\"Crown Jellyfish\",\"family\":\"Bell swimmers\",\"diet\":\"carnivore\",\"seed\":715055,\"morphology\":{\"parts\":[{\"id\":\"FND-055-P0\",\"parentIndex\":-1,\"attachmentPoint\":\"EAST\",\"dimN\":2,\"dimM\":7,\"width\":14,\"height\":49,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0,\"cpgFreqMult\":1},{\"id\":\"FND-055-P1\",\"parentIndex\":0,\"attachmentPoint\":\"NORTH\",\"dimN\":2,\"dimM\":1,\"width\":14,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0,\"cpgAmp\":0.7,\"cpgFreqMult\":1},{\"id\":\"FND-055-P2\",\"parentIndex\":0,\"attachmentPoint\":\"SOUTH\",\"dimN\":2,\"dimM\":1,\"width\":14,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.141592653589793,\"cpgAmp\":0.7,\"cpgFreqMult\":1},{\"id\":\"FND-055-P3\",\"parentIndex\":1,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":1,\"width\":28,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":4.883185307179586,\"cpgAmp\":0.75,\"cpgFreqMult\":1},{\"id\":\"FND-055-P4\",\"parentIndex\":2,\"attachmentPoint\":\"WEST\",\"dimN\":4,\"dimM\":1,\"width\":28,\"height\":7,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":1.7415926535897932,\"cpgAmp\":0.75,\"cpgFreqMult\":1},{\"id\":\"FND-055-P5\",\"parentIndex\":3,\"attachmentPoint\":\"WEST\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":3.633185307179586,\"cpgAmp\":0.6,\"cpgFreqMult\":1},{\"id\":\"FND-055-P6\",\"parentIndex\":4,\"attachmentPoint\":\"WEST\",\"dimN\":2,\"dimM\":3,\"width\":14,\"height\":21,\"maxAngle\":1.15,\"baseAngleOffset\":0,\"cpgPhaseOffset\":0.4915926535897932,\"cpgAmp\":0.6,\"cpgFreqMult\":1}],\"eyes\":[{\"id\":\"FND-055-E0\",\"partIndex\":0,\"direction\":\"EAST\",\"slot\":1,\"fov\":2,\"range\":600},{\"id\":\"FND-055-E1\",\"partIndex\":0,\"direction\":\"EAST\",\"slot\":2,\"fov\":2,\"range\":600}],\"mouths\":[{\"id\":\"FND-055-M0\",\"partIndex\":0,\"direction\":\"EAST\",\"slot\":0,\"intakeWidth\":9,\"mouthType\":\"carnivore\",\"intakeLength\":15}],\"hue\":320,\"saturation\":70,\"lightness\":65},\"locomotion\":{\"motorFrequency\":2,\"motorForce\":3.8},\"lifeHistory\":{\"targetClutchSize\":1,\"maturityAge\":30,\"incubationTime\":14,\"reproductionCooldown\":20,\"maxLifespan\":420,\"metabolicEfficiency\":1.05,\"storageTraitMultiplier\":1}}]");
[...new Set(Jn.map((e) => e.family))], [
	{
		id: "CUR-001",
		source: "FND-001",
		name: "Darter Scout",
		sensitivity: [
			.5,
			1,
			.6
		],
		learning: .016
	},
	{
		id: "CUR-002",
		source: "FND-006",
		name: "Twin Oar Grazer",
		sensitivity: [
			.25,
			1,
			.5
		],
		learning: 0
	},
	{
		id: "CUR-003",
		source: "FND-021",
		name: "Tidewheel Browser",
		sensitivity: [
			.6,
			1,
			.8
		],
		learning: 0
	},
	{
		id: "CUR-004",
		source: "FND-052",
		name: "Lantern Filterer",
		sensitivity: [
			.15,
			1,
			.35
		],
		learning: .008
	},
	{
		id: "CUR-005",
		source: "FND-019",
		name: "Forktail Opportunist",
		sensitivity: [
			.9,
			1,
			.7
		],
		learning: .012
	},
	{
		id: "CUR-006",
		source: "FND-034",
		name: "Broadwake Forager",
		sensitivity: [
			1,
			.8,
			.8
		],
		learning: .018
	},
	{
		id: "CUR-007",
		source: "FND-039",
		name: "Hooktail Scavenger",
		sensitivity: [
			1,
			.75,
			1
		],
		learning: .012
	},
	{
		id: "CUR-008",
		source: "FND-030",
		name: "Hammerhead Pursuer",
		sensitivity: [
			1,
			.1,
			.9
		],
		learning: .018
	},
	{
		id: "CUR-009",
		source: "FND-050",
		name: "Branchstalker",
		sensitivity: [
			1,
			0,
			1
		],
		learning: .012
	}
].map((e) => {
	let t = Jn.find((t) => t.id === e.source);
	if (!t) throw Error(`Missing curated founder source: ${e.source}`);
	let n = structuredClone(t);
	return n.id = e.id, n.name = e.name, n.morphology.parts.forEach((n) => {
		n.id = n.id.replace(t.id, e.id);
	}), n.morphology.eyes.forEach((n) => {
		n.id = n.id.replace(t.id, e.id);
	}), n.morphology.mouths.forEach((n) => {
		n.id = n.id.replace(t.id, e.id);
	}), n;
});
//#endregion
//#region ../vidAI/world.ts
function Yn(e, t, n, r, i, a) {
	if (O(e) >= (n.maxOrganisms ?? 100)) return null;
	let o = structuredClone(t), s = vn(o, r, i, a ?? e.prng.range(0, Math.PI * 2), void 0, void 0, e.prng);
	return e.energyPool && e.energyPool.reserve < s.energy + s.structuralBiomass ? null : (e.organisms.push(s), e.totalBirths++, e.energyPool ? e.energyPool.reserve -= s.energy + s.structuralBiomass : e.ledger.externalInflow += s.energy + s.structuralBiomass, e.lineage.set(s.id, {
		id: s.id,
		name: o.name,
		parentIds: [],
		generation: o.generation,
		birthTime: e.simTime,
		offspringCount: 0,
		archetype: o.archetype ?? "Custom",
		hue: o.hue,
		diet: pt(o.mouths).label,
		genome: o
	}), S(e.lineage, s.id), s);
}
//#endregion
//#region ../vidAI/simulationHost.ts
var Xn = class {
	state;
	settings;
	epoch = 0;
	speed = 0;
	selected = null;
	genomeIds = /* @__PURE__ */ new WeakMap();
	nextGenome = 0;
	lineageChanges;
	energyActivity = new y();
	steps = 0;
	events = /* @__PURE__ */ new Set();
	reset(e, t) {
		let n = qn(e);
		this.lineageChanges?.dispose(), this.state = n.state, this.settings = n.settings, this.epoch = t, this.energyActivity.clear(), this.speed = 0, this.steps = 0, this.events.clear(), this.genomeIds = /* @__PURE__ */ new WeakMap(), this.nextGenome = 0, this.lineageChanges = x(this.state.lineage);
	}
	tick() {
		Ln(this.state, this.settings, 1 / 60, (e) => this.events.add(e), void 0, this.energyActivity.record), this.energyActivity.advance(this.state), this.steps++;
	}
	snapshot(e = {}) {
		return Wn(this.state, this.settings, e);
	}
	action(e) {
		let t = this.state, n = this.settings;
		if (e.kind === "self-tubes") return g(t, n, e.topology), null;
		if (e.kind === "energy-budget") return D(t, e.joules), t.energyPool.reserve;
		if (e.kind === "feed") return _t(t, n, e.count, {
			x: e.x,
			y: e.y,
			spread: 80
		});
		if (e.kind === "clear-food") return Hn(t);
		if (e.kind === "resize") return Un(t, n, e.width, e.height), this.settings = {
			...n,
			worldWidth: e.width,
			worldHeight: e.height
		}, null;
		if (e.kind === "feed-all") {
			let e = t.organisms.filter((e) => !e.dissolving);
			if (!e.length) return _t(t, n, 35, {
				x: n.worldWidth / 2,
				y: n.worldHeight / 2,
				spread: 80
			});
			let r = 0;
			for (let i of e) if (r += _t(t, n, 2, {
				...i.segments[0],
				spread: 60
			}), !gt(t, n)) break;
			return r;
		}
		if (O(t) >= (n.maxOrganisms ?? 100)) return null;
		let r = q(e.x + t.prng.range(-80, 80), 100, n.worldWidth - 100), i = q(e.y + t.prng.range(-80, 80), 100, n.worldHeight - 100);
		return Yn(t, e.genome ? structuredClone(e.genome) : fn(e.archetype, 1, [], t.prng), n, r, i)?.id ?? null;
	}
	frame() {
		let e = [], t = (t) => {
			let n = this.genomeIds.get(t);
			return n || (n = `g${this.nextGenome++}`, this.genomeIds.set(t, n), e.push([n, t])), n;
		}, { prng: n, lineage: r, organisms: i, eggs: a, ...o } = this.state, s = i.map((e) => {
			let { genome: n, learnedMotorWeights: r, learnedSensoryWeights: i, neuralHidden: a, neuralInputs: o, neuralOutputs: s, ...c } = e;
			return {
				...c,
				genomeKey: t(n),
				neuralHidden: e.id === this.selected ? a : [],
				neuralInputs: e.id === this.selected ? o : [],
				neuralOutputs: e.id === this.selected ? s : [],
				...e.id === this.selected ? {
					learnedMotorWeights: r,
					learnedSensoryWeights: i
				} : {}
			};
		}), c = a.map(({ genome: e, ...n }) => ({
			...n,
			genomeKey: t(e)
		})), l = [];
		for (let e of this.lineageChanges.pending) {
			let { genome: n, ...i } = r.get(e);
			l.push([e, {
				...i,
				genomeKey: t(n)
			}]);
		}
		this.lineageChanges.pending.clear();
		let u = {
			epoch: this.epoch,
			steps: this.steps,
			events: [...this.events],
			genomes: e,
			lineage: l,
			energyActivity: this.energyActivity.frame(),
			state: {
				...o,
				organisms: s,
				eggs: c
			}
		};
		return this.steps = 0, this.events.clear(), u;
	}
}, Zn = {}, Qn = [], $n = !1;
globalThis.__p11 = {
	enter(e) {
		if (!$n) return 0;
		let t = performance.now();
		return Qn.push({
			k: e,
			t,
			child: 0
		}), t;
	},
	exit(e, t) {
		if (!t) return;
		let n = performance.now() - t, r = Qn.pop();
		if (r.k !== e) throw Error("phase stack mismatch " + r.k + " " + e);
		let i = Zn[e] ??= {
			calls: 0,
			inclusiveMs: 0,
			exclusiveMs: 0
		};
		i.calls++, i.inclusiveMs += n, i.exclusiveMs += n - r.child, Qn.length && (Qn[Qn.length - 1].child += n);
	}
}, e.on("message", async ({ snapshot: r, warmup: i, ticks: a, kind: o }) => {
	let s = new Xn();
	s.reset(r, 1);
	for (let e = 0; e < i; e++) s.tick();
	s.reset(r, 2), s.tick();
	let c = JSON.stringify(s.snapshot()), l = {}, u = new n(), d = (e, t = {}) => new Promise((n, r) => u.post(e, t, (e, t) => e ? r(e) : n(t)));
	o === "allocation" && (u.connect(), await d("HeapProfiler.startSampling", { samplingInterval: 32768 }));
	let f = process.memoryUsage(), p = process.threadCpuUsage(), m = performance.now(), h = 0;
	for ($n = o === "diagnostic"; h < a; h++) if (s.tick(), performance.now() - m > 3e4) {
		h++;
		break;
	}
	let g = performance.now() - m, _ = process.threadCpuUsage(p), v = process.memoryUsage();
	$n = !1;
	let y = o === "allocation" ? (await d("HeapProfiler.stopSampling")).profile : void 0;
	o === "allocation" && u.disconnect();
	let b = s.snapshot(), x = s.state, S = s.frame();
	e.postMessage({
		done: h,
		requested: a,
		elapsedMs: g,
		tps: h * 1e3 / g,
		effectiveX: h / 60 * 1e3 / g,
		threadCpuUs: _,
		memoryBefore: f,
		memoryAfter: v,
		hash: t("sha256").update(JSON.stringify(b)).digest("hex"),
		startHash: t("sha256").update(c).digest("hex"),
		population: x.organisms.length,
		parts: x.organisms.reduce((e, t) => e + t.segments.length, 0),
		food: x.nutrients.length,
		eggs: x.eggs.length,
		energyError: x.energyPool.budget - x.energyPool.reserve - T(x),
		metrics: Zn,
		operations: l,
		diagnostics: S.diagnostics ?? [],
		profile: y
	});
});
//#endregion
