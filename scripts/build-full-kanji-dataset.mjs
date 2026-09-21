import fs from 'fs';
import path from 'path';

const outDir = path.join(process.cwd(), 'public', 'data-kanji');

// 1. Read existing radicals.json
const radicals = JSON.parse(
  fs.readFileSync(path.join(outDir, 'radicals.json'), 'utf-8'),
);

const radicalByChar = new Map();
const radicalById = new Map();

radicals.forEach(r => {
  radicalByChar.set(r.char, r);
  radicalById.set(r.id, r);
  r.altForms.forEach(alt => {
    radicalByChar.set(alt, r);
  });
});

// Alias mapping for KRADFILE specific forms -> standard 214 Kangxi radicals
const kradAliases = {
  'ノ': '丿',
  '｜': '丨',
  'ハ': '八',
  '⺅': '亻',
  '𠆢': '人',
  '⺾': '艹',
  '⻖': '阝',
  '⻏': '阝',
  '辶': '辶',
  '⺹': '耂',
  'ヨ': '彐',
  '西': '襾',
  '九': '乙',
  '也': '乙',
  '乃': '丿',
  '久': '丿',
  '亡': '亠',
  '井': '二',
  '五': '二',
  '元': '儿',
  '巨': '工',
  '冊': '冂',
  '屯': '屮',
  '尤': '尢',
  '勿': '勹',
  '巴': '己',
  '品': '口',
  '世': '一',
  '及': '又',
  '免': '儿',
  'マ': '卩',
  '并': '干',
  '無': '灬',
  '岡': '冂',
  '奄': '大',
  '滴': '氵',
  '⺣': '灬',
  '⺭': '礻',
  '⻂': '衤',
  '⺨': '犭',
  '⺘': '扌',
  '⺡': '氵',
  '⺖': '忄'
};

async function main() {
  console.log('Fetching kradfile-u from GitHub...');
  const res = await fetch(
    'https://raw.githubusercontent.com/jmettraux/kensaku/master/data/kradfile-u',
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch kradfile-u: ${res.status}`);
  }
  const text = await res.text();

  const kradMap = new Map();
  text.split('\n').forEach(line => {
    if (!line || line.startsWith('#')) return;
    const parts = line.split(' : ');
    if (parts.length === 2) {
      kradMap.set(parts[0].trim(), parts[1].trim().split(/\s+/));
    }
  });
  console.log(`Parsed ${kradMap.size} kanji decompositions from kradfile-u.`);

  // Load existing hand-crafted rich stories from radical_kanji_map.json
  const existingMapFile = path.join(outDir, 'radical_kanji_map.json');
  const existingMap = fs.existsSync(existingMapFile)
    ? JSON.parse(fs.readFileSync(existingMapFile, 'utf-8'))
    : [];

  const handCraftedStories = new Map();
  existingMap.forEach(item => {
    handCraftedStories.set(item.kanji, item);
  });

  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const allCompositions = [];
  const processedKanji = new Set();

  for (const lvl of levels) {
    const kanjiFilePath = path.join(outDir, `${lvl}.json`);
    if (!fs.existsSync(kanjiFilePath)) continue;

    const kanjiList = JSON.parse(fs.readFileSync(kanjiFilePath, 'utf-8'));

    for (const item of kanjiList) {
      const char = item.kanjiChar;
      if (processedKanji.has(char)) continue;
      processedKanji.add(char);

      // If we already have a curated hand-crafted story, use it or merge
      const curated = handCraftedStories.get(char);

      const rawRads = kradMap.get(char) || [];
      const normalizedRads = [];
      const radNames = [];
      const radIds = [];

      rawRads.forEach(r => {
        const canonicalChar = kradAliases[r] || r;
        const radObj = radicalByChar.get(canonicalChar) || radicalByChar.get(r);
        if (radObj) {
          if (!normalizedRads.includes(radObj.char)) {
            normalizedRads.push(radObj.char);
            radNames.push(`${radObj.hanviet} (${radObj.meaning_vi})`);
            radIds.push(radObj.id);
          }
        } else if (!normalizedRads.includes(canonicalChar)) {
          normalizedRads.push(canonicalChar);
          radNames.push(canonicalChar);
        }
      });

      // Structure estimation based on radical count and positions
      let structure = curated?.structure || 'left-right';
      if (normalizedRads.length === 1) {
        structure = 'solo';
      } else if (normalizedRads.some(r => ['宀', '亠', '雨', '艹', '竹'].includes(r))) {
        structure = 'top-bottom';
      } else if (normalizedRads.some(r => ['囗', '門', '辶', '疒', '冂'].includes(r))) {
        structure = 'enclosure';
      }

      // Default story if not curated
      let story = curated?.story;
      if (!story) {
        if (normalizedRads.length > 1) {
          const joinedNames = radNames.slice(0, 3).join(' kết hợp cùng ');
          story = `Chữ ${char} (${item.hanviet}) mang nghĩa "${item.meanings[0] || ''}", được cấu thành từ các bộ: ${joinedNames}.`;
        } else {
          story = `Chữ ${char} (${item.hanviet}) mang nghĩa "${item.meanings[0] || ''}", thuộc bộ thủ ${radNames[0] || char}.`;
        }
      }

      // Specialized custom mnemonics for notable beginner characters like 千, 万, 百...
      if (char === '千') {
        story = 'Thêm một nét phẩy (丿) lên đầu chữ Thập (十) để biến mười lần một trăm thành một nghìn (千).';
        structure = 'top-bottom';
      } else if (char === '万') {
        story = 'Một (一) vạch ngăn cách mở ra không gian vô tận vạn dặm (万: mười nghìn).';
        structure = 'top-bottom';
      } else if (char === '百') {
        story = 'Một (一) vạch ngang phía trên chữ Bạch (白 - trắng) tạo thành số một trăm (百).';
        structure = 'top-bottom';
      } else if (char === '円') {
        story = 'Hình khung vây quanh (冂) đồng tiền xu tròn trịa của Nhật Bản (円: yên, tròn).';
        structure = 'enclosure';
      } else if (char === '年') {
        story = 'Thời xưa, một vụ thu hoạch lúa mùa (禾/干) kết thúc đánh dấu tròn một năm (年).';
        structure = 'top-bottom';
      } else if (char === '上') {
        story = 'Chữ chỉ sự: một nét chấm nằm ở phía trên (上) một đường ngang chuẩn.';
        structure = 'top-bottom';
      } else if (char === '下') {
        story = 'Chữ chỉ sự: một nét chấm nằm ở phía dưới (下) một đường ngang chuẩn.';
        structure = 'top-bottom';
      } else if (char === '中') {
        story = 'Một đường sổ thẳng (丨) xuyên qua chính giữa cái miệng/khung vuông (口) là ở giữa (中).';
        structure = 'enclosure';
      }

      allCompositions.push({
        kanji: char,
        hanviet: item.hanviet || curated?.hanviet || '',
        meanings: item.meanings || curated?.meanings || [],
        onyomi: item.onyomi || curated?.onyomi || [],
        kunyomi: item.kunyomi || curated?.kunyomi || [],
        radicals: curated?.radicals || (normalizedRads.length > 0 ? normalizedRads : [char]),
        radicalNames: curated?.radicalNames || radNames,
        radicalIds: curated?.radicalIds || radIds,
        primaryRadical: curated?.primaryRadical || (radIds[0] || 1),
        structure,
        story,
        level: lvl,
      });
    }
  }

  // Also retain any hand-crafted entries not in the N5-N1 list
  for (const curated of existingMap) {
    if (!processedKanji.has(curated.kanji)) {
      allCompositions.push(curated);
      processedKanji.add(curated.kanji);
    }
  }

  fs.writeFileSync(
    path.join(outDir, 'radical_kanji_map.json'),
    JSON.stringify(allCompositions, null, 2),
    'utf-8',
  );

  console.log(
    `✅ Successfully built full radical_kanji_map.json with ${allCompositions.length} Kanji!`,
  );
}

main().catch(err => {
  console.error('Build full kanji dataset error:', err);
  process.exit(1);
});
