<!--
提交前请注意 / Before Opening a PR:
1. 请保持 PR 聚焦、体量可控：每个 PR 只做一件明确的事，不要把几千上万行改动、大面积无关重构或多个不相关需求打包成一个巨型 PR 直接塞进来。
   Keep PRs focused and reviewable: one clear goal per PR. Do not dump massive multi-thousand-line changes, sweeping unrelated refactors, or bundled features into a single PR.
2. 大型功能或架构调整请先开 Issue 对齐思路并拆分提交；未经事先沟通的超大 PR 可能会被直接关闭。
   For large features or architectural changes, please open an Issue to align and split the work first; unaligned mega-PRs may be closed directly.
3. 提交者需自行理解全部改动并持续跟进 Review 反馈，不接受“提交完就不管”的 PR。
   Authors must understand every change and respond to review feedback — drive-by code dumps will not be merged.
-->

## 改动说明 / Summary
<!-- 简述本次做了什么、解决了什么问题；如关联 Issue 请写 Closes #编号 -->
<!-- Briefly describe what changed and why. Link related issues with "Closes #123". -->

## 影响范围 / Scope
- [ ] 前端界面 / 样式（`sidecars/panel/src/`） / Frontend UI & styles
- [ ] 后端遥测 / 协议解析（`sidecars/panel/backend/`） / Backend telemetry & parsing
- [ ] 桌面挂载 / 跨平台兼容 / Desktop mount & cross-platform launcher
- [ ] 文档 / 价格目录 / 其他 / Docs, pricing catalog, or other

## 提交前自检 / Checklist
- [ ] **改动聚焦、体量可控**：仅聚焦单一目标，未夹带无关重构或未经沟通的巨量代码倾倒（大型改动已先开 Issue 讨论并拆分为可审阅的小 PR） / Single focused goal with a reviewable diff (no unaligned mega-PRs or unrelated refactors)
- [ ] **已自审代码并跟进评审**：已理解全部改动，并愿意响应后续 Review 调整，非“丢完即不管” / Reviewed and understood all changes and ready to follow up on review feedback
- [ ] 修改 `sidecars/panel/src/` 后，已运行 `npm --prefix sidecars/panel run build` 同步产物 / Rebuilt bundle if `sidecars/panel/src/` changed
- [ ] 已运行 `npm --prefix sidecars/panel test` 确认测试通过 / Verified tests pass via `npm --prefix sidecars/panel test`
- [ ] 保持零外部 npm 运行时依赖 / Preserved zero external npm runtime dependencies
- [ ] 涉及界面或样式改动时，已附前后对比截图 / Attached before & after screenshots for UI changes
