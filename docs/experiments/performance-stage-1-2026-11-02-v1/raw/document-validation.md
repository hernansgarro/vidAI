# Documentation validation

- Relative Markdown links in report/protocol resolve locally.
- All evidence JSON files parse; six kernel windows have exactStateMatch=true and consistent tick/speed formulas.
- Raw trial exits retained: kernel3x/control1x/headless3x/focused/Worker0; profiler/components/browser-install1.
- npm ci and build exits0; original warnings retained.
- Authored documentation whitespace checks passed excluding verbatim raw logs. A subsequent staged check identified derived CSV CRLF and an original Vite trailing space; CSV was normalized to LF and its manifest updated. The raw build log remains byte-for-byte unchanged. Production TypeScript/TSX/MJS, package files, baselines and GitHub workflows have no changes against pinned runtime.
- Report uses Ubuntu24.04.3 LTS from raw environment (not inferred OS). Author-authored documentation/commit/PR text is English; pre-existing proper names retained.
- File manifest SHA256/byte sizes include all experiment files except the manifest itself; PROJECT_STATUS only adds the report index/summary.
- No upstream write, branch merge, testing mutation, deployment, Wiki publication or Stage2 execution.
