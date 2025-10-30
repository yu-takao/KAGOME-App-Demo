export type CheckItem = {
  id: string;
  label: string;
  pass: boolean; // leafの場合のみ意味があり、親は子から計算
  children?: CheckItem[];
};

export type ResultRecord = {
  id: string;
  at: string;
  packageName: string;
  executor: string;
  tree: CheckItem[];
};

export function computeOverallPass(items: CheckItem[]): boolean {
  const walk = (nodes: CheckItem[]): boolean => {
    return nodes.every((n) => {
      if (n.children && n.children.length > 0) return walk(n.children);
      return !!n.pass;
    });
  };
  return walk(items);
}

function treeAllPass(): CheckItem[] {
  return [
    { id: 'cat-1', label: '① 版下サイズの確認', pass: true, children: [
      { id: '1', label: '（1）版下の種類：多様なサイズ・包材', pass: true },
      { id: '2', label: '（2）版下台紙記載の寸法と合っているか', pass: true },
      { id: '3', label: '（3）規定範囲内にデザインが配置', pass: true },
      { id: '4', label: '（4）規定範囲内に文字が配置', pass: true },
    ]},
    { id: 'cat-2', label: '② 工場制約確認', pass: true, children: [
      { id: '5', label: '（5）印字範囲サイズ・白無地', pass: true },
      { id: '6', label: '（6）JANコードエリア保持・白無地', pass: true },
      { id: '7', label: '（7）ストロー位置（工場別）', pass: true },
      { id: '8', label: '（8）黒禁止エリアなど工場制約', pass: true },
    ]},
    { id: 'cat-3', label: '③ 文字サイズの確認', pass: true, children: [
      { id: '10', label: '（10）文字最小サイズ5.5pt以上（カゴメ）', pass: true },
      { id: '11', label: '（11）一括表示8pt以上（法的）', pass: true },
      { id: '12', label: '（12）栄養成分表示8pt以上（法的）', pass: true },
      { id: '13', label: '（13）注意表記6pt以上（法的）', pass: true },
      { id: '14', label: '（14）アレルギー表示8pt以上（カゴメ）', pass: true },
      { id: '15', label: '（15）お客様相談センター5.5pt以上（カゴメ）', pass: true },
    ]},
    { id: 'cat-4', label: '④ 文字配置ルール確認', pass: true, children: [
      { id: '16', label: '（16）栄養成分の字下げ（法定）', pass: true },
      { id: '17', label: '（17）裏面ストロー範囲に文字がかからない', pass: true },
    ]},
    { id: 'cat-5', label: '⑤ マークの照合', pass: true, children: [
      { id: '18', label: '（18）サイズ（規定サイズ以上）', pass: true },
      { id: '19', label: '（19）色ルール準拠', pass: true },
      { id: '20', label: '（20）複雑背景時のフチ', pass: true },
      { id: '21', label: '（21）保護エリア（クリアスペース）', pass: true },
      { id: '22', label: '（22）複雑背景時の可読性', pass: true },
      { id: '23', label: '（23）縦横比の維持', pass: true },
      { id: '24', label: '（24）テキスト内容が正しい', pass: true },
      { id: '25', label: '（25）テキストとマークの位置関係', pass: true },
      { id: '26', label: '（26）不自然なゆがみがない', pass: true },
      { id: '27', label: '（27）要素欠けがない', pass: true },
      { id: '28', label: '（28）余分な要素がない', pass: true },
    ]},
  ];
}

function treeWithFails(): CheckItem[] {
  return [
    { id: 'cat-1', label: '① 版下サイズの確認', pass: false, children: [
      { id: '1', label: '（1）版下の種類：多様なサイズ・包材', pass: true },
      { id: '2', label: '（2）版下台紙記載の寸法と合っているか', pass: true },
      { id: '3', label: '（3）規定範囲内にデザインが配置', pass: true },
      { id: '4', label: '（4）規定範囲内に文字が配置', pass: false },
    ]},
    { id: 'cat-2', label: '② 工場制約確認', pass: false, children: [
      { id: '5', label: '（5）印字範囲サイズ・白無地', pass: true },
      { id: '6', label: '（6）JANコードエリア保持・白無地', pass: true },
      { id: '7', label: '（7）ストロー位置（工場別）', pass: false },
      { id: '8', label: '（8）黒禁止エリアなど工場制約', pass: true },
    ]},
    { id: 'cat-3', label: '③ 文字サイズの確認', pass: false, children: [
      { id: '10', label: '（10）文字最小サイズ5.5pt以上（カゴメ）', pass: true },
      { id: '11', label: '（11）一括表示8pt以上（法的）', pass: true },
      { id: '12', label: '（12）栄養成分表示8pt以上（法的）', pass: true },
      { id: '13', label: '（13）注意表記6pt以上（法的）', pass: true },
      { id: '14', label: '（14）アレルギー表示8pt以上（カゴメ）', pass: false },
      { id: '15', label: '（15）お客様相談センター5.5pt以上（カゴメ）', pass: true },
    ]},
    { id: 'cat-4', label: '④ 文字配置ルール確認', pass: true, children: [
      { id: '16', label: '（16）栄養成分の字下げ（法定）', pass: true },
      { id: '17', label: '（17）裏面ストロー範囲に文字がかからない', pass: true },
    ]},
    { id: 'cat-5', label: '⑤ マークの照合', pass: false, children: [
      { id: '18', label: '（18）サイズ（規定サイズ以上）', pass: true },
      { id: '19', label: '（19）色ルール準拠', pass: false },
      { id: '20', label: '（20）複雑背景時のフチ', pass: true },
      { id: '21', label: '（21）保護エリア（クリアスペース）', pass: true },
      { id: '22', label: '（22）複雑背景時の可読性', pass: true },
      { id: '23', label: '（23）縦横比の維持', pass: true },
      { id: '24', label: '（24）テキスト内容が正しい', pass: true },
      { id: '25', label: '（25）テキストとマークの位置関係', pass: true },
      { id: '26', label: '（26）不自然なゆがみがない', pass: true },
      { id: '27', label: '（27）要素欠けがない', pass: true },
      { id: '28', label: '（28）余分な要素がない', pass: true },
    ]},
  ];
}

export const RESULTS: ResultRecord[] = [
  { id: 'R-004', at: '2025-10-21 10:15', packageName: 'パッケージB', executor: '田中', tree: treeAllPass() },
  { id: 'R-003', at: '2025-10-21 09:40', packageName: 'パッケージA', executor: '佐藤', tree: treeWithFails() },
  { id: 'R-002', at: '2025-10-20 16:05', packageName: 'パッケージC', executor: '鈴木', tree: treeAllPass() },
  { id: 'R-001', at: '2025-10-20 15:20', packageName: 'パッケージD', executor: '山田', tree: treeWithFails() },
];

export function getResults() {
  return RESULTS.map(r => ({
    id: r.id,
    at: r.at,
    packageName: r.packageName,
    executor: r.executor,
    pass: computeOverallPass(r.tree),
  }));
}

export function getResultTree(id: string | undefined): CheckItem[] {
  const hit = RESULTS.find(r => r.id === id);
  return hit ? hit.tree : treeWithFails();
}


