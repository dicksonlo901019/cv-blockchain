const aliasEntries: Array<[string, string[]]> = [
  ["Product Strategy", ["product strategy", "產品策略", "产品策略"]],
  ["Product Discovery", ["product discovery", "user research", "market research", "使用者研究", "用戶研究", "市場研究"]],
  ["Roadmap", ["roadmap", "product roadmap", "產品路線圖", "路线图"]],
  ["PRD", ["prd", "product requirements", "requirements document", "需求文件", "產品需求"]],
  ["Stakeholder Management", ["stakeholder", "stakeholder management", "利害關係人", "關係人管理"]],
  ["Cross-functional Collaboration", ["cross-functional", "cross functional", "跨團隊", "跨部門", "協作"]],
  ["Risk Management", ["risk management", "risk control", "risk controls", "風控", "風險管理"]],
  ["Compliance", ["compliance", "aml", "kyc", "sumsub", "identity verification", "法遵", "合規", "洗錢防制"]],
  ["API Integration", ["api integration", "api", "sdk integration", "系統整合", "串接"]],
  ["Data Analysis", ["data analysis", "analytics", "metrics", "數據分析", "資料分析"]],
  ["UX", ["ux", "user experience", "prototype", "wireframe", "使用者體驗", "原型"]],
  ["Go-to-market", ["go-to-market", "gtm", "market launch", "上市策略"]],
  ["0-to-1 Product", ["0-to-1", "0 to 1", "zero to one", "從零到一", "零到一"]],
  ["Platform Product", ["platform product", "platform", "平台產品", "平台型產品"]],
  ["B2B Product", ["b2b", "enterprise product", "企業產品"]],
  ["Technical Programme Delivery", ["technical program", "technical programme", "technical delivery", "技術專案", "技術交付"]],
  ["Crypto Exchange", ["crypto exchange", "centralized exchange", "cex", "交易所", "加密貨幣交易所"]],
  ["NFT Marketplace", ["nft marketplace", "nft platform", "nft 市場", "nft 平台"]],
  ["Wallet", ["wallet", "walletconnect", "eip-712", "錢包"]],
  ["Payments", ["payments", "payment", "checkout", "fiat on-ramp", "fiat off-ramp", "支付", "付款", "出入金"]],
  ["Embedded Finance", ["embedded finance", "嵌入式金融"]],
  ["AI Agent", ["ai agent", "ai agents", "agentic workflow", "llm", "人工智慧代理", "智能體"]],
  ["Compliance / AML", ["compliance", "aml", "kyc", "sumsub", "合規", "法遵"]],
  ["Trading", ["trading", "futures", "derivatives", "grid trading", "交易", "合約", "期貨", "網格"]],
  ["C2C / P2P", ["c2c", "p2p", "peer-to-peer", "場外交易"]],
  ["Referral System", ["referral", "rebate", "commission", "推薦", "返佣"]],
  ["Product Leadership", ["product lead", "product leadership", "team lead", "產品主管", "帶領團隊"]],
  ["AI Product Workflows", ["ai workflow", "agentic workflow", "prompt engineering", "design-to-code", "ai 產品工作流"]],
];

export const PRODUCT_TYPES = [
  "Crypto Exchange",
  "NFT Marketplace",
  "DEX",
  "Wallet",
  "Payments",
  "Embedded Finance",
  "B2B Platform",
  "AI Agent",
  "Compliance / AML",
  "Trading",
  "C2C / P2P",
  "Referral System",
] as const;

export const COMPETENCIES = [
  "Product Strategy",
  "Product Discovery",
  "Roadmap",
  "PRD",
  "Stakeholder Management",
  "Cross-functional Collaboration",
  "Risk Management",
  "Compliance",
  "API Integration",
  "Data Analysis",
  "UX",
  "Go-to-market",
  "0-to-1 Product",
  "Platform Product",
  "B2B Product",
  "Technical Programme Delivery",
] as const;

export const TAXONOMY_ALIASES = new Map(aliasEntries);

export function findTaxonomyMatches(text: string): string[] {
  const normalized = text.toLocaleLowerCase();
  const matches: string[] = [];

  for (const [canonical, aliases] of aliasEntries) {
    if (aliases.some((alias) => normalized.includes(alias.toLocaleLowerCase()))) {
      matches.push(canonical);
    }
  }

  return [...new Set(matches)];
}

export function aliasesFor(canonical: string): string[] {
  return TAXONOMY_ALIASES.get(canonical) ?? [canonical];
}

export function canonicalizeTerm(term: string): string {
  const normalized = term.trim().toLocaleLowerCase();
  for (const [canonical, aliases] of aliasEntries) {
    if (
      canonical.toLocaleLowerCase() === normalized ||
      aliases.some((alias) => alias.toLocaleLowerCase() === normalized)
    ) {
      return canonical;
    }
  }
  return term.trim();
}
