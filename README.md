# Dickson Lo｜Blockchain / Web3 Product Manager CV

盧駿軒 Dickson Lo 的 Blockchain／Web3 產品經理履歷，聚焦 CEX、交易系統、
Wallet、NFT、虛擬資產平台、資產帳務與風控架構。

- 線上 CV：<https://dicksonlo901019.github.io/cv-blockchain/>
- PDF：<https://dicksonlo901019.github.io/cv-blockchain/dickson-lo-blockchain-cv.pdf>
- 發布、版本與回復說明：[GITHUB_PAGES.md](./GITHUB_PAGES.md)

## 內容位置

- `public/blockchain-cv.html`：GitHub Pages 的主要履歷來源
- `public/dickson-lo-blockchain-cv.pdf`：可下載 PDF
- `app/`、`worker/`、`.openai/hosting.json`：保留既有 Sites 網站所需來源與設定
- `.github/workflows/deploy-pages.yml`：GitHub Pages 自動發布流程

## 發布原則

更新履歷後先執行 `npm run pages:build` 與 `npm test`。通過後提交至 `main`，
GitHub Actions 會自動發布。每個對外穩定版本使用
`cv-blockchain-vYYYY.MM.DD.N` 標籤，需要回復時以 `git revert` 建立新 commit，
保留完整歷史。

現有 Sites 網站在 GitHub Pages 完成驗證與入口遷移前持續保留，不直接移除。

## Career Intelligence RAG MVP

此 repository 另提供隔離的職涯知識庫檢索 MVP：

- English：`/career-rag/en/`
- 中文：`/career-rag/zh/`
- 架構、資料規則、選用向量服務與限制：[docs/career-rag.md](./docs/career-rag.md)

預設模式完全在本地執行 deterministic retrieval，不需要 OpenAI 或 Supabase
credentials。這是 repository-grounded retrieval MVP，不宣稱為 production-ready
vector RAG 平台。
