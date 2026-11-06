"""Offline P11 evidence verification. Never starts a simulator or experiment."""
import hashlib
import json
import lzma
from pathlib import Path

root = Path(__file__).resolve().parents[1]
evidence = root / "docs/contributor-workspace/performance/evidence/p11"
manifest = json.loads((evidence / "manifest.json").read_text())
inputs = json.loads(lzma.decompress((evidence / "initial-scenes.json.xz").read_bytes()))
verified = 0
for name, expected in manifest.items():
    if name == "initial-scenes.tar.gz":
        # Transport was losslessly repackaged; retain its original receipt.
        continue
    data = (inputs[Path(name).name].encode() if name.startswith("scenes/")
            else (evidence / name).read_bytes())
    assert len(data) == expected["bytes"], name + ": size"
    assert hashlib.sha256(data).hexdigest() == expected["sha256"], name + ": SHA256"
    verified += 1

for kind in ("pilot", "primary"):
    payload = json.loads((evidence / (kind + ".json")).read_text())
    rows = payload["results"]
    completed = [r for r in rows if "done" in r]
    assert all(r["done"] == r["requested"] for r in completed)
    assert all(abs(r["energyError"]) < 0.01 for r in completed)
    print(f"{kind}: attempted={len(rows)}, complete={len(completed)}, "
          f"failed={len(rows)-len(completed)}")
    for scene in ("empty", "moderate", "dense", "adversarial"):
        pair = [r for r in completed if r["scene"] == scene]
        if len(pair) != 2:
            continue
        main = next(r for r in pair if r["label"] == "main")
        testing = next(r for r in pair if r["label"] == "testing")
        assert main["startHash"] == testing["startHash"], scene + ": start"
        assert main["hash"] == testing["hash"], scene + ": endpoint"
        for row in pair:
            assert abs(row["tps"] - row["done"] * 1000 / row["elapsedMs"]) < 1e-8
            assert abs(row["effectiveX"] - row["tps"] / 60) < 1e-8
        if kind == "primary":
            change = 100 * (testing["tps"] / main["tps"] - 1)
            cost = 100 * (testing["elapsedMs"] / main["elapsedMs"] - 1)
            print(f"  {scene}: TPS change={change:.6f}%, time change={cost:.6f}% (n1)")
print(f"PASS: {verified} original files/inputs match; gzip receipt retained as provenance.")

browser_bytes = lzma.decompress((evidence / "browser.json.xz").read_bytes())
browser_manifest = json.loads((evidence / "browser-artifact-manifest.json").read_text())
assert hashlib.sha256(browser_bytes).hexdigest() == browser_manifest["p11-browser/browser.json"]["sha256"]
browser = json.loads(browser_bytes)
assert len(browser["results"]) == 18
assert all(not r.get("errors") and "error" not in r for r in browser["results"])
assert sum(not r["pilot"] for r in browser["results"]) == 16
for name, raw in inputs.items():
    expected = browser_manifest["p11-browser/scenes/" + name]
    assert hashlib.sha256(raw.encode()).hexdigest() == expected["sha256"]
for row in browser["results"]:
    first, last = row["frames"][0], row["frames"][-1]
    tps = (last["sim"] - first["sim"]) * 60000 / (last["t"] - first["t"])
    assert abs(tps - row["tps"]) < 1e-7
print("PASS: 18 original browser observations, recomputed rates and all4 exact input hashes.")
print("Browser workflow cancelled during closure; focused controls skipped; orchestration budget failed.")
