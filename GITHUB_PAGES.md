# Blockchain PM CV：GitHub Pages 發布與版本管理

## 架構

- 編輯來源：`public/blockchain-cv.html`
- PDF：`public/dickson-lo-blockchain-cv.pdf`
- 其他靜態資源：`public/`
- 發布成品：`pages-dist/`（由指令產生，不提交 Git）
- 自動發布：`.github/workflows/deploy-pages.yml`
- 現有 Sites 網站：保留，不因 GitHub Pages 發布而變更或下線

發布腳本會把 `public/` 複製成靜態網站，並以 `blockchain-cv.html` 產生首頁
`index.html`。所有站內資源使用相對路徑，因此支援
`https://dicksonlo901019.github.io/cv-blockchain/`。

## 日常更新與發布

1. 更新 `public/blockchain-cv.html`、PDF 或圖片。
2. 執行 `npm run pages:build` 與 `npm test`。
3. 檢查 `pages-dist/index.html`、PDF、手機版、列印與所有作品連結。
4. 建立一個只包含本次履歷更新的 commit。
5. 建立不可重複的標籤，例如：`cv-blockchain-v2026.07.13.1`。
6. 推送 `main` 與標籤；`main` 更新會自動發布。
7. 到 Actions 確認部署成功，再抽查公開網址。

## 回復舊版本

使用 `git revert` 建立還原 commit 後推送 `main`，不要 force-push 或刪除既有
tags。還原完成後建立一個新的穩定標籤，保留完整稽核歷史。

## 遷移安全清單

- [ ] Repository 只含可公開資訊，沒有 API key、私密附件或未公開資料。
- [ ] Actions 部署成功，首頁與 PDF 可用。
- [ ] 所有作品連結、手機版、桌面版與列印版正常。
- [ ] 全站使用 HTTPS，沒有 mixed content。
- [ ] 建立第一個穩定標籤。
- [ ] 先小範圍切換入口並觀察至少 7 天。
- [ ] 期間保留現有 Sites 網址，不直接刪除。

## 儲存空間

目前 HTML、PDF、OG 圖片與 SVG 都可直接放 GitHub Pages，不需要外部儲存。
若未來出現單檔超過 50 MB、私密附件、大量影音、上傳、登入或動態資料，再改用
GitHub Releases、受控雲端硬碟、物件儲存或獨立後端。
