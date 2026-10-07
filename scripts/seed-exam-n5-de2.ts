import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();
if (fs.existsSync(path.join(process.cwd(), '.env.local'))) {
  dotenv.config({ path: path.join(process.cwd(), '.env.local') });
}

interface QuestionDef {
  sectionNumber: number;
  sectionTitle: string;
  questionNumber: number;
  globalNumber: number;
  partId: 'kanji' | 'vocab' | 'similar' | 'grammar' | 'star' | 'passage';
  questionText: string;
  correctOption: string;
  correctText: string;
  hanviet?: string | null;
  meaning: string;
  explanation: string;
  note?: string | null;
  starOrder?: string | null;
  fullSentence?: string | null;
  wrongOptions: { option: string; text: string }[];
}

export const N5_DE2_QUESTIONS: QuestionDef[] = [
  // ==========================================
  // PHẦN 1 — KANJI (Câu 10 - 18)
  // ==========================================
  {
    sectionNumber: 1,
    sectionTitle: 'Phần Kanji',
    questionNumber: 10,
    globalNumber: 1,
    partId: 'kanji',
    questionText: 'うちから えきまで あるいて 十分です。',
    correctOption: '②',
    correctText: 'じゅっぷん',
    hanviet: '十 – THẬP; 分 – PHÂN',
    meaning: 'Từ nhà đến ga đi bộ mất 10 phút.',
    explanation:
      '十分 trong câu này chỉ thời gian 10 phút, đọc là じゅっぷん. Cũng có cách đọc じっぷん, nhưng không xuất hiện trong lựa chọn.',
    wrongOptions: [
      {
        option: '①',
        text: 'じゅっぶん: sai âm; sau âm ngắt っ, ở từ này phải là ぷん.',
      },
      {
        option: '③',
        text: 'じゅうぶん: là cách đọc của 十分 khi mang nghĩa đủ, đầy đủ, không phải 10 phút.',
      },
      {
        option: '④',
        text: 'じゅうぷん: không phải cách đọc chuẩn của 10 phút; cần biến âm thành じゅっぷん／じっぷん.',
      },
    ],
  },
  {
    sectionNumber: 1,
    sectionTitle: 'Phần Kanji',
    questionNumber: 11,
    globalNumber: 2,
    partId: 'kanji',
    questionText: 'きょうは 学校が やすみです。',
    correctOption: '④',
    correctText: 'がっこう',
    hanviet: '学 – HỌC; 校 – HIỆU',
    meaning: 'Hôm nay trường nghỉ học.',
    explanation: '学校 viết đúng cách đọc là がっこう.',
    wrongOptions: [
      { option: '①', text: 'がこ: thiếu cả âm ngắt っ và trường âm う.' },
      { option: '②', text: 'がっこ: có âm ngắt nhưng thiếu trường âm う.' },
      { option: '③', text: 'がこう: có trường âm nhưng thiếu âm ngắt っ.' },
    ],
    note: 'Ghi nhớ: 学校 viết đúng cách đọc là がっこう.',
  },
  {
    sectionNumber: 1,
    sectionTitle: 'Phần Kanji',
    questionNumber: 12,
    globalNumber: 3,
    partId: 'kanji',
    questionText: 'この おべんとうは 千円です。',
    correctOption: '②',
    correctText: 'せんえん',
    hanviet: '千 – THIÊN; 円 – VIÊN',
    meaning: 'Hộp cơm này giá 1.000 yên.',
    explanation: '千（せん）＋円（えん）→ せんえん.',
    wrongOptions: [
      {
        option: '①',
        text: 'せんねん: là cách đọc của 千年, nghĩa là 1.000 năm.',
      },
      { option: '③', text: 'せねん: sai cách đọc của cả cụm 千円.' },
      { option: '④', text: 'せえん: thiếu âm ん của 千.' },
    ],
  },
  {
    sectionNumber: 1,
    sectionTitle: 'Phần Kanji',
    questionNumber: 13,
    globalNumber: 4,
    partId: 'kanji',
    questionText: '目が いたいです。',
    correctOption: '①',
    correctText: 'め',
    hanviet: '目 – MỤC',
    meaning: 'Tôi bị đau mắt.',
    explanation: '目 đọc là め, nghĩa là mắt.',
    wrongOptions: [
      { option: '②', text: 'て → 手: tay. Hán Việt: THỦ.' },
      { option: '③', text: 'あし → 足: chân. Hán Việt: TÚC.' },
      { option: '④', text: 'みみ → 耳: tai. Hán Việt: NHĨ.' },
    ],
  },
  {
    sectionNumber: 1,
    sectionTitle: 'Phần Kanji',
    questionNumber: 14,
    globalNumber: 5,
    partId: 'kanji',
    questionText: 'ケーキを 八つ かいました。',
    correctOption: '③',
    correctText: 'やっつ',
    hanviet: '八 – BÁT',
    meaning: 'Tôi đã mua tám cái bánh.',
    explanation:
      '八 đọc là はち khi đếm số thông thường, nhưng 八つ đọc là やっつ.',
    wrongOptions: [
      { option: '①', text: 'むっつ → 六つ: sáu cái. 六 – LỤC.' },
      { option: '②', text: 'よっつ → 四つ: bốn cái. 四 – TỨ.' },
      { option: '④', text: 'ここのつ → 九つ: chín cái. 九 – CỬU.' },
    ],
    note: 'Ghi nhớ: 八 đọc là はち khi đếm số thông thường, nhưng 八つ đọc là やっつ.',
  },
  {
    sectionNumber: 1,
    sectionTitle: 'Phần Kanji',
    questionNumber: 15,
    globalNumber: 6,
    partId: 'kanji',
    questionText: '今から でかけます。',
    correctOption: '④',
    correctText: 'いま',
    hanviet: '今 – KIM',
    meaning: 'Bây giờ tôi sẽ ra ngoài.',
    explanation:
      '今から nghĩa là “từ bây giờ”; trong câu này hiểu tự nhiên là “bây giờ sẽ…”.',
    wrongOptions: [
      { option: '①', text: 'きょう → 今日: hôm nay. 今 – KIM; 日 – NHẬT.' },
      { option: '②', text: 'あした → 明日: ngày mai. 明 – MINH; 日 – NHẬT.' },
      { option: '③', text: 'きのう → 昨日: hôm qua. 昨 – TẠC; 日 – NHẬT.' },
    ],
  },
  {
    sectionNumber: 1,
    sectionTitle: 'Phần Kanji',
    questionNumber: 16,
    globalNumber: 7,
    partId: 'kanji',
    questionText: 'うちの 前に コンビニが あります。',
    correctOption: '①',
    correctText: 'まえ',
    hanviet: '前 – TIỀN',
    meaning: 'Có cửa hàng tiện lợi ở trước nhà tôi.',
    explanation: 'うちの前: phía trước nhà.',
    wrongOptions: [
      { option: '②', text: 'うしろ → 後ろ: phía sau. 後 – HẬU.' },
      { option: '③', text: 'みぎ → 右: bên phải. 右 – HỮU.' },
      { option: '④', text: 'ひだり → 左: bên trái. 左 – TẢ.' },
    ],
  },
  {
    sectionNumber: 1,
    sectionTitle: 'Phần Kanji',
    questionNumber: 17,
    globalNumber: 8,
    partId: 'kanji',
    questionText: 'きのうは 雨でした。',
    correctOption: '②',
    correctText: 'あめ',
    hanviet: '雨 – VŨ',
    meaning: 'Hôm qua trời mưa.',
    explanation: '雨 đọc là あめ, nghĩa là mưa.',
    wrongOptions: [
      { option: '①', text: 'ゆき → 雪: tuyết. 雪 – TUYẾT.' },
      { option: '③', text: 'そら → 空: bầu trời. 空 – KHÔNG.' },
      { option: '④', text: 'かぜ → 風: gió. 風 – PHONG.' },
    ],
  },
  {
    sectionNumber: 1,
    sectionTitle: 'Phần Kanji',
    questionNumber: 18,
    globalNumber: 9,
    partId: 'kanji',
    questionText: 'わたしの あねは かみが 長いです。',
    correctOption: '①',
    correctText: 'ながい',
    hanviet: '長 – TRƯỜNG',
    meaning: 'Chị gái tôi có mái tóc dài.',
    explanation: '髪が長い: tóc dài; 髪が短い: tóc ngắn.',
    wrongOptions: [
      { option: '②', text: 'みじかい → 短い: ngắn. 短 – ĐOẢN.' },
      { option: '③', text: 'おおい → 多い: nhiều. 多 – ĐA.' },
      { option: '④', text: 'すくない → 少ない: ít. 少 – THIỂU.' },
    ],
    note: 'Ghi nhớ: 髪が長い: tóc dài; 髪が短い: tóc ngắn.',
  },

  // ==========================================
  // PHẦN 2 — TỪ VỰNG (Câu 1 - 10)
  // ==========================================
  {
    sectionNumber: 2,
    sectionTitle: 'Phần từ vựng',
    questionNumber: 1,
    globalNumber: 10,
    partId: 'vocab',
    questionText: 'きょうしつの（　　）を しめました。',
    correctOption: '①',
    correctText: 'ドア',
    meaning: 'Tôi đã đóng cửa lớp học.',
    explanation: 'ドアを閉める（しめる）: đóng cửa.',
    wrongOptions: [
      {
        option: '②',
        text: 'アパート: căn hộ/nhà chung cư cho thuê; không phải đồ vật được đóng trong câu này.',
      },
      { option: '③', text: 'ベッド: giường.' },
      { option: '④', text: 'テーブル: bàn.' },
    ],
  },
  {
    sectionNumber: 2,
    sectionTitle: 'Phần từ vựng',
    questionNumber: 2,
    globalNumber: 11,
    partId: 'vocab',
    questionText: 'うちの なかで スリッパを（　　）。',
    correctOption: '④',
    correctText: 'はきます',
    meaning: 'Tôi đi dép trong nhà.',
    explanation:
      '履きます（はきます） dùng với giày, dép, tất và đồ mặc ở phần thân dưới. → スリッパを履きます: đi dép.',
    wrongOptions: [
      { option: '①', text: 'かぶります: đội, dùng với mũ → 帽子をかぶります.' },
      { option: '②', text: 'きます: mặc áo, váy liền… → シャツを着ます.' },
      { option: '③', text: 'かけます: đeo kính… → 眼鏡をかけます.' },
    ],
  },
  {
    sectionNumber: 2,
    sectionTitle: 'Phần từ vựng',
    questionNumber: 3,
    globalNumber: 12,
    partId: 'vocab',
    questionText:
      'すみません。さいふを わすれましたから、おかねを（　　）ください。',
    correctOption: '②',
    correctText: 'かして',
    meaning: 'Xin lỗi, vì tôi quên ví nên bạn cho tôi mượn tiền nhé.',
    explanation: '貸す（かす）: cho mượn. → 貸してください: hãy cho tôi mượn.',
    wrongOptions: [
      {
        option: '①',
        text: 'かかって: thể て của かかる; không mang nghĩa cho mượn.',
      },
      {
        option: '③',
        text: 'かりて: thể て của 借りる, nghĩa là mượn. 借りてください là yêu cầu người nghe đi mượn.',
      },
      {
        option: '④',
        text: 'かって: thể て của 買う, nghĩa là mua; không phù hợp với お金 trong tình huống này.',
      },
    ],
    note: 'Ghi nhớ: 貸してください = hãy cho tôi mượn; 借りてもいいですか = tôi mượn được không?',
  },
  {
    sectionNumber: 2,
    sectionTitle: 'Phần từ vựng',
    questionNumber: 4,
    globalNumber: 13,
    partId: 'vocab',
    questionText: 'この ほんは とても（　　）です。',
    correctOption: '②',
    correctText: 'あつい',
    meaning: 'Quyển sách này rất dày.',
    explanation: '厚い（あつい）: dày. → 厚い本: sách dày.',
    wrongOptions: [
      {
        option: '①',
        text: 'いそがしい: bận rộn; không miêu tả độ dày của sách.',
      },
      { option: '③', text: 'からい: cay; không phù hợp với sách.' },
      { option: '④', text: 'おそい: chậm, muộn; không phù hợp.' },
    ],
    note: 'Ghi nhớ: 厚い: dày · 暑い: nóng về thời tiết · 熱い: nóng về nhiệt độ vật.',
  },
  {
    sectionNumber: 2,
    sectionTitle: 'Phần từ vựng',
    questionNumber: 5,
    globalNumber: 14,
    partId: 'vocab',
    questionText: 'きょうは なのか、あしたは（　　）です。',
    correctOption: '③',
    correctText: 'ようか',
    meaning: 'Hôm nay là ngày 7, ngày mai là ngày 8.',
    explanation: '七日（なのか） → 八日（ようか）.',
    wrongOptions: [
      { option: '①', text: 'よっか → 四日: ngày 4.' },
      { option: '②', text: 'むいか → 六日: ngày 6.' },
      { option: '④', text: 'はつか → 二十日: ngày 20.' },
    ],
  },
  {
    sectionNumber: 2,
    sectionTitle: 'Phần từ vựng',
    questionNumber: 6,
    globalNumber: 15,
    partId: 'vocab',
    questionText: 'がっこうで（　　）を たべました。',
    correctOption: '④',
    correctText: 'おべんとう',
    meaning: 'Tôi đã ăn cơm hộp ở trường.',
    explanation: 'お弁当（おべんとう） là đồ ăn, phù hợp với 食べる.',
    wrongOptions: [
      { option: '①', text: 'おさら: đĩa, là dụng cụ đựng thức ăn.' },
      { option: '②', text: 'はし: đũa, là dụng cụ ăn.' },
      { option: '③', text: 'しょくどう: nhà ăn, là địa điểm.' },
    ],
    note: 'Ghi nhớ: 食堂でお弁当を食べます: ăn cơm hộp ở nhà ăn.',
  },
  {
    sectionNumber: 2,
    sectionTitle: 'Phần từ vựng',
    questionNumber: 7,
    globalNumber: 16,
    partId: 'vocab',
    questionText: 'あめが ふって いますから、かさを（　　）。',
    correctOption: '②',
    correctText: 'さしましょう',
    meaning: 'Vì trời đang mưa nên chúng ta che ô nhé.',
    explanation:
      '傘を差す（かさをさす）: che ô. → 差しましょう: hãy che ô/chúng ta che ô nhé.',
    wrongOptions: [
      {
        option: '①',
        text: 'きましょう: nếu là 着ましょう thì nghĩa là “hãy mặc”; không dùng với ô.',
      },
      { option: '③', text: 'のりましょう: hãy lên/đi phương tiện, từ 乗る.' },
      { option: '④', text: 'つけましょう: hãy bật/gắn…' },
    ],
  },
  {
    sectionNumber: 2,
    sectionTitle: 'Phần từ vựng',
    questionNumber: 8,
    globalNumber: 17,
    partId: 'vocab',
    questionText: 'ちいさい（　　）が さきました。',
    correctOption: '④',
    correctText: 'はな',
    meaning: 'Một bông hoa nhỏ đã nở.',
    explanation: '花が咲く（はながさく）: hoa nở.',
    wrongOptions: [
      { option: '①', text: 'かき: quả hồng hoặc hàu; không phù hợp.' },
      { option: '②', text: 'せっけん: xà phòng.' },
      { option: '③', text: 'いす: ghế.' },
    ],
  },
  {
    sectionNumber: 2,
    sectionTitle: 'Phần từ vựng',
    questionNumber: 9,
    globalNumber: 18,
    partId: 'vocab',
    questionText: 'ねこは ほんだなの（　　）に います。',
    correctOption: '—',
    correctText: 'Thiếu dữ kiện',
    note: 'Thiếu dữ kiện — Cả bốn lựa chọn đều phù hợp ngữ pháp (① した, ② うしろ, ③ うえ, ④ そば)',
    meaning: 'Con mèo ở (trên/dưới/sau/cạnh) giá sách.',
    explanation:
      'Đề không có hình minh họa hoặc thông tin xác định con mèo ở đâu. Cả bốn lựa chọn đều đúng cấu trúc Nの＋vị trí＋にいます.',
    wrongOptions: [],
  },
  {
    sectionNumber: 2,
    sectionTitle: 'Phần từ vựng',
    questionNumber: 10,
    globalNumber: 19,
    partId: 'vocab',
    questionText: 'こうえんに きが（　　）あります。',
    correctOption: '①',
    correctText: 'たくさん',
    meaning: 'Trong công viên có nhiều cây.',
    explanation:
      'たくさん chỉ số lượng nhiều, dùng được với cây cối, đồ vật, con người…',
    wrongOptions: [
      { option: '②', text: 'おおぜい: nhiều người, không dùng cho cây.' },
      {
        option: '③',
        text: 'とても: rất, thường bổ nghĩa mức độ của tính từ; không nói とてもあります.',
      },
      {
        option: '④',
        text: 'ゆっくり: chậm rãi, thong thả; không diễn tả số lượng.',
      },
    ],
  },

  // ==========================================
  // PHẦN 3 — CHỌN CÂU GẦN NGHĨA (Câu 1 - 5)
  // ==========================================
  {
    sectionNumber: 3,
    sectionTitle: 'Phần chọn câu gần nghĩa',
    questionNumber: 1,
    globalNumber: 20,
    partId: 'similar',
    questionText: 'さらいねん くにへ かえります。',
    correctOption: '②',
    correctText: '2ねんあとで くにへ かえります。',
    meaning: 'Năm sau nữa tôi sẽ về nước.',
    explanation:
      '再来年（さらいねん）: năm sau nữa, tức năm cách năm hiện tại hai năm. Trong các lựa chọn, ② gần nghĩa nhất.',
    wrongOptions: [
      { option: '①', text: '1ねんあとで: sau một năm.' },
      { option: '③', text: '3ねんあとで: sau ba năm.' },
      { option: '④', text: '4ねんあとで: sau bốn năm.' },
    ],
    note: 'Ghi nhớ: 今年: năm nay → 来年: năm sau → 再来年: năm sau nữa.',
  },
  {
    sectionNumber: 3,
    sectionTitle: 'Phần chọn câu gần nghĩa',
    questionNumber: 2,
    globalNumber: 21,
    partId: 'similar',
    questionText: 'あそこは だいどころです。',
    correctOption: '①',
    correctText: 'あそこで りょうりを します。',
    meaning: 'Chỗ kia là nhà bếp.',
    explanation: '台所（だいどころ） là nhà bếp, nơi nấu ăn.',
    wrongOptions: [
      {
        option: '②',
        text: 'あそこから2かいにあがります: diễn tả lối lên tầng, không phải chức năng nhà bếp.',
      },
      {
        option: '③',
        text: 'あそこにおおきいきがあります: ở chỗ kia có cây to.',
      },
      {
        option: '④',
        text: 'あそこはひろいへやです: chỗ kia là căn phòng rộng.',
      },
    ],
  },
  {
    sectionNumber: 3,
    sectionTitle: 'Phần chọn câu gần nghĩa',
    questionNumber: 3,
    globalNumber: 22,
    partId: 'similar',
    questionText: 'あには けっこんして います。',
    correctOption: '①',
    correctText: 'あには おくさんが います。',
    meaning: 'Anh trai tôi đã kết hôn.',
    explanation: '結婚しています diễn tả trạng thái đã kết hôn, có vợ.',
    wrongOptions: [
      { option: '②', text: 'おじがいます: có chú/bác/cậu.' },
      { option: '③', text: 'あねがいます: có chị gái.' },
      { option: '④', text: 'おとうとがいます: có em trai.' },
    ],
  },
  {
    sectionNumber: 3,
    sectionTitle: 'Phần chọn câu gần nghĩa',
    questionNumber: 4,
    globalNumber: 23,
    partId: 'similar',
    questionText: 'わたしの かばんは かるいです。',
    correctOption: '①',
    correctText: 'わたしの かばんは おもくないです。',
    meaning: 'Cặp của tôi nhẹ.',
    explanation:
      '軽い（かるい） đối nghĩa với 重い（おもい）. “Nhẹ” và “không nặng” gần nghĩa nhất.',
    wrongOptions: [
      { option: '②', text: 'あたらしくない: không mới.' },
      { option: '③', text: 'きれいじゃない: không đẹp/không sạch.' },
      { option: '④', text: 'べんりじゃない: không tiện lợi.' },
    ],
  },
  {
    sectionNumber: 3,
    sectionTitle: 'Phần chọn câu gần nghĩa',
    questionNumber: 5,
    globalNumber: 24,
    partId: 'similar',
    questionText: 'しゅくだいを すこし しました。',
    correctOption: '②',
    correctText: 'しゅくだいを ちょっと しました。',
    meaning: 'Tôi đã làm một chút bài tập về nhà.',
    explanation: '少し（すこし） ≈ ちょっと: một chút.',
    wrongOptions: [
      { option: '①', text: 'ぜんぶ: tất cả → đã làm hết bài tập.' },
      { option: '③', text: 'はんぶん: một nửa → đã làm một nửa.' },
      { option: '④', text: 'たくさん: nhiều → đã làm nhiều bài tập.' },
    ],
  },

  // ==========================================
  // PHẦN 4 — NGỮ PHÁP (Câu 1 - 16)
  // ==========================================
  {
    sectionNumber: 4,
    sectionTitle: 'Phần ngữ pháp',
    questionNumber: 1,
    globalNumber: 25,
    partId: 'grammar',
    questionText: 'きょうは なに（　　）しません。やすみます。',
    correctOption: '③',
    correctText: 'も',
    meaning: 'Hôm nay tôi không làm gì cả. Tôi nghỉ ngơi.',
    explanation: '何もしません: không làm gì cả. 何も＋phủ định: không… gì cả.',
    wrongOptions: [
      {
        option: '①',
        text: 'は: không tạo cách nói phủ định toàn bộ “không làm gì cả”.',
      },
      { option: '②', text: 'か: 何か nghĩa là “cái gì đó”.' },
      {
        option: '④',
        text: 'を: 何をしません không tạo câu trần thuật “không làm gì cả”.',
      },
    ],
  },
  {
    sectionNumber: 4,
    sectionTitle: 'Phần ngữ pháp',
    questionNumber: 2,
    globalNumber: 26,
    partId: 'grammar',
    questionText: 'やすみの 日（　　）、ともだちと テニスを します。',
    correctOption: '③',
    correctText: 'に',
    meaning: 'Vào ngày nghỉ, tôi chơi quần vợt với bạn.',
    explanation:
      '休みの日に: vào ngày nghỉ. に đánh dấu thời điểm thực hiện hành động.',
    wrongOptions: [
      {
        option: '①',
        text: 'で: không dùng để chỉ thời điểm theo cấu trúc này.',
      },
      { option: '②', text: 'の: cần danh từ được bổ nghĩa phía sau.' },
      { option: '④', text: 'しか: cần đi với phủ định.' },
    ],
  },
  {
    sectionNumber: 4,
    sectionTitle: 'Phần ngữ pháp',
    questionNumber: 3,
    globalNumber: 27,
    partId: 'grammar',
    questionText: 'ラジオ（　　）ニュースを ききます。',
    correctOption: '④',
    correctText: 'で',
    meaning: 'Tôi nghe tin tức qua radio.',
    explanation:
      'Phương tiện＋で: bằng/qua phương tiện nào. → ラジオでニュースを聞く.',
    wrongOptions: [
      {
        option: '①',
        text: 'を: tạo hai cụm を không phù hợp: ラジオをニュースを聞く.',
      },
      {
        option: '②',
        text: 'も: không đánh dấu phương tiện theo cách cần dùng.',
      },
      { option: '③', text: 'は: không diễn đạt trực tiếp phương tiện nghe.' },
    ],
  },
  {
    sectionNumber: 4,
    sectionTitle: 'Phần ngữ pháp',
    questionNumber: 4,
    globalNumber: 28,
    partId: 'grammar',
    questionText: 'きょうは ノート（　　）ほんなどを かいました。',
    correctOption: '① / ④',
    correctText: '① – や hoặc ④ – と',
    meaning: 'Hôm nay tôi đã mua những thứ như vở, sách…',
    explanation:
      'Mẫu quen thuộc là AやBなど: những thứ như A, B… → ノートや本などを買いました. Tuy nhiên, ノートと本などを買いました cũng chấp nhận được.',
    wrongOptions: [
      {
        option: '②',
        text: 'で: không nối hai vật được mua với nghĩa liệt kê.',
      },
      { option: '③', text: 'を: tạo cấu trúc không phù hợp.' },
    ],
    note: 'Lưu ý khi chấm: Chấp nhận cả ① (や) và ④ (と).',
  },
  {
    sectionNumber: 4,
    sectionTitle: 'Phần ngữ pháp',
    questionNumber: 5,
    globalNumber: 29,
    partId: 'grammar',
    questionText: '彼女と あした（　　）あさってに 会います。',
    correctOption: '③',
    correctText: 'か',
    meaning: 'Tôi sẽ gặp cô ấy vào ngày mai hoặc ngày kia.',
    explanation: 'AかB: A hoặc B. → あしたかあさって: ngày mai hoặc ngày kia.',
    wrongOptions: [
      { option: '①', text: 'の: không thể hiện lựa chọn giữa hai ngày.' },
      { option: '②', text: 'が: không nối hai thời điểm với nghĩa “hoặc”.' },
      { option: '④', text: 'も: không tạo cấu trúc lựa chọn.' },
    ],
  },
  {
    sectionNumber: 4,
    sectionTitle: 'Phần ngữ pháp',
    questionNumber: 6,
    globalNumber: 30,
    partId: 'grammar',
    questionText: 'しごと（　　）おわった とき、もう よるの 2じでした。',
    correctOption: '④',
    correctText: 'が',
    meaning: 'Khi công việc kết thúc thì đã 2 giờ sáng rồi.',
    explanation:
      '仕事が終わる: công việc kết thúc. 終わる ở đây là tự động từ, 仕事 là chủ ngữ.',
    wrongOptions: [
      { option: '①', text: 'で: không đánh dấu chủ ngữ của 終わる.' },
      {
        option: '②',
        text: 'は: không phù hợp với mệnh đề 仕事が終わったとき.',
      },
      { option: '③', text: 'も: thêm nghĩa không cần thiết.' },
    ],
    note: 'Ghi nhớ: 夜の2時 trong câu này là 2 giờ sáng, có thể nói rõ hơn là 午前2時.',
  },
  {
    sectionNumber: 4,
    sectionTitle: 'Phần ngữ pháp',
    questionNumber: 7,
    globalNumber: 31,
    partId: 'grammar',
    questionText: 'わたし（　　）ほしい ものは これですよ。',
    correctOption: '②',
    correctText: 'の',
    meaning: 'Thứ tôi muốn là cái này đấy.',
    explanation:
      'Trong mệnh đề bổ nghĩa danh từ, が đánh dấu chủ ngữ có thể được thay bằng の (わたしがほしいもの → わたしのほしいもの).',
    wrongOptions: [
      {
        option: '①',
        text: 'は: không thay が để đánh dấu chủ ngữ bên trong mệnh đề bổ nghĩa.',
      },
      {
        option: '③',
        text: 'に: không đánh dấu người có mong muốn theo cấu trúc trên.',
      },
      { option: '④', text: 'で: không phù hợp.' },
    ],
    note: 'Ghi nhớ: の ở đây thay cho が, không chỉ đơn giản là の mang nghĩa sở hữu.',
  },
  {
    sectionNumber: 4,
    sectionTitle: 'Phần ngữ pháp',
    questionNumber: 8,
    globalNumber: 32,
    partId: 'grammar',
    questionText: '旅館の へやは ひとつ（　　）空いて います。',
    correctOption: '④',
    correctText: 'だけ',
    meaning: 'Nhà trọ kiểu Nhật chỉ còn một phòng trống.',
    explanation:
      'Số lượng＋だけ: chỉ có bấy nhiêu. → ひとつだけ空いています: chỉ có một phòng trống.',
    wrongOptions: [
      { option: '①', text: 'で: không tạo nghĩa giới hạn số lượng ở đây.' },
      { option: '②', text: 'に: không phù hợp.' },
      {
        option: '③',
        text: 'しか: cần đi với phủ định: ひとつしか空いていません.',
      },
    ],
    note: 'Ghi nhớ: だけ＋khẳng định và しか＋phủ định đều có thể diễn đạt “chỉ”.',
  },
  {
    sectionNumber: 4,
    sectionTitle: 'Phần ngữ pháp',
    questionNumber: 9,
    globalNumber: 33,
    partId: 'grammar',
    questionText: 'びょうき（　　）とき、がっこうを やすみます。',
    correctOption: '③',
    correctText: 'の',
    meaning: 'Khi bị ốm, tôi nghỉ học.',
    explanation: 'Danh từ＋の＋とき: khi… → 病気のとき: khi bị bệnh.',
    wrongOptions: [
      {
        option: '①',
        text: 'は, ② が: không nối trực tiếp danh từ 病気 với とき.',
      },
      {
        option: '④',
        text: 'で: có thể dùng trong 病気で学校を休みます, nhưng không tạo 病気でとき.',
      },
    ],
  },
  {
    sectionNumber: 4,
    sectionTitle: 'Phần ngữ pháp',
    questionNumber: 10,
    globalNumber: 34,
    partId: 'grammar',
    questionText: 'まいばん、なんじかんぐらい べんきょうします（　　）。',
    correctOption: '①',
    correctText: 'か',
    meaning: 'Mỗi tối bạn học khoảng mấy tiếng?',
    explanation: '何時間ぐらい hỏi thời lượng; か kết thúc câu hỏi lịch sự.',
    wrongOptions: [
      { option: '②', text: 'ね: thường tìm sự đồng tình/xác nhận.' },
      { option: '③', text: 'よ: thông báo, nhấn mạnh thông tin.' },
      { option: '④', text: 'わ: biểu thị sắc thái/cảm xúc.' },
    ],
  },
  {
    sectionNumber: 4,
    sectionTitle: 'Phần ngữ pháp',
    questionNumber: 11,
    globalNumber: 35,
    partId: 'grammar',
    questionText: '田中さんは（　　）人ですか。',
    correctOption: '①',
    correctText: 'どんな',
    meaning: 'Anh/chị Tanaka là người như thế nào?',
    explanation: 'どんな＋N: N như thế nào.',
    wrongOptions: [
      {
        option: '②',
        text: 'どんなの: không đặt trực tiếp trước 人; không nói どんなの人.',
      },
      { option: '③', text: 'どんなに: hỏi/nhấn mạnh mức độ.' },
      { option: '④', text: 'どんなが: kết hợp sai trước danh từ.' },
    ],
  },
  {
    sectionNumber: 4,
    sectionTitle: 'Phần ngữ pháp',
    questionNumber: 12,
    globalNumber: 36,
    partId: 'grammar',
    questionText:
      'A：田中さんの こどもは ことし（　　）さいですか。 B：5さいです。',
    correctOption: '②',
    correctText: 'なん',
    meaning: 'A: Con anh/chị Tanaka mấy tuổi? B: Cháu 5 tuổi.',
    explanation:
      '何歳（なんさい）: mấy tuổi. 何 trước 歳 đọc là なん, không phải なに.',
    wrongOptions: [
      { option: '①', text: 'なに: 何 trước 歳 đọc là なん, không phải なに.' },
      {
        option: '③',
        text: 'いくつ: tự nó đã hỏi tuổi; dùng いくつですか, không nói いくつさい.',
      },
      { option: '④', text: 'いくら: bao nhiêu tiền, không hỏi tuổi.' },
    ],
  },
  {
    sectionNumber: 4,
    sectionTitle: 'Phần ngữ pháp',
    questionNumber: 13,
    globalNumber: 37,
    partId: 'grammar',
    questionText: 'きのう ここに（　　）きましたか。',
    correctOption: '①',
    correctText: 'だれか',
    meaning: 'Hôm qua có ai đến đây không?',
    explanation: 'だれか: ai đó. Câu hỏi muốn biết có người nào đến hay không.',
    wrongOptions: [
      { option: '②', text: 'どこか: nơi nào đó, không chỉ người đến.' },
      {
        option: '③',
        text: 'いつか: lúc nào đó; không phù hợp khi đã xác định là きのう.',
      },
      { option: '④', text: 'どれか: cái nào đó trong một nhóm.' },
    ],
    note: 'Ghi nhớ: だれが来ましたか = ai đã đến?; だれか来ましたか = có ai đến không?',
  },
  {
    sectionNumber: 4,
    sectionTitle: 'Phần ngữ pháp',
    questionNumber: 14,
    globalNumber: 38,
    partId: 'grammar',
    questionText: 'せんしゅう、（　　）ものは ぜんぶ おぼえて いますか。',
    correctOption: '③',
    correctText: 'ならった',
    meaning: 'Bạn có nhớ hết những điều đã học tuần trước không?',
    explanation:
      'Động từ ở thể thông thường bổ nghĩa danh từ. 先週 chỉ quá khứ nên dùng 習った (先週習ったもの).',
    wrongOptions: [
      { option: '①', text: 'ならう: thể không quá khứ.' },
      {
        option: '②',
        text: 'ならいます: thể lịch sự, không dùng trực tiếp để bổ nghĩa.',
      },
      { option: '④', text: 'ならい: gốc ます, không tạo cụm bổ nghĩa.' },
    ],
  },
  {
    sectionNumber: 4,
    sectionTitle: 'Phần ngữ pháp',
    questionNumber: 15,
    globalNumber: 39,
    partId: 'grammar',
    questionText: 'それは こうちゃ（　　）ありません。コーヒーですよ。',
    correctOption: '③',
    correctText: 'では',
    meaning: 'Đó không phải trà đen. Là cà phê đấy.',
    explanation: 'Nではありません: không phải N.',
    wrongOptions: [
      { option: '①', text: 'には: không tạo dạng phủ định của câu danh từ.' },
      { option: '②', text: 'へは: liên quan hướng/đích đến, không phù hợp.' },
      { option: '④', text: 'のは: không tạo cấu trúc phủ định.' },
    ],
    note: 'Ghi nhớ: ではありません = じゃありません.',
  },
  {
    sectionNumber: 4,
    sectionTitle: 'Phần ngữ pháp',
    questionNumber: 16,
    globalNumber: 40,
    partId: 'grammar',
    questionText: 'きょうは（　　）日で、まちに 出て いる ひとが おおいです。',
    correctOption: '③',
    correctText: 'やすみの',
    meaning: 'Hôm nay là ngày nghỉ nên có nhiều người ra phố.',
    explanation: '休みの日: ngày nghỉ. Danh từ 休み nối với 日 bằng の.',
    wrongOptions: [
      {
        option: '①',
        text: 'やすみに: に không nối hai danh từ để tạo nghĩa “ngày nghỉ”.',
      },
      { option: '②', text: 'やすみ: thiếu の trong cách nói 休みの日.' },
      { option: '④', text: 'やすんだ: 休んだ日 có nghĩa là “ngày đã nghỉ”.' },
    ],
  },

  // ==========================================
  // PHẦN 5 — SẮP XẾP CÂU (Câu 17 - 21)
  // ==========================================
  {
    sectionNumber: 5,
    sectionTitle: 'Phần sắp xếp câu',
    questionNumber: 17,
    globalNumber: 41,
    partId: 'star',
    questionText: '鈴木さん ＿＿＿ ＿＿＿ ＿＿＿ ＿＿＿ を やすみました。',
    correctOption: '④',
    correctText: 'が',
    meaning: 'Hôm qua anh/chị Suzuki nghỉ làm.',
    explanation:
      '鈴木さんが: Suzuki là chủ ngữ; きのう: hôm qua; 会社を休む: nghỉ làm. ★ là ô đầu tiên -> ④ が.',
    wrongOptions: [
      { option: '①', text: 'やすみました' },
      { option: '②', text: 'きのう' },
      { option: '③', text: 'かいしゃ' },
    ],
    starOrder: '④ → ② → ③ → ①',
    fullSentence: '鈴木さん ★が きのう かいしゃ を やすみました。',
  },
  {
    sectionNumber: 5,
    sectionTitle: 'Phần sắp xếp câu',
    questionNumber: 18,
    globalNumber: 42,
    partId: 'star',
    questionText: 'ぼくと おさけを ＿＿＿ ＿＿＿ ＿＿＿ ＿＿＿。',
    correctOption: '①',
    correctText: 'のみ',
    meaning: 'Đi uống rượu với tôi không?',
    explanation:
      'V bỏ ます＋に行く: đi để làm gì. → 飲みます → 飲みに行く. ★ ở ô thứ hai -> ① のみ.',
    wrongOptions: [
      { option: '②', text: 'いかない' },
      { option: '③', text: 'に' },
      { option: '④', text: 'か' },
    ],
    starOrder: '④ → ① → ③ → ②',
    fullSentence: 'ぼくと おさけを ★のみ に いかない か。',
  },
  {
    sectionNumber: 5,
    sectionTitle: 'Phần sắp xếp câu',
    questionNumber: 19,
    globalNumber: 43,
    partId: 'star',
    questionText: 'きょうは ひま ＿＿＿ ＿＿＿ ＿＿＿ ＿＿＿ ありません。',
    correctOption: '③',
    correctText: 'こと',
    meaning: 'Hôm nay tôi rảnh, không có việc gì để làm.',
    explanation:
      'ひまで: rảnh và…; やること: việc để làm; やることはありません. ★ ở ô thứ ba -> ③ こと.',
    wrongOptions: [
      { option: '①', text: 'やる' },
      { option: '②', text: 'で' },
      { option: '④', text: 'は' },
    ],
    starOrder: '② → ① → ③ → ④',
    fullSentence: 'きょうは ひま で やる ★こと は ありません。',
  },
  {
    sectionNumber: 5,
    sectionTitle: 'Phần sắp xếp câu',
    questionNumber: 20,
    globalNumber: 44,
    partId: 'star',
    questionText: 'シャツを きて ＿＿＿ ＿＿＿ ＿＿＿ ＿＿＿ でかけます。',
    correctOption: '② / ③',
    correctText: '② して hoặc ③ ネクタイを',
    meaning: 'Tôi mặc áo sơ mi, thắt cà vạt rồi mới ra ngoài.',
    explanation:
      'Cách 1: シャツを着て、ネクタイをしてから出かけます (★ là ② して). Cách 2: シャツを着てから、ネクタイをして出かけます (★ là ③ ネクタイを). Cả 2 đều đúng ngữ pháp.',
    wrongOptions: [
      { option: '①', text: 'から' },
      { option: '④', text: 'シャツを' },
    ],
    starOrder: '④ → ③ → ② → ① hoặc ④ → ① → ③ → ②',
    fullSentence:
      'シャツを きて ネクタイを ★して から でかけます。 / シャツを きて から ★ネクタイを して でかけます。',
    note: 'Lưu ý khi chấm: Câu này có hai đáp án đúng tại ★, chấp nhận cả ② và ③.',
  },
  {
    sectionNumber: 5,
    sectionTitle: 'Phần sắp xếp câu',
    questionNumber: 21,
    globalNumber: 45,
    partId: 'star',
    questionText:
      '鈴木さんは 山田くん ＿＿＿ ＿＿＿ ＿＿＿ ＿＿＿ なりました。',
    correctOption: '③',
    correctText: 'に',
    meaning: 'Chị Suzuki đã trở thành vợ của anh Yamada.',
    explanation:
      '山田くんの奥さん: vợ của Yamada. Nになる: trở thành N. 奥さんになりました. ★ ở ô cuối -> ③ に.',
    wrongOptions: [
      { option: '①', text: 'の' },
      { option: '②', text: 'おくさん' },
      { option: '④', text: '山田くん' },
    ],
    starOrder: '② → ① → ④ → ③',
    fullSentence: '鈴木さんは 山田くん の おくさん ★に なりました。',
  },

  // ==========================================
  // PHẦN 6 — ĐIỀN VÀO ĐOẠN VĂN (Câu 22 - 26)
  // ==========================================
  {
    sectionNumber: 6,
    sectionTitle: 'Phần điền vào đoạn văn',
    questionNumber: 22,
    globalNumber: 46,
    partId: 'passage',
    questionText: '日本（　　）いろいろな 新聞が ありますが…',
    correctOption: '②',
    correctText: 'には',
    meaning: 'Ở Nhật có nhiều loại báo khác nhau, nhưng…',
    explanation:
      'Địa điểmに＋Nがあります: ở đâu có thứ gì. Thêm は để nêu địa điểm làm chủ đề: 日本にはいろいろな新聞があります。',
    wrongOptions: [
      { option: '①', text: 'では: thường dùng khi nói hoạt động ở một nơi.' },
      { option: '③', text: 'が: biến 日本 thành chủ ngữ không phù hợp.' },
      { option: '④', text: 'で: không đánh dấu nơi tồn tại trong câu này.' },
    ],
  },
  {
    sectionNumber: 6,
    sectionTitle: 'Phần điền vào đoạn văn',
    questionNumber: 23,
    globalNumber: 47,
    partId: 'passage',
    questionText: 'わたしは 一つ［a］読みません。…もの［b］です。',
    correctOption: '④',
    correctText: 'a：しか／b：だけ',
    meaning: 'Tôi chỉ đọc một loại báo. Đó chỉ là tờ có tên “Yomiuri Shimbun”.',
    explanation:
      '一つしか読みません: chỉ đọc một loại. しか＋phủ định. ものだけです: chỉ là loại đó. だけ＋khẳng định.',
    wrongOptions: [
      {
        option: '①',
        text: 'しか／しか: chỗ b sai vì しかです không tạo cấu trúc cần dùng.',
      },
      {
        option: '②',
        text: 'だけ／だけ: 一つだけ読みません mang nghĩa “chỉ có một loại tôi không đọc”.',
      },
      {
        option: '③',
        text: 'だけ／しか: chỗ a sai nghĩa trong mạch văn; chỗ b sai kết hợp.',
      },
    ],
    note: 'Ghi nhớ: 一つしか読みません và 一つだけ読みます đều có thể nghĩa là “chỉ đọc một loại”.',
  },
  {
    sectionNumber: 6,
    sectionTitle: 'Phần điền vào đoạn văn',
    questionNumber: 24,
    globalNumber: 48,
    partId: 'passage',
    questionText: '「読売新聞」と（　　）もの',
    correctOption: '④',
    correctText: 'いう',
    meaning: 'Loại báo có tên là “Yomiuri Shimbun”.',
    explanation:
      'Tên gọi＋という＋N: N được gọi là… → 「読売新聞」というもの: thứ/tờ báo có tên “Yomiuri Shimbun”.',
    wrongOptions: [
      { option: '①', text: 'おもう: nghĩ.' },
      {
        option: '②',
        text: 'かんがる: lỗi chính tả từ đề gốc, nghĩa suy nghĩ cũng không phù hợp.',
      },
      { option: '③', text: 'はなす: nói, trò chuyện.' },
    ],
  },
  {
    sectionNumber: 6,
    sectionTitle: 'Phần điền vào đoạn văn',
    questionNumber: 25,
    globalNumber: 49,
    partId: 'passage',
    questionText: 'テレビ（　　）あまり みません。',
    correctOption: '④ / ①',
    correctText: '④ – も hoặc ① – は',
    meaning:
      'Tôi cũng không xem tivi nhiều (hoặc Về tivi thì tôi không xem nhiều).',
    explanation:
      'Với ④ も: テレビもあまりみません (nối tiếp ý đọc báo). Với ① は: テレビはあまりみません (chuyển sang chủ đề tivi). Cả 2 đều đúng ngữ pháp.',
    wrongOptions: [
      {
        option: '②',
        text: 'が: không đánh dấu đối tượng xem của 見ます trong cấu trúc này.',
      },
      { option: '③', text: 'で: đánh dấu phương tiện, không phù hợp.' },
    ],
    note: 'Lưu ý khi chấm: Chấp nhận cả ④ (も) và ① (は).',
  },
  {
    sectionNumber: 6,
    sectionTitle: 'Phần điền vào đoạn văn',
    questionNumber: 26,
    globalNumber: 50,
    partId: 'passage',
    questionText: 'すきな 番組が すくない（　　）。',
    correctOption: '②',
    correctText: 'からです',
    meaning: 'Vì có ít chương trình mà tôi thích.',
    explanation:
      'Câu thể thông thường＋からです dùng để nêu nguyên nhân, giải thích: 好きな番組が少ないからです。',
    wrongOptions: [
      {
        option: '①',
        text: 'だからです: không thêm だ ngay sau tính từ い 少ない.',
      },
      { option: '③', text: 'のからです: không nối 少ないのからです.' },
      { option: '④', text: 'からのです: sai cách kết hợp.' },
    ],
    note: 'Ghi nhớ: 少ないからです ✓ · 少ないだからです ✗',
  },
];

// Hàm format tin nhắn đáp án text cho Zalo Bot
function formatZaloSessionText(
  examNumber: number,
  sectionNum: number,
  sectionTitle: string,
  questions: QuestionDef[],
): string {
  const lines: string[] = [];
  lines.push(
    `📚 N5 - ĐỀ ${examNumber} - BÀI ${sectionNum}: ${sectionTitle.toUpperCase()}`,
  );
  lines.push(
    `📌 Phạm vi: ${questions.length} câu (Câu ${questions[0].questionNumber} đến câu ${questions[questions.length - 1].questionNumber})`,
  );
  lines.push('───────────────────────────────');

  for (let i = 0; i < questions.length; i += 5) {
    const group = questions.slice(i, i + 5);
    const row = group
      .map(
        q =>
          `${String(q.questionNumber).padStart(2, ' ')}: ${q.correctOption.padEnd(2, ' ')}`,
      )
      .join('  ');
    lines.push(row);
  }

  lines.push('───────────────────────────────');
  lines.push('👉 Xem đáp án & giải thích chi tiết tại:');
  lines.push(
    `https://www.pthamnihongo.site/vi/solutions?level=n5&exam=${examNumber}`,
  );

  return lines.join('\n');
}

async function run() {
  console.log('Seeding N5 Đề 2 questions and sessions...');

  // 1. Tổ chức sections
  const sectionsMap = new Map<number, QuestionDef[]>();
  for (const q of N5_DE2_QUESTIONS) {
    if (!sectionsMap.has(q.sectionNumber)) {
      sectionsMap.set(q.sectionNumber, []);
    }
    sectionsMap.get(q.sectionNumber)!.push(q);
  }

  const sectionsList = Array.from(sectionsMap.entries()).map(
    ([secNum, qList]) => ({
      sectionNumber: secNum,
      sectionTitle: qList[0].sectionTitle,
      questionRange: `${qList[0].questionNumber}-${qList[qList.length - 1].questionNumber}`,
      questions: qList.map(q => ({
        questionNumber: q.questionNumber,
        globalNumber: q.globalNumber,
        correctOption: q.correctOption,
        note: q.note || null,
      })),
    }),
  );

  const fullData = {
    id: 'n5-de2',
    level: 'n5',
    examNumber: 2,
    title: 'ĐÁP ÁN CHI TIẾT ĐỀ 2',
    subtitle: 'TỪ VỰNG, NGỮ PHÁP DỄ NHẦM',
    author: 'Phan Thắm SS - Minato',
    watermarkImage: '/images/exercise-watermark.png',
    totalPages: 25,
    sections: sectionsList,
    quickAnswerSummary: {
      vocab: N5_DE2_QUESTIONS.filter(q => q.sectionNumber <= 2).map(q => ({
        qNum: q.questionNumber,
        answer: q.correctOption,
      })),
      grammar: N5_DE2_QUESTIONS.filter(q => q.sectionNumber >= 3).map(q => ({
        qNum: q.questionNumber,
        answer: q.correctOption,
      })),
    },
    passageSection: {
      fullText:
        '日本にはいろいろな新聞がありますが、わたしは一つしか読みません。それは「読売新聞」というものだけです。テレビもあまりみません。すきな番組が少ないからです。',
      translation:
        'Ở Nhật có nhiều loại báo khác nhau, nhưng tôi chỉ đọc một loại. Đó là tờ “Yomiuri Shimbun”. Tôi cũng không xem tivi nhiều, vì có ít chương trình mà tôi thích.',
    },
    questions: N5_DE2_QUESTIONS.map(q => ({
      id: `n5-de2-q${q.globalNumber}`,
      globalNumber: q.globalNumber,
      questionNumber: q.questionNumber,
      sectionNumber: q.sectionNumber,
      sectionTitle: q.sectionTitle,
      partId: q.partId,
      partTitle: `${q.sectionTitle.toUpperCase()} (Câu ${q.questionNumber})`,
      questionText: q.questionText,
      correctOption: q.correctOption,
      correctText: q.correctText,
      hanviet: q.hanviet || null,
      meaning: q.meaning,
      explanation: q.explanation,
      conclusion: `→ Đáp án đúng: ${q.correctOption} (${q.correctText})`,
      wrongOptions: q.wrongOptions,
      note: q.note || null,
      starOrder: q.starOrder || null,
      fullSentence: q.fullSentence || null,
    })),
  };

  // Tạo file SQL migration để lưu vào scripts/migrations/
  const sqlStatements: string[] = [];

  // Tạo bảng exam_questions nếu chưa có
  sqlStatements.push(
    `
CREATE TABLE IF NOT EXISTS \`exam_questions\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`exam_id\` VARCHAR(50) NOT NULL,
  \`section_number\` INT NOT NULL,
  \`section_title\` VARCHAR(255) NOT NULL,
  \`question_number\` INT NOT NULL,
  \`global_number\` INT NOT NULL,
  \`correct_option\` VARCHAR(50) NOT NULL,
  \`question_text\` TEXT NULL,
  \`explanation\` TEXT NULL,
  \`note\` VARCHAR(255) NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY \`uk_exam_section_question\` (\`exam_id\`, \`section_number\`, \`question_number\`),
  INDEX \`idx_exam_section\` (\`exam_id\`, \`section_number\`),
  INDEX \`idx_exam_global\` (\`exam_id\`, \`global_number\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`.trim(),
  );

  // Package n5_de02
  const fullDataEscaped = JSON.stringify(fullData).replace(/'/g, "''");
  sqlStatements.push(
    `
INSERT INTO \`exam_packages\` (\`id\`, \`level\`, \`exam_number\`, \`title\`, \`subtitle\`, \`author\`, \`total_questions\`, \`total_sessions\`, \`full_data\`)
VALUES ('n5_de02', 'n5', 2, 'ĐÁP ÁN CHI TIẾT ĐỀ 2', 'TỪ VỰNG, NGỮ PHÁP DỄ NHẦM', 'Phan Thắm SS - Minato', 50, 6, '${fullDataEscaped}')
ON DUPLICATE KEY UPDATE
  \`title\` = VALUES(\`title\`),
  \`subtitle\` = VALUES(\`subtitle\`),
  \`author\` = VALUES(\`author\`),
  \`total_questions\` = VALUES(\`total_questions\`),
  \`total_sessions\` = VALUES(\`total_sessions\`),
  \`full_data\` = VALUES(\`full_data\`);
`.trim(),
  );

  // Insert các sessions vào exam_sessions
  for (const [secNum, qList] of sectionsMap.entries()) {
    const range = `${qList[0].questionNumber}-${qList[qList.length - 1].questionNumber}`;
    const answersText = formatZaloSessionText(
      2,
      secNum,
      qList[0].sectionTitle,
      qList,
    ).replace(/'/g, "''");
    const answersJson = JSON.stringify(
      qList.map(q => ({
        qNum: q.questionNumber,
        answer: q.correctOption,
        note: q.note || null,
      })),
    ).replace(/'/g, "''");
    const titleEscaped = qList[0].sectionTitle.replace(/'/g, "''");

    sqlStatements.push(
      `
INSERT INTO \`exam_sessions\` (\`exam_id\`, \`session_num\`, \`session_title\`, \`question_range\`, \`is_unlocked\`, \`answers_text\`, \`answers_json\`, \`detail_url\`)
VALUES ('n5_de02', ${secNum}, '${titleEscaped}', '${range}', 1, '${answersText}', '${answersJson}', 'https://www.pthamnihongo.site/vi/solutions?level=n5&exam=2')
ON DUPLICATE KEY UPDATE
  \`session_title\` = VALUES(\`session_title\`),
  \`question_range\` = VALUES(\`question_range\`),
  \`is_unlocked\` = VALUES(\`is_unlocked\`),
  \`answers_text\` = VALUES(\`answers_text\`),
  \`answers_json\` = VALUES(\`answers_json\`),
  \`detail_url\` = VALUES(\`detail_url\`);
`.trim(),
    );
  }

  // Insert từng câu hỏi vào exam_questions
  for (const q of N5_DE2_QUESTIONS) {
    const qTextEscaped = (q.questionText || '').replace(/'/g, "''");
    const expEscaped = (q.explanation || '').replace(/'/g, "''");
    const noteEscaped = q.note ? `'${q.note.replace(/'/g, "''")}'` : 'NULL';
    const titleEscaped = q.sectionTitle.replace(/'/g, "''");

    sqlStatements.push(
      `
INSERT INTO \`exam_questions\` (\`exam_id\`, \`section_number\`, \`section_title\`, \`question_number\`, \`global_number\`, \`correct_option\`, \`question_text\`, \`explanation\`, \`note\`)
VALUES ('n5_de02', ${q.sectionNumber}, '${titleEscaped}', ${q.questionNumber}, ${q.globalNumber}, '${q.correctOption}', '${qTextEscaped}', '${expEscaped}', ${noteEscaped})
ON DUPLICATE KEY UPDATE
  \`section_title\` = VALUES(\`section_title\`),
  \`correct_option\` = VALUES(\`correct_option\`),
  \`question_text\` = VALUES(\`question_text\`),
  \`explanation\` = VALUES(\`explanation\`),
  \`note\` = VALUES(\`note\`);
`.trim(),
    );
  }

  // Ghi ra file migrations
  const migrationFile = path.resolve(
    process.cwd(),
    'scripts/migrations/12_seed_exam_solutions_n5_de2.sql',
  );
  fs.writeFileSync(migrationFile, sqlStatements.join(';\n\n') + ';\n');
  console.log(`Saved SQL migration to ${migrationFile}`);

  // Thực thi trên MySQL nếu kết nối được
  try {
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nihongo_db',
    };
    const conn = await mysql.createConnection(dbConfig);
    console.log(`Executing SQL statements on DB (${dbConfig.host})...`);
    for (const stmt of sqlStatements) {
      await conn.query(stmt);
    }
    await conn.end();
    console.log(
      'Successfully inserted all 50 questions & 6 sessions into MySQL database!',
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.warn(
      'Could not run query on local MySQL directly:',
      error?.message,
    );
    console.log(
      'Note: You can run the generated SQL file in SQL Developer or your database manager.',
    );
  }
}

run().catch(console.error);
