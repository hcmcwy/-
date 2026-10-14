import { Participant } from '../types';

export interface SampleTemplate {
  id: string;
  title: string;
  description: string;
  json: string;
}

export const SAMPLE_TEMPLATES: SampleTemplate[] = [
  {
    id: 'company-gala',
    title: '公司尾牙 / 春酒抽獎',
    description: '包含同仁姓名、部門與工號，標準物件格式',
    json: JSON.stringify(
      [
        { name: '陳建宏', department: '資訊科技部', note: '工號 #A102' },
        { name: '林怡君', department: '行銷企劃部', note: '工號 #B205' },
        { name: '黃俊傑', department: '產品研發處', note: '工號 #A108' },
        { name: '張雅婷', department: '人力資源部', note: '工號 #C301' },
        { name: '李家豪', department: '業務拓展處', note: '工號 #D412' },
        { name: '王淑華', department: '財務管理部', note: '工號 #E503' },
        { name: '吳志強', department: '營運維護部', note: '工號 #F604' },
        { name: '蔡美玲', department: '客戶服務中心', note: '工號 #G710' },
        { name: '劉冠宇', department: '資訊科技部', note: '工號 #A115' },
        { name: '許芳瑜', department: '行銷企劃部', note: '工號 #B218' },
        { name: '鄭宇翔', department: '產品研發處', note: '工號 #A122' },
        { name: '謝佳蓉', department: '行政總務部', note: '工號 #C315' },
      ],
      null,
      2
    ),
  },
  {
    id: 'simple-names',
    title: '簡約純字串名單',
    description: '最快速的純文字陣列格式，直接輸入名字',
    json: JSON.stringify(
      [
        '陳大文',
        '李秀蘭',
        '張志明',
        '林春桃',
        '黃天賜',
        '何美麗',
        '周國榮',
        '郭小倩',
        '曾偉倫',
        '梁慧心',
      ],
      null,
      2
    ),
  },
  {
    id: 'weighted-draw',
    title: '自訂加權抽獎名單',
    description: '每個成員可指派不同的抽獎權重（權重越大、佔輪盤扇形越廣）',
    json: JSON.stringify(
      [
        { name: '金牌隊伍 · 榮譽席', weight: 4, note: '績效卓越加成 4x' },
        { name: '銀牌隊伍 · 先鋒組', weight: 3, note: '優秀專案加成 3x' },
        { name: '銅牌隊伍 · 菁英組', weight: 2, note: '進步獎勵加成 2x' },
        { name: '普獎參與組 A', weight: 1, note: '標準權重 1x' },
        { name: '普獎參與組 B', weight: 1, note: '標準權重 1x' },
        { name: '普獎參與組 C', weight: 1, note: '標準權重 1x' },
      ],
      null,
      2
    ),
  },
  {
    id: 'classroom-students',
    title: '課堂點名 / 幸運問答',
    description: '適合教室與教學場景，含座號與姓名',
    json: JSON.stringify(
      [
        { name: '01 號 · 李浩然', department: '三年一班' },
        { name: '02 號 · 張子萱', department: '三年一班' },
        { name: '03 號 · 王柏宇', department: '三年一班' },
        { name: '04 號 · 趙語嫣', department: '三年一班' },
        { name: '05 號 · 孫凡恩', department: '三年一班' },
        { name: '06 號 · 錢思齊', department: '三年一班' },
        { name: '07 號 · 周敬修', department: '三年一班' },
        { name: '08 號 · 吳天晴', department: '三年一班' },
      ],
      null,
      2
    ),
  },
];

/**
 * Parses user-provided JSON string into normalized Participant array.
 * Accepts:
 *  - string[]: ["Alice", "Bob"]
 *  - Participant[]: [{ name: "Alice", weight: 2 }]
 *  - { participants: [...] } or { list: [...] }
 */
export function parseParticipantsJson(jsonStr: string): {
  success: boolean;
  participants: Participant[];
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonStr);

    let rawList: unknown[] = [];
    if (Array.isArray(parsed)) {
      rawList = parsed;
    } else if (parsed && typeof parsed === 'object') {
      const candidateList =
        (parsed as Record<string, unknown>).participants ||
        (parsed as Record<string, unknown>).list ||
        (parsed as Record<string, unknown>).items ||
        (parsed as Record<string, unknown>).data;
      if (Array.isArray(candidateList)) {
        rawList = candidateList;
      } else {
        return {
          success: false,
          participants: [],
          error: 'JSON 必須是陣列，或是包含 participants / list 屬性的物件。',
        };
      }
    } else {
      return {
        success: false,
        participants: [],
        error: 'JSON 必須是陣列格式，例如 ["名單A", "名單B"] 或 [ { "name": "名單A" } ]。',
      };
    }

    if (rawList.length === 0) {
      return {
        success: false,
        participants: [],
        error: '名單陣列為空，請至少填入 1 位抽獎對象。',
      };
    }

    const participants: Participant[] = rawList.map((item, idx) => {
      if (typeof item === 'string' || typeof item === 'number') {
        return {
          id: `p-${idx + 1}-${Date.now()}`,
          name: String(item).trim() || `參加者 ${idx + 1}`,
          weight: 1,
        };
      }
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        const nameVal = obj.name || obj.title || obj.label || obj.username || `參加者 ${idx + 1}`;
        const weightVal = typeof obj.weight === 'number' && obj.weight > 0 ? obj.weight : 1;
        const deptVal = obj.department ? String(obj.department) : obj.dept ? String(obj.dept) : undefined;
        const noteVal = obj.note ? String(obj.note) : obj.remark ? String(obj.remark) : undefined;
        const colorVal = obj.color ? String(obj.color) : undefined;

        return {
          id: obj.id ? String(obj.id) : `p-${idx + 1}-${Date.now()}`,
          name: String(nameVal).trim(),
          weight: weightVal,
          department: deptVal,
          note: noteVal,
          color: colorVal,
        };
      }
      return {
        id: `p-${idx + 1}-${Date.now()}`,
        name: `參加者 ${idx + 1}`,
        weight: 1,
      };
    });

    return {
      success: true,
      participants,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      participants: [],
      error: `JSON 語法錯誤：${message}`,
    };
  }
}

export function exportParticipantsToJson(participants: Participant[]): string {
  const exportable = participants.map((p) => {
    const item: Record<string, unknown> = {
      name: p.name,
    };
    if (p.weight && p.weight !== 1) item.weight = p.weight;
    if (p.department) item.department = p.department;
    if (p.note) item.note = p.note;
    if (p.color) item.color = p.color;
    return item;
  });
  return JSON.stringify(exportable, null, 2);
}
