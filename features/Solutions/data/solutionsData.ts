export interface SolutionWrongOption {
  option: string;
  text: string;
}

export interface SolutionQuestion {
  id: string;
  globalNumber: number;
  questionNumber: number;
  partId: 'vocab' | 'grammar' | 'star' | 'passage';
  partTitle: string;
  questionText: string;
  correctOption: string;
  correctText: string;
  hanviet: string | null;
  meaning: string;
  explanation: string;
  conclusion: string | null;
  wrongOptions: SolutionWrongOption[];
  starPositions?: string[];
  note: string | null;
  starOrder: string | null;
  fullSentence: string | null;
}

export interface SolutionExam {
  id: string;
  level: 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
  examNumber: number;
  title: string;
  subtitle: string;
  author: string;
  watermarkImage: string;
  totalPages: number;
  quickAnswerSummary: {
    vocab: { qNum: number; answer: string }[];
    grammar: { qNum: number; answer: string }[];
  };
  passageSection?: {
    fullText: string;
    translation: string;
  };
  questions: SolutionQuestion[];
}

export const EXAM_1_N5_SOLUTION: SolutionExam = {
  id: 'n5-de1',
  level: 'n5',
  examNumber: 1,
  title: 'ĐÁP ÁN CHI TIẾT ĐỀ 1',
  subtitle: 'TỪ VỰNG, NGỮ PHÁP DỄ NHẦM',
  author: 'Phan Thắm SS - Minato',
  watermarkImage: '/images/exercise-watermark.png',
  totalPages: 20,
  quickAnswerSummary: {
    vocab: [
      { qNum: 1, answer: '③' },
      { qNum: 2, answer: '②' },
      { qNum: 3, answer: '②' },
      { qNum: 4, answer: '①' },
      { qNum: 5, answer: '②' },
      { qNum: 6, answer: '④' },
      { qNum: 7, answer: '④' },
      { qNum: 8, answer: '③' },
      { qNum: 9, answer: '④' },
    ],
    grammar: [
      { qNum: 1, answer: '③' },
      { qNum: 2, answer: '①' },
      { qNum: 3, answer: '③' },
      { qNum: 4, answer: '④' },
      { qNum: 5, answer: '①' },
      { qNum: 6, answer: '③' },
      { qNum: 7, answer: '①' },
      { qNum: 8, answer: '④' },
      { qNum: 9, answer: '④' },
      { qNum: 10, answer: '①' },
      { qNum: 11, answer: '③' },
      { qNum: 12, answer: '②' },
      { qNum: 13, answer: '③' },
      { qNum: 14, answer: '④' },
      { qNum: 15, answer: '②' },
      { qNum: 16, answer: '①' },
      { qNum: 17, answer: '②' },
      { qNum: 18, answer: '①' },
      { qNum: 19, answer: '①' },
      { qNum: 20, answer: '②' },
      { qNum: 21, answer: '③' },
      { qNum: 22, answer: '③' },
      { qNum: 23, answer: '①' },
      { qNum: 24, answer: '③' },
      { qNum: 25, answer: '①' },
      { qNum: 26, answer: '③/④' },
    ],
  },
  passageSection: {
    fullText:
      '月ようびから 金ようびまで 【22：は】 しごとを します。【23：ほか】 の 日は 【24：はたらきません】。土ようびは ごぜん としょかんへ いって、そこ 【25：で】 ほんを よみます。ごご スポーツを します。日ようびは 【26：どこへも／どこも】 いきません。やすみます。',
    translation:
      'Từ thứ Hai đến thứ Sáu, tôi làm việc. Những ngày khác, tôi không làm việc. Sáng thứ Bảy, tôi đến thư viện và đọc sách ở đó. Buổi chiều, tôi chơi thể thao. Chủ nhật, tôi không đi đâu cả. Tôi nghỉ ngơi.',
  },
  questions: [
    {
      id: 'n5-de1-q1',
      globalNumber: 1,
      questionNumber: 1,
      partId: 'vocab',
      partTitle: 'PHẦN 1: TỪ VỰNG DỄ NHẦM (問題② - Cách đọc chữ Hán)',
      questionText: 'きょうは 水ようびです。',
      correctOption: '③',
      correctText: 'すいようび',
      hanviet: '水 – THỦY',
      meaning: 'Hôm nay là thứ Tư.',
      explanation: '',
      conclusion: '→ 水曜日 đọc là すいようび, nghĩa là thứ Tư.',
      wrongOptions: [
        {
          option: '①',
          text: 'げつようび → 月曜日: thứ Hai. 月 – NGUYỆT.',
        },
        {
          option: '②',
          text: 'かようび → 火曜日: thứ Ba. 火 – HỎA.',
        },
        {
          option: '④',
          text: 'もくようび → 木曜日: thứ Năm. 木 – MỘC.',
        },
      ],
      note: null,
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q2',
      globalNumber: 2,
      questionNumber: 2,
      partId: 'vocab',
      partTitle: 'PHẦN 1: TỪ VỰNG DỄ NHẦM (問題② - Cách đọc chữ Hán)',
      questionText: 'テーブルの 下に かばんが あります。',
      correctOption: '②',
      correctText: 'した',
      hanviet: '下 – HẠ',
      meaning: 'Có một chiếc cặp ở dưới bàn.',
      explanation: '',
      conclusion: '→ テーブルの下 nghĩa là “phía dưới bàn”.',
      wrongOptions: [
        {
          option: '①',
          text: 'うえ → 上: phía trên. 上 – THƯỢNG.',
        },
        {
          option: '③',
          text: 'みぎ → 右: bên phải. 右 – HỮU.',
        },
        {
          option: '④',
          text: 'なか → 中: bên trong. 中 – TRUNG.',
        },
      ],
      note: null,
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q3',
      globalNumber: 3,
      questionNumber: 3,
      partId: 'vocab',
      partTitle: 'PHẦN 1: TỪ VỰNG DỄ NHẦM (問題② - Cách đọc chữ Hán)',
      questionText: 'あの 女の ひとは だれですか。',
      correctOption: '②',
      correctText: 'おんな',
      hanviet: '女 – NỮ',
      meaning: 'Người phụ nữ kia là ai vậy?',
      explanation: '',
      conclusion:
        '→ 女の人（おんなのひと） nghĩa là “người phụ nữ”.\nLưu ý: 大人 đọc là おとな, cần nhớ cách đọc của cả từ.',
      wrongOptions: [
        {
          option: '①',
          text: 'おとこ → 男: nam, đàn ông. 男 – NAM.',
        },
        {
          option: '③',
          text: 'おとな → 大人: người lớn. 大 – ĐẠI; 人 – NHÂN.',
        },
        {
          option: '④',
          text: 'こども → 子供: trẻ em. 子 – TỬ; 供 – CUNG.',
        },
      ],
      note: '大人 đọc là おとな, cần nhớ cách đọc của cả từ.',
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q4',
      globalNumber: 4,
      questionNumber: 4,
      partId: 'vocab',
      partTitle: 'PHẦN 1: TỪ VỰNG DỄ NHẦM (問題② - Cách đọc chữ Hán)',
      questionText: 'わたしの まちに ゆうめいな 川が あります。',
      correctOption: '①',
      correctText: 'かわ',
      hanviet: '川 – XUYÊN',
      meaning: 'Ở thị trấn của tôi có một con sông nổi tiếng.',
      explanation: '',
      conclusion: '→ 川 đọc là かわ, nghĩa là “sông”.',
      wrongOptions: [
        {
          option: '②',
          text: 'うみ → 海: biển. 海 – HẢI.',
        },
        {
          option: '③',
          text: 'いけ → 池: ao. 池 – TRÌ.',
        },
        {
          option: '④',
          text: 'やま → 山: núi. 山 – SƠN.',
        },
      ],
      note: null,
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q5',
      globalNumber: 5,
      questionNumber: 5,
      partId: 'vocab',
      partTitle: 'PHẦN 1: TỪ VỰNG DỄ NHẦM (問題② - Cách đọc chữ Hán)',
      questionText: 'この くつは 高いです。',
      correctOption: '②',
      correctText: 'たかい',
      hanviet: '高 – CAO',
      meaning: 'Đôi giày này đắt.',
      explanation: '',
      conclusion:
        '→ 高い có nghĩa là cao hoặc đắt. Trong câu này, nói về giá của đôi giày nên hiểu là đắt.',
      wrongOptions: [
        {
          option: '①',
          text: 'やすい → 安い: rẻ. 安 – AN.',
        },
        {
          option: '③',
          text: 'ちいさい → 小さい: nhỏ. 小 – TIỂU.',
        },
        {
          option: '④',
          text: 'おおきい → 大きい: to, lớn. 大 – ĐẠI.',
        },
      ],
      note: null,
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q6',
      globalNumber: 6,
      questionNumber: 6,
      partId: 'vocab',
      partTitle: 'PHẦN 1: TỪ VỰNG DỄ NHẦM (問題② - Cách đọc chữ Hán)',
      questionText: '白い はなを かいました。',
      correctOption: '④',
      correctText: 'しろい',
      hanviet: '白 – BẠCH',
      meaning: 'Tôi đã mua hoa màu trắng.',
      explanation: '',
      conclusion: '→ 白い đọc là しろい, nghĩa là “trắng”.',
      wrongOptions: [
        {
          option: '①',
          text: 'あおい → 青い: xanh. 青 – THANH.',
        },
        {
          option: '②',
          text: 'あかい → 赤い: đỏ. 赤 – XÍCH.',
        },
        {
          option: '③',
          text: 'きいろい → 黄色い: vàng. 黄 – HOÀNG; 色 – SẮC.',
        },
      ],
      note: null,
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q7',
      globalNumber: 7,
      questionNumber: 7,
      partId: 'vocab',
      partTitle: 'PHẦN 1: TỪ VỰNG DỄ NHẦM (問題② - Cách đọc chữ Hán)',
      questionText: 'ちょっと こちらへ 来て ください。',
      correctOption: '④',
      correctText: 'きて',
      hanviet: '来 – LAI',
      meaning: 'Bạn đến đây một chút nhé.',
      explanation: '',
      conclusion:
        '→ 来る（くる） → 来ます（きます） → 来て（きて）.\nLưu ý: 来る là động từ bất quy tắc; 来て đọc là きて, không phải くて.',
      wrongOptions: [
        {
          option: '①',
          text: 'みて → 見て: nhìn, xem — thể て của 見る. 見 – KIẾN.',
        },
        {
          option: '②',
          text: 'でて → 出て: ra, đi ra — thể て của 出る. 出 – XUẤT.',
        },
        {
          option: '③',
          text: 'して: làm — thể て của する, không phải cách đọc của 来て.',
        },
      ],
      note: '来る là động từ bất quy tắc; 来て đọc là きて, không phải くて.',
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q8',
      globalNumber: 8,
      questionNumber: 8,
      partId: 'vocab',
      partTitle: 'PHẦN 1: TỪ VỰNG DỄ NHẦM (問題② - Cách đọc chữ Hán)',
      questionText: 'きのう かいしゃを 休みました。',
      correctOption: '③',
      correctText: 'やすみました',
      hanviet: '休 – HƯU',
      meaning: 'Hôm qua tôi nghỉ làm.',
      explanation: '',
      conclusion:
        '→ 休む（やすむ） → 休みます → 休みました.\n会社を休む nghĩa là “nghỉ làm”.',
      wrongOptions: [
        {
          option: '①',
          text: 'よみました → 読みました: đã đọc. 読 – ĐỘC.',
        },
        {
          option: '②',
          text: 'のみました → 飲みました: đã uống. 飲 – ẨM.',
        },
        {
          option: '④',
          text: 'すみました → có thể là 住みました: đã sống/cư trú, 住 – TRỤ; hoặc 済みまし た: đã xong, 済 – TẾ. Không phải cách đọc của 休みました.',
        },
      ],
      note: null,
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q9',
      globalNumber: 9,
      questionNumber: 9,
      partId: 'vocab',
      partTitle: 'PHẦN 1: TỪ VỰNG DỄ NHẦM (問題② - Cách đọc chữ Hán)',
      questionText: 'お父さんと いっしょに でかけます。',
      correctOption: '④',
      correctText: 'おとうさん',
      hanviet: '父 – PHỤ',
      meaning: 'Tôi đi ra ngoài cùng bố.',
      explanation: '',
      conclusion:
        '→ お父さん viết đúng là おとうさん.\nLưu ý: 父 đứng riêng khi nói về bố mình thường đọc là ちち; trong お父さん, đọc là おと\nうさん.\n\nBÀI 2 – NGỮ PHÁP',
      wrongOptions: [
        {
          option: '①',
          text: 'おとさん: thiếu う, không thể hiện đúng trường âm.',
        },
        {
          option: '②',
          text: 'おとおさん: viết sai trường âm; từ này phải viết とう, không phải とお.',
        },
        {
          option: '③',
          text: 'おっとさん: thêm âm ngắt っ không đúng, đồng thời thiếu う.',
        },
      ],
      note: '父 đứng riêng khi nói về bố mình thường đọc là ちち; trong お父さん, đọc là おと うさん. BÀI 2 – NGỮ PHÁP',
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q10',
      globalNumber: 10,
      questionNumber: 1,
      partId: 'grammar',
      partTitle: 'PHẦN 2: BÀI 2 – NGỮ PHÁP (Trợ từ & Cấu trúc ngữ pháp)',
      questionText: 'それでは、5 級の 文法（ ）練習を 始めましょう。',
      correctOption: '③',
      correctText: 'の',
      hanviet: null,
      meaning: 'Vậy thì chúng ta bắt đầu luyện ngữ pháp cấp 5 nhé.',
      explanation:
        'N₁の N₂ dùng để nối hai danh từ, trong đó N₁ bổ nghĩa cho N₂.\n→ 文法の練習: việc luyện ngữ pháp.\n→ 練習を始める: bắt đầu luyện tập.',
      conclusion:
        '→ 文法の練習: việc luyện ngữ pháp.\n→ 練習を始める: bắt đầu luyện tập.\nCác đáp án sai:',
      wrongOptions: [
        {
          option: '①',
          text: 'を: đánh dấu đối tượng của hành động, không nối 文法 với 練習 theo nghĩa cần dùng.',
        },
        {
          option: '②',
          text: 'が: đánh dấu chủ ngữ, không tạo cụm “luyện ngữ pháp”.',
        },
        {
          option: '④',
          text: 'は: đánh dấu chủ đề, không nối hai danh từ trong cụm này.',
        },
      ],
      note: null,
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q11',
      globalNumber: 11,
      questionNumber: 2,
      partId: 'grammar',
      partTitle: 'PHẦN 2: BÀI 2 – NGỮ PHÁP (Trợ từ & Cấu trúc ngữ pháp)',
      questionText: '鳥が 空（ ）とんで います。',
      correctOption: '①',
      correctText: 'を',
      hanviet: null,
      meaning: 'Chim đang bay trên bầu trời.',
      explanation:
        'Nơi chốn を + động từ di chuyển diễn tả không gian hoặc tuyến đường mà\nngười/vật di chuyển qua.\n→ 空を飛ぶ（そらをとぶ）: bay trên bầu trời.',
      conclusion:
        '→ 空を飛ぶ（そらをとぶ）: bay trên bầu trời.\nCác đáp án sai:',
      wrongOptions: [
        {
          option: '②',
          text: 'に: không đánh dấu không gian di chuyển qua trong câu này.',
        },
        {
          option: '③',
          text: 'も: mang nghĩa “cũng”, không phù hợp với câu miêu tả thông thường này.',
        },
        {
          option: '④',
          text: 'が: chủ thể bay đã là 鳥が; 空 không phải chủ thể thực hiện hành động.',
        },
      ],
      note: '道を歩く: đi bộ trên đường · 橋を渡る: đi qua cầu.',
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q12',
      globalNumber: 12,
      questionNumber: 3,
      partId: 'grammar',
      partTitle: 'PHẦN 2: BÀI 2 – NGỮ PHÁP (Trợ từ & Cấu trúc ngữ pháp)',
      questionText: 'だれと ここへ 来ました（ ）。',
      correctOption: '③',
      correctText: 'か',
      hanviet: null,
      meaning: 'Bạn đã đến đây cùng ai?',
      explanation:
        'か đặt cuối câu lịch sự để tạo câu hỏi.\n→ だれと: cùng ai.\n→ 来ましたか: đã đến…?',
      conclusion: '→ だれと: cùng ai.\n→ 来ましたか: đã đến…?\nCác đáp án sai:',
      wrongOptions: [
        {
          option: '①',
          text: 'よ: thông báo hoặc nhấn mạnh thông tin cho người nghe, không phù hợp câu hỏi tìm thông tin này.',
        },
        {
          option: '②',
          text: 'ね: thường dùng để tìm sự đồng tình hoặc xác nhận, không phù hợp câu trực tiếp hỏi “cùng ai” ở đây.',
        },
        {
          option: '④',
          text: 'わ: biểu thị cảm xúc hoặc sắc thái của người nói, không tạo câu hỏi như đề yêu cầu.',
        },
      ],
      note: null,
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q13',
      globalNumber: 13,
      questionNumber: 4,
      partId: 'grammar',
      partTitle: 'PHẦN 2: BÀI 2 – NGỮ PHÁP (Trợ từ & Cấu trúc ngữ pháp)',
      questionText: '帰り（ ）恋人に でんわを かけました。',
      correctOption: '④',
      correctText: 'に',
      hanviet: null,
      meaning: 'Trên đường về, tôi đã gọi điện cho người yêu.',
      explanation:
        '帰りに（かえりに）: trên đường về, lúc về.\n→ 帰りに電話をかける: gọi điện trên đường về.',
      conclusion:
        '→ 帰りに電話をかける: gọi điện trên đường về.\nCác đáp án sai:',
      wrongOptions: [
        {
          option: '①',
          text: 'では: không tạo cách diễn đạt “trên đường về” trong câu này.',
        },
        {
          option: '②',
          text: 'とか: dùng để liệt kê ví dụ, mang nghĩa “như là…, hoặc…”, không phù hợp.',
        },
        {
          option: '③',
          text: 'へ: chỉ hướng hoặc đích đến, không diễn tả thời điểm gọi điện ở đây.',
        },
      ],
      note: '帰りに chỉ thời điểm; 恋人に chỉ người nhận cuộc gọi.',
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q14',
      globalNumber: 14,
      questionNumber: 5,
      partId: 'grammar',
      partTitle: 'PHẦN 2: BÀI 2 – NGỮ PHÁP (Trợ từ & Cấu trúc ngữ pháp)',
      questionText: 'きのう、ともだちを 動物園（ ）案内しました。',
      correctOption: '①',
      correctText: 'へ',
      hanviet: null,
      meaning: 'Hôm qua tôi đã dẫn bạn đến sở thú.',
      explanation:
        '人を＋場所へ／に＋案内する: dẫn ai đến một nơi nào đó.\n→ ともだちを: người được dẫn.\n→ 動物園へ: nơi dẫn đến.',
      conclusion:
        '→ ともだちを: người được dẫn.\n→ 動物園へ: nơi dẫn đến.\nCác đáp án sai:',
      wrongOptions: [
        {
          option: '②',
          text: 'も: nghĩa là “cũng”, không thể hiện đích đến trong cấu trúc đang dùng.',
        },
        {
          option: '③',
          text: 'は: không phù hợp để đánh dấu nơi dẫn đến trong câu này.',
        },
        {
          option: '④',
          text: 'を: điền vào sẽ thành ともだちを動物園を案内する, không phù hợp vì cả người được dẫn và địa điểm đều bị đánh dấu bằng を trong cùng cấu trúc này.',
        },
      ],
      note: 'Hướng dẫn ai: を người đó Hướng dẫn đi đâu に・へ chỗ đó',
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q15',
      globalNumber: 15,
      questionNumber: 6,
      partId: 'grammar',
      partTitle: 'PHẦN 2: BÀI 2 – NGỮ PHÁP (Trợ từ & Cấu trúc ngữ pháp)',
      questionText: 'おばあさん（ ）「いってらっしゃい」と いいました。',
      correctOption: '③',
      correctText: 'が',
      hanviet: null,
      meaning: 'Bà nói: “Đi nhé!”',
      explanation:
        'が đánh dấu chủ thể thực hiện hành động.\n→ おばあさんが言いました: bà đã nói.\n「Nội dung」＋と言います: nói rằng…',
      conclusion:
        '→ おばあさんが言いました: bà đã nói.\n「Nội dung」＋と言います: nói rằng…\nCác đáp án sai:',
      wrongOptions: [
        {
          option: '①',
          text: 'で: không dùng để đánh dấu người thực hiện hành động nói.',
        },
        {
          option: '②',
          text: 'を: không đánh dấu chủ thể của 言います.',
        },
        {
          option: '④',
          text: 'しか: phải đi với cách diễn đạt phủ định, nhưng câu này dùng いいました, là khẳng định.',
        },
      ],
      note: 'いってらっしゃい là lời người ở lại nói với người đi ra ngoài, với ý “Đi nhé, rồi về nhé”.',
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q16',
      globalNumber: 16,
      questionNumber: 7,
      partId: 'grammar',
      partTitle: 'PHẦN 2: BÀI 2 – NGỮ PHÁP (Trợ từ & Cấu trúc ngữ pháp)',
      questionText: 'おさらは 10 枚（ ）買って 来て ください。',
      correctOption: '①',
      correctText: 'ぐらい',
      hanviet: null,
      meaning: 'Bạn mua khoảng 10 cái đĩa rồi mang về nhé.',
      explanation:
        'Số lượng + ぐらい: khoảng, chừng bao nhiêu.\n→ 10 枚ぐらい: khoảng 10 cái.\n枚（まい） là đơn vị đếm vật mỏng, phẳng như giấy, đĩa…',
      conclusion:
        '→ 10 枚ぐらい: khoảng 10 cái.\n枚（まい） là đơn vị đếm vật mỏng, phẳng như giấy, đĩa…\nCác đáp án sai:',
      wrongOptions: [
        {
          option: '②',
          text: 'ごろ: dùng với mốc thời gian, chẳng hạn 10 時ごろ: khoảng 10 giờ; không dùng với số lượng đĩa.',
        },
        {
          option: '③',
          text: 'が: không dùng sau 10 枚 để diễn tả số lượng đĩa cần mua trong câu này.',
        },
        {
          option: '④',
          text: 'で: không mang nghĩa ước chừng số lượng.',
        },
      ],
      note: '3 時間ぐらい = khoảng 3 tiếng; 3 時ごろ = khoảng 3 giờ.',
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q17',
      globalNumber: 17,
      questionNumber: 8,
      partId: 'grammar',
      partTitle: 'PHẦN 2: BÀI 2 – NGỮ PHÁP (Trợ từ & Cấu trúc ngữ pháp)',
      questionText: 'あした（ ）あさっては 荷物を 送ります。',
      correctOption: '④',
      correctText: 'か',
      hanviet: null,
      meaning: 'Ngày mai hoặc ngày kia tôi sẽ gửi đồ.',
      explanation:
        'N₁か N₂: N₁ hoặc N₂.\n→ あしたかあさって: ngày mai hoặc ngày kia.',
      conclusion:
        '→ あしたかあさって: ngày mai hoặc ngày kia.\nCác đáp án sai:',
      wrongOptions: [
        {
          option: '①',
          text: 'で: không nối hai thời điểm với nghĩa “hoặc”.',
        },
        {
          option: '②',
          text: 'を: đánh dấu đối tượng của hành động; đối tượng được gửi ở đây là 荷物.',
        },
        {
          option: '③',
          text: 'に: có thể đánh dấu thời điểm trong các cấu trúc phù hợp, nhưng không nối あし た và あさって với nghĩa lựa chọn.',
        },
      ],
      note: 'か ở giữa hai danh từ có thể mang nghĩa “hoặc”, không chỉ dùng để hỏi cuối câu.',
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q18',
      globalNumber: 18,
      questionNumber: 9,
      partId: 'grammar',
      partTitle: 'PHẦN 2: BÀI 2 – NGỮ PHÁP (Trợ từ & Cấu trúc ngữ pháp)',
      questionText: 'あの かいしゃは 何（ ）いう なまえですか。',
      correctOption: '④',
      correctText: 'と',
      hanviet: null,
      meaning: 'Công ty kia tên là gì?',
      explanation:
        '～という名前: tên là…\n→ 何という名前ですか: tên là gì?\nと đánh dấu nội dung được gọi hoặc nói ra.',
      conclusion:
        '→ 何という名前ですか: tên là gì?\nと đánh dấu nội dung được gọi hoặc nói ra.\nCác đáp án sai:',
      wrongOptions: [
        {
          option: '①',
          text: 'が: không dùng để đánh dấu tên gọi trước いう.',
        },
        {
          option: '②',
          text: 'に: không phù hợp cấu trúc ～という名前.',
        },
        {
          option: '③',
          text: 'を: tuy có mẫu ～を言う là “nói điều gì”, câu này cần cấu trúc giới thiệu hoặc hỏi tên ～という名前.',
        },
      ],
      note: '「さくら」という名前 = tên là “Sakura”.',
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q19',
      globalNumber: 19,
      questionNumber: 10,
      partId: 'grammar',
      partTitle: 'PHẦN 2: BÀI 2 – NGỮ PHÁP (Trợ từ & Cấu trúc ngữ pháp)',
      questionText: 'その さかなは 5 匹（ ）2,500 えんです。',
      correctOption: '①',
      correctText: 'で',
      hanviet: null,
      meaning: 'Loại cá đó, 5 con có giá tổng cộng 2.500 yên.',
      explanation:
        'Số lượng + で + giá tiền: giá tiền tính cho toàn bộ số lượng ấy.\n→ 5 匹で 2,500 円: 2.500 yên cho cả 5 con.',
      conclusion: '→ 5 匹で 2,500 円: 2.500 yên cho cả 5 con.\nCác đáp án sai:',
      wrongOptions: [
        {
          option: '②',
          text: 'の: không nối số lượng với giá tiền theo cách 5 匹の 2,500 円です.',
        },
        {
          option: '③',
          text: 'を: đánh dấu đối tượng của hành động, không phù hợp câu nói về giá với です.',
        },
        {
          option: '④',
          text: 'か: nghĩa là “hoặc”, không phù hợp.',
        },
      ],
      note: 'で ở đây biểu thị tổng số lượng làm đơn vị tính giá, không phải nơi diễn ra hành động.',
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q20',
      globalNumber: 20,
      questionNumber: 11,
      partId: 'grammar',
      partTitle: 'PHẦN 2: BÀI 2 – NGỮ PHÁP (Trợ từ & Cấu trúc ngữ pháp)',
      questionText: 'まいにち（ ）ぐらい ねますか。',
      correctOption: '③',
      correctText: 'どれ',
      hanviet: null,
      meaning: 'Mỗi ngày bạn ngủ khoảng bao lâu?',
      explanation:
        'どれぐらい dùng để hỏi số lượng, thời lượng hoặc mức độ.\nTrong câu này, 寝ます là “ngủ”, nên hỏi về thời lượng ngủ.\n→ Có thể trả lời: 7 時間ぐらい寝ます。 — Tôi ngủ khoảng 7 tiếng.',
      conclusion:
        '→ Có thể trả lời: 7 時間ぐらい寝ます。 — Tôi ngủ khoảng 7 tiếng.\nCác đáp án sai:',
      wrongOptions: [
        {
          option: '①',
          text: 'もう: đã, thêm nữa; もうぐらい không tạo câu hỏi thời lượng.',
        },
        {
          option: '②',
          text: 'まだ: vẫn, chưa; まだぐらい không phù hợp.',
        },
        {
          option: '④',
          text: 'どこ: ở đâu; どこぐらい không dùng để hỏi thời gian ngủ.',
        },
      ],
      note: null,
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q21',
      globalNumber: 21,
      questionNumber: 12,
      partId: 'grammar',
      partTitle: 'PHẦN 2: BÀI 2 – NGỮ PHÁP (Trợ từ & Cấu trúc ngữ pháp)',
      questionText: '（ ）が 田中さんの かばんですか。',
      correctOption: '②',
      correctText: 'どれ',
      hanviet: null,
      meaning: 'Cái nào là cặp của anh/chị Tanaka?',
      explanation:
        'どれ là đại từ, có thể đứng độc lập và kết hợp trực tiếp với が.\n→ どれが～ですか: cái nào là…?',
      conclusion: '→ どれが～ですか: cái nào là…?\nCác đáp án sai:',
      wrongOptions: [
        {
          option: '①',
          text: 'どの: phải có danh từ phía sau, chẳng hạn どのかばん: chiếc cặp nào.',
        },
        {
          option: '③',
          text: 'どんな: cần danh từ phía sau, chẳng hạn どんなかばん: chiếc cặp như thế nào.',
        },
        {
          option: '④',
          text: 'どう: như thế nào, không thay cho “cái nào” trong câu này.',
        },
      ],
      note: 'どれ đứng một mình; どの＋danh từ.',
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q22',
      globalNumber: 22,
      questionNumber: 13,
      partId: 'grammar',
      partTitle: 'PHẦN 2: BÀI 2 – NGỮ PHÁP (Trợ từ & Cấu trúc ngữ pháp)',
      questionText: 'DVD より CD の（ ）が やすいでしょう。',
      correctOption: '③',
      correctText: 'ほう',
      hanviet: null,
      meaning: 'CD có lẽ rẻ hơn DVD.',
      explanation:
        'A より B のほうが＋tính từ: B… hơn A.\n→ DVD より CD のほうが安い: CD rẻ hơn DVD.',
      conclusion: '→ DVD より CD のほうが安い: CD rẻ hơn DVD.\nCác đáp án sai:',
      wrongOptions: [
        {
          option: '①',
          text: 'ほか: khác, ngoài ra; không tạo mẫu so sánh hơn này.',
        },
        {
          option: '②',
          text: 'また: lại, nữa; không phù hợp sau CD の.',
        },
        {
          option: '④',
          text: 'かた: có thể mang nghĩa “người” hoặc “cách”, nhưng trong mẫu so sánh ～の方 が, 方 phải đọc là ほう.',
        },
      ],
      note: 'Danh từ đứng trước のほうが là đối tượng mang mức độ A hơn của tính chất đang so sánh.',
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q23',
      globalNumber: 23,
      questionNumber: 14,
      partId: 'grammar',
      partTitle: 'PHẦN 2: BÀI 2 – NGỮ PHÁP (Trợ từ & Cấu trúc ngữ pháp)',
      questionText: 'かいしゃから（ ）すぐ ねました。',
      correctOption: '④',
      correctText: 'かえって',
      hanviet: null,
      meaning: 'Tôi đi làm về rồi ngủ ngay.',
      explanation:
        'V て、V dùng để nối các hành động theo trình tự.\n→ 帰って、すぐ寝ました: về rồi ngủ ngay.\n帰る → 帰って.',
      conclusion:
        '→ 帰って、すぐ寝ました: về rồi ngủ ngay.\n帰る → 帰って.\nCác đáp án sai:',
      wrongOptions: [
        {
          option: '①',
          text: 'かえるから: “vì sẽ về/vì về”, diễn tả nguyên nhân, không phù hợp quan hệ trình tự và ngữ cảnh của câu.',
        },
        {
          option: '②',
          text: 'かえるので: cũng diễn tả nguyên nhân “vì về”, không phù hợp.',
        },
        {
          option: '③',
          text: 'かえったり: liệt kê hành động tiêu biểu, thường dùng trong mẫu ～たり～たり する; không nối trực tiếp như câu đề.',
        },
      ],
      note: null,
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q24',
      globalNumber: 24,
      questionNumber: 15,
      partId: 'grammar',
      partTitle: 'PHẦN 2: BÀI 2 – NGỮ PHÁP (Trợ từ & Cấu trúc ngữ pháp)',
      questionText: 'これは わたしの かさですよ。なまえが（ ）あります。',
      correctOption: '②',
      correctText: 'かいて',
      hanviet: null,
      meaning: 'Đây là ô của tôi đấy. Có ghi tên trên đó.',
      explanation:
        'N が＋V てあります diễn tả trạng thái còn lại do ai đó đã chủ ý thực hiện một\nhành động trước đó.\n→ 名前が書いてあります: tên đã được viết lên và hiện vẫn có trên đó.\n→ 書く → 書いて.',
      conclusion:
        '→ 名前が書いてあります: tên đã được viết lên và hiện vẫn có trên đó.\n→ 書く → 書いて.\nCác đáp án sai:',
      wrongOptions: [
        {
          option: '①',
          text: 'かき: là phần bỏ ます của 書きます, không nối trực tiếp với あります trong mẫu này.',
        },
        {
          option: '③',
          text: 'かく: thể từ điển; mẫu cần thể て.',
        },
        {
          option: '④',
          text: 'かいた: thể quá khứ ngắn; không kết hợp thành 書いたあります.',
        },
      ],
      note: '書いてあります nhấn mạnh trạng thái “có ghi sẵn”, không có nghĩa “đang viết”.',
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q25',
      globalNumber: 25,
      questionNumber: 16,
      partId: 'grammar',
      partTitle: 'PHẦN 2: BÀI 2 – NGỮ PHÁP (Trợ từ & Cấu trúc ngữ pháp)',
      questionText:
        'A：5 級の テストは どうでしたか。\nB：あまり（   ）ありませんでした。',
      correctOption: '①',
      correctText: '難しく（むずかしく）',
      hanviet: null,
      meaning: 'A: Bài kiểm tra cấp 5 thế nào? B: Không khó lắm.',
      explanation:
        'Tính từ đuôi い bỏ い, thêm くありませんでした để tạo dạng phủ định quá\nkhứ lịch sự.\n→ 難しい → 難しくありませんでした: đã không khó.\n→ あまり＋phủ định: không… lắm.',
      conclusion:
        '→ 難しい → 難しくありませんでした: đã không khó.\n→ あまり＋phủ định: không… lắm.\nCác đáp án sai:',
      wrongOptions: [
        {
          option: '②',
          text: '難しい: không nối trực tiếp với ありませんでした; phải đổi い → く.',
        },
        {
          option: '③',
          text: '難しくない: đã là dạng phủ định ngắn, không thêm ありませんでした phía sau. Nếu chia từ dạng này: 難しくなかったです.',
        },
        {
          option: '④',
          text: '難しくて: là dạng nối của tính từ, không dùng để tạo phủ định với ありませ んでした.',
        },
      ],
      note: 'Cả 難しくありませんでした và 難しくなかったです đều có thể diễn đạt “đã không khó”. BÀI 3 – SẮP XẾP CÂU Ở phần này, cả bốn lựa chọn đều được dùng. Đáp án là từ nằm đúng vị trí ★.',
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q26',
      globalNumber: 26,
      questionNumber: 17,
      partId: 'star',
      partTitle: 'PHẦN 3: BÀI 3 – SẮP XẾP CÂU (Tìm vị trí dấu sao ＿★＿)',
      questionText: '新試験は ＿＿＿ ＿＿＿ ＿＿＿ ＿★＿ はじまります。',
      correctOption: '②',
      correctText: 'から',
      hanviet: null,
      meaning: 'Kỳ thi mới bắt đầu từ tháng 7 năm 2009.',
      explanation:
        '• 2009 年の 7 月: tháng 7 năm 2009. の nối năm với tháng.\n• Thời điểm＋から: từ thời điểm…\n• ～から始まります: bắt đầu từ…',
      conclusion: null,
      wrongOptions: [
        {
          option: '①',
          text: '2009 ねん: ô thứ nhất.',
        },
        {
          option: '③',
          text: 'の: ô thứ hai, nối 2009 ねん với 7 がつ.',
        },
        {
          option: '④',
          text: '7 がつ: ô thứ ba.',
        },
        {
          option: '②',
          text: 'から: ô thứ tư, đúng vị trí ★.',
        },
      ],
      starPositions: [
        '① 2009 ねん: ô thứ nhất.',
        '③ の: ô thứ hai, nối 2009 ねん với 7 がつ.',
        '④ 7 がつ: ô thứ ba.',
        '② から: ô thứ tư, đúng vị trí ★.',
      ],
      note: null,
      starOrder: '① → ③ → ④ → ②',
      fullSentence: '新試験は 2009 ねん の 7 がつ ★から はじまります。',
    },
    {
      id: 'n5-de1-q27',
      globalNumber: 27,
      questionNumber: 18,
      partId: 'star',
      partTitle: 'PHẦN 3: BÀI 3 – SẮP XẾP CÂU (Tìm vị trí dấu sao ＿★＿)',
      questionText: 'あの 人は ＿＿＿ ＿＿＿ ＿★＿ ＿＿＿。',
      correctOption: '①',
      correctText: 'わかります',
      hanviet: null,
      meaning: 'Người kia có hiểu tiếng Anh không?',
      explanation:
        '人は＋言語が＋わかります: ai đó hiểu một ngôn ngữ.\n• 英語がわかります: hiểu tiếng Anh.\n• か đặt cuối câu để tạo câu hỏi.',
      conclusion: null,
      wrongOptions: [
        {
          option: '④',
          text: '英語: ô thứ nhất, là ngôn ngữ được hiểu.',
        },
        {
          option: '③',
          text: 'が: ô thứ hai, đi sau 英語.',
        },
        {
          option: '①',
          text: 'わかります: ô thứ ba, đúng vị trí ★.',
        },
        {
          option: '②',
          text: 'か: ô thứ tư, kết thúc câu hỏi.',
        },
      ],
      starPositions: [
        '④ 英語: ô thứ nhất, là ngôn ngữ được hiểu.',
        '③ が: ô thứ hai, đi sau 英語.',
        '① わかります: ô thứ ba, đúng vị trí ★.',
        '② か: ô thứ tư, kết thúc câu hỏi.',
      ],
      note: 'Ở mẫu cơ bản này, dùng 英語がわかります.',
      starOrder: '④ → ③ → ① → ②',
      fullSentence: 'あの人は 英語 が ★わかります か。',
    },
    {
      id: 'n5-de1-q28',
      globalNumber: 28,
      questionNumber: 19,
      partId: 'star',
      partTitle: 'PHẦN 3: BÀI 3 – SẮP XẾP CÂU (Tìm vị trí dấu sao ＿★＿)',
      questionText: 'この ＿＿＿ ＿＿＿ ＿＿＿ ＿★＿ しませんか。',
      correctOption: '①',
      correctText: 'いっしょに',
      hanviet: null,
      meaning: 'Bạn có muốn chơi trò chơi mới này cùng tôi không?',
      explanation:
        '• このあたらしいゲーム: trò chơi mới này.\n• ゲームをする: chơi trò chơi.\n• いっしょに: cùng nhau.\n• V ませんか: dùng để mời, rủ người khác cùng làm gì.',
      conclusion: null,
      wrongOptions: [
        {
          option: '④',
          text: 'あたらしい: ô thứ nhất, bổ nghĩa cho ゲーム.',
        },
        {
          option: '②',
          text: 'ゲーム: ô thứ hai.',
        },
        {
          option: '③',
          text: 'を: ô thứ ba, đánh dấu đối tượng của する.',
        },
        {
          option: '①',
          text: 'いっしょに: ô thứ tư, đúng vị trí ★.',
        },
      ],
      starPositions: [
        '④ あたらしい: ô thứ nhất, bổ nghĩa cho ゲーム.',
        '② ゲーム: ô thứ hai.',
        '③ を: ô thứ ba, đánh dấu đối tượng của する.',
        '① いっしょに: ô thứ tư, đúng vị trí ★.',
      ],
      note: 'しませんか trong câu này là lời mời “Cùng chơi nhé?”, không phải hỏi lý do “Tại sao không chơi?”.',
      starOrder: '④ → ② → ③ → ①',
      fullSentence: 'この あたらしい ゲーム を ★いっしょに しませんか。',
    },
    {
      id: 'n5-de1-q29',
      globalNumber: 29,
      questionNumber: 20,
      partId: 'star',
      partTitle: 'PHẦN 3: BÀI 3 – SẮP XẾP CÂU (Tìm vị trí dấu sao ＿★＿)',
      questionText: 'ああ、ここ ＿＿＿ ＿★＿ ＿＿＿ ＿＿＿ みな きれいですね。',
      correctOption: '②',
      correctText: 'ある',
      hanviet: null,
      meaning: 'À, những chiếc khăn tay ở đây đều đẹp nhỉ.',
      explanation:
        '• ここにある: có ở đây.\n• ここにあるハンカチ: những chiếc khăn tay có ở đây.\n• は: đánh dấu cả cụm trên làm chủ đề.\n• みな: tất cả, đều.\n• きれいですね: đẹp nhỉ.',
      conclusion: '→ ここにあるハンカチ ✓',
      wrongOptions: [
        {
          option: '①',
          text: 'に: ô thứ nhất, đánh dấu nơi tồn tại với ある.',
        },
        {
          option: '②',
          text: 'ある: ô thứ hai, đúng vị trí ★.',
        },
        {
          option: '④',
          text: 'ハンカチ: ô thứ ba, được cụm ここにある bổ nghĩa.',
        },
        {
          option: '③',
          text: 'は: ô thứ tư, đặt sau cả cụm danh từ.',
        },
      ],
      starPositions: [
        '① に: ô thứ nhất, đánh dấu nơi tồn tại với ある.',
        '② ある: ô thứ hai, đúng vị trí ★.',
        '④ ハンカチ: ô thứ ba, được cụm ここにある bổ nghĩa.',
        '③ は: ô thứ tư, đặt sau cả cụm danh từ.',
      ],
      note: 'Khi bổ nghĩa cho danh từ, dùng ある＋N, không dùng あります＋N. → ここにあるハンカチ ✓',
      starOrder: '① → ② → ④ → ③',
      fullSentence: 'ああ、ここ に ★ある ハンカチ は みな きれいですね。',
    },
    {
      id: 'n5-de1-q30',
      globalNumber: 30,
      questionNumber: 21,
      partId: 'star',
      partTitle: 'PHẦN 3: BÀI 3 – SẮP XẾP CÂU (Tìm vị trí dấu sao ＿★＿)',
      questionText: 'この 辺 ＿＿＿ ＿★＿ ＿＿＿ ＿＿＿ ところです。',
      correctOption: '③',
      correctText: 'しずかで',
      hanviet: null,
      meaning: 'Khu vực này là nơi yên tĩnh và tiện lợi.',
      explanation:
        '• この辺（このへん）: khu vực này, quanh đây.\n• 静かで: yên tĩnh và… Dùng で để nối tính từ な với tính chất tiếp theo.\n• 便利なところ: nơi tiện lợi. Tính từ な đứng trước danh từ cần な.\n→ 静かで便利なところ: nơi yên tĩnh và tiện lợi.',
      conclusion:
        '→ 静かで便利なところ: nơi yên tĩnh và tiện lợi.\nVị trí các lựa chọn:',
      wrongOptions: [
        {
          option: '②',
          text: 'は: ô thứ nhất, đánh dấu chủ đề この辺.',
        },
        {
          option: '③',
          text: 'しずかで: ô thứ hai, đúng vị trí ★.',
        },
        {
          option: '④',
          text: 'べんり: ô thứ ba.',
        },
        {
          option: '①',
          text: 'な: ô thứ tư, nối べんり với ところ.',
        },
      ],
      starPositions: [
        '② は: ô thứ nhất, đánh dấu chủ đề この辺.',
        '③ しずかで: ô thứ hai, đúng vị trí ★.',
        '④ べんり: ô thứ ba.',
        '① な: ô thứ tư, nối べんり với ところ.',
      ],
      note: '静かで便利 = yên tĩnh và tiện lợi; 便利なところ = nơi tiện lợi. BÀI 4 – ĐIỀN VÀO ĐOẠN VĂN',
      starOrder: '② → ③ → ④ → ①',
      fullSentence: 'この辺 は ★しずかで べんり な ところです。',
    },
    {
      id: 'n5-de1-q31',
      globalNumber: 31,
      questionNumber: 22,
      partId: 'passage',
      partTitle: 'PHẦN 4: BÀI 4 – ĐIỀN VÀO ĐOẠN VĂN',
      questionText: '月ようびから 金ようびまで（   ）しごとを します。',
      correctOption: '③',
      correctText: 'は',
      hanviet: null,
      meaning: 'Từ thứ Hai đến thứ Sáu thì tôi làm việc.',
      explanation:
        '• 月曜日から金曜日まで: từ thứ Hai đến thứ Sáu.\n• は đặt sau cả khoảng thời gian để nêu chủ đề.\n• Câu sau nói về những ngày khác, nên は còn giúp tạo sự đối chiếu giữa ngày làm việc\nvà ngày nghỉ.',
      conclusion: null,
      wrongOptions: [
        {
          option: '①',
          text: 'を: không dùng để đánh dấu khoảng thời gian này; đối tượng của します đã nằm trong cụm 仕事をします.',
        },
        {
          option: '②',
          text: 'と: không nối khoảng thời gian với hành động theo cách này.',
        },
        {
          option: '④',
          text: 'や: dùng để liệt kê danh từ, không phù hợp với vị trí cần điền.',
        },
      ],
      note: '～から～までは = trong khoảng từ… đến… thì…',
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q32',
      globalNumber: 32,
      questionNumber: 23,
      partId: 'passage',
      partTitle: 'PHẦN 4: BÀI 4 – ĐIỀN VÀO ĐOẠN VĂN',
      questionText: '（   ）の 日は【24】。',
      correctOption: '①',
      correctText: 'ほか',
      hanviet: null,
      meaning: 'Những ngày khác thì tôi không làm việc.',
      explanation:
        'ほかの＋N: N khác.\n→ ほかの日: những ngày khác.\nTrong đoạn này, đó là những ngày ngoài thứ Hai đến thứ Sáu, tức thứ Bảy và Chủ nhật.',
      conclusion:
        '→ ほかの日: những ngày khác.\nTrong đoạn này, đó là những ngày ngoài thứ Hai đến thứ Sáu, tức thứ Bảy và Chủ nhật.\nCác đáp án sai:',
      wrongOptions: [
        {
          option: '②',
          text: 'など: “vân vân, chẳng hạn…”, cần có nội dung được nêu trước đó; không tạo cụm などの日 ở đây.',
        },
        {
          option: '③',
          text: 'ほう: phía, bên; không mang nghĩa “những ngày khác”.',
        },
        {
          option: '④',
          text: 'それ: không dùng それの日 để nói “ngày đó”. Cách nói phù hợp là その日.',
        },
      ],
      note: 'ほかの日 = ngày khác; その日 = ngày đó.',
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q33',
      globalNumber: 33,
      questionNumber: 24,
      partId: 'passage',
      partTitle: 'PHẦN 4: BÀI 4 – ĐIỀN VÀO ĐOẠN VĂN',
      questionText: 'ほかの 日は（   ）。',
      correctOption: '③',
      correctText: 'はたらきません',
      hanviet: null,
      meaning: 'Những ngày khác thì tôi không làm việc.',
      explanation:
        'Đoạn văn phân chia lịch sinh hoạt:\n• Từ thứ Hai đến thứ Sáu: làm việc.\n• Thứ Bảy: đến thư viện, đọc sách và chơi thể thao.\n• Chủ nhật: không đi đâu, nghỉ ngơi.\nVì vậy, はたらきません phù hợp nhất với mạch kể về những ngày nghỉ.',
      conclusion: null,
      wrongOptions: [
        {
          option: '①',
          text: 'はたらきます: làm việc; không phù hợp với mạch đối chiếu giữa ngày làm việc và những ngày nghỉ trong đoạn.',
        },
        {
          option: '②',
          text: 'はたらきたいです: muốn làm việc; đưa thêm ý mong muốn, trong khi đoạn đang kể lịch sinh hoạt.',
        },
        {
          option: '④',
          text: 'はたらいています: đang làm việc/làm việc thường xuyên; không phù hợp với nội dung ngày nghỉ đang được triển khai.',
        },
      ],
      note: 'Đây là câu chọn theo ngữ cảnh, không phải vì ba lựa chọn còn lại sai cách chia.',
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q34',
      globalNumber: 34,
      questionNumber: 25,
      partId: 'passage',
      partTitle: 'PHẦN 4: BÀI 4 – ĐIỀN VÀO ĐOẠN VĂN',
      questionText:
        '土ようびは ごぜん としょかんへ いって、そこ（   ）ほんを よみます。',
      correctOption: '①',
      correctText: 'で',
      hanviet: null,
      meaning: 'Sáng thứ Bảy, tôi đến thư viện và đọc sách ở đó.',
      explanation:
        'Địa điểm＋で＋động từ hành động: làm gì ở đâu.\n→ そこで本を読みます: đọc sách ở đó.\nそこ chỉ thư viện đã được nhắc trước đó.',
      conclusion:
        '→ そこで本を読みます: đọc sách ở đó.\nそこ chỉ thư viện đã được nhắc trước đó.\nCác đáp án sai:',
      wrongOptions: [
        {
          option: '②',
          text: 'に: không dùng để đánh dấu nơi diễn ra hành động 読みます. Với nơi tồn tại, có thể nói そこに本があります: ở đó có sách.',
        },
        {
          option: '③',
          text: 'が: đánh dấu chủ thể; そこ không phải người thực hiện hành động đọc.',
        },
        {
          option: '④',
          text: 'は: có thể nêu địa điểm làm chủ đề trong ngữ cảnh khác, nhưng ở đây で phù hợp nhất để chỉ trực tiếp nơi đọc sách. Nếu muốn nhấn mạnh đối chiếu “ở đó thì…”, thường dùng そこでは.',
        },
      ],
      note: '図書館へ行く = đến thư viện; 図書館で読む = đọc ở thư viện.',
      starOrder: null,
      fullSentence: null,
    },
    {
      id: 'n5-de1-q35',
      globalNumber: 35,
      questionNumber: 26,
      partId: 'passage',
      partTitle: 'PHẦN 4: BÀI 4 – ĐIỀN VÀO ĐOẠN VĂN',
      questionText: '日ようびは（   ）いきません。やすみます。',
      correctOption: '③',
      correctText: 'どこも / ④ – どこへも',
      hanviet: null,
      meaning: 'Chủ nhật tôi không đi đâu cả. Tôi nghỉ ngơi.',
      explanation:
        'Cả hai cách nói sau đều chấp nhận được:\nどこへも行きません。\n→ Không đi đâu cả.\nどこも行きません。\n→ Không đi đâu cả; lược bỏ trợ từ へ.',
      conclusion:
        '→ Không đi đâu cả.\nどこも行きません。\n→ Không đi đâu cả; lược bỏ trợ từ へ.\nCác đáp án sai:',
      wrongOptions: [
        {
          option: '①',
          text: 'どれも: nói về “cái nào cũng…”, không dùng để chỉ nơi đến trong câu này.',
        },
        {
          option: '②',
          text: 'どれもへ: không phù hợp cả về từ chỉ nơi chốn lẫn cách kết hợp trợ từ',
        },
      ],
      note: 'どこ（へ）も＋行きません = không đi đâu cả.',
      starOrder: null,
      fullSentence: null,
    },
  ],
};

export const ALL_SOLUTIONS: SolutionExam[] = [EXAM_1_N5_SOLUTION];

export function getSolutionByLevelAndExam(
  level: string,
  examNum: number,
): SolutionExam | null {
  return (
    ALL_SOLUTIONS.find(e => e.level === level && e.examNumber === examNum) ||
    null
  );
}

export function getSolutionsByLevel(level: string): SolutionExam[] {
  return ALL_SOLUTIONS.filter(e => e.level === level);
}
