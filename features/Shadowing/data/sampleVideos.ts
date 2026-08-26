import { ShadowingVideo } from '../types';

export const SAMPLE_SHADOWING_VIDEOS: ShadowingVideo[] = [
  {
    id: 'sh-01',
    title: 'Hội thoại gọi món tại quán ăn Nhật Bản (Ramen & Gyoza)',
    description:
      'Luyện tập tình huống vào quán, gọi món chính, gọi đồ uống và thanh toán.',
    level: 'N5',
    category: 'Giao tiếp',
    youtubeId: 'k32Y9doZieY', // Video hội thoại gọi món tiếng Nhật
    duration: '01:25',
    dialogues: [
      {
        id: 1,
        startTime: 0.0,
        endTime: 3.8,
        japanese: 'いらっしゃいませ！何名様ですか？',
        furigana: 'いらっしゃいませ！[何名様:なんめいさま]ですか？',
        romaji: 'Irasshaimase! Nan-mei sama desu ka?',
        vietnamese: 'Xin kính chào quý khách! Quý khách đi mấy người ạ?',
        keywords: [
          {
            word: '何名様',
            reading: 'なんめいさま',
            meaning: 'mấy vị / mấy người',
          },
          { word: 'いらっしゃいませ', meaning: 'kính chào quý khách' },
        ],
      },
      {
        id: 2,
        startTime: 4.2,
        endTime: 8.5,
        japanese: '一人です。カウンター席でお願いします。',
        furigana:
          '[一人:ひとり]です。カウンター[席:せき]でお[願:ねが]いします。',
        romaji: 'Hitori desu. Kauntaa seki de onegaishimasu.',
        vietnamese: 'Tôi đi một mình. Cho tôi ngồi ở quầy bar nhé.',
        keywords: [
          { word: '一人', reading: 'ひとり', meaning: '1 người' },
          { word: '席', reading: 'せき', meaning: 'chỗ ngồi' },
          {
            word: 'お願いします',
            reading: 'おねがいします',
            meaning: 'xin vui lòng',
          },
        ],
      },
      {
        id: 3,
        startTime: 9.0,
        endTime: 14.0,
        japanese: 'ご注文が決まりましたらお呼びください。',
        furigana:
          'ご[注文:ちゅうもん]が[決:き]まりましたらお[呼:よ]びください。',
        romaji: 'Go-chuumon ga kimarimashitara oyobi kudasai.',
        vietnamese: 'Khi nào quý khách chọn xong món, xin hãy gọi tôi nhé.',
        keywords: [
          { word: '注文', reading: 'ちゅうもん', meaning: 'gọi món, đặt hàng' },
          { word: '決まる', reading: 'きまる', meaning: 'được quyết định' },
          { word: '呼ぶ', reading: 'よぶ', meaning: 'gọi' },
        ],
      },
      {
        id: 4,
        startTime: 14.5,
        endTime: 19.8,
        japanese: 'すみません！醤油ラーメンと餃子を一つずつください。',
        furigana:
          'すみません！[醤油:しょうゆ]ラーメンと[餃子:ぎょうざ]を[一:ひと]つずつください。',
        romaji: 'Sumimasen! Shouyu raamen to gyouza o hitotsu zutsu kudasai.',
        vietnamese:
          'Xin lỗi! Cho tôi một bát mì ramen nước tương và một đĩa há cảo gyoza.',
        keywords: [
          { word: '醤油', reading: 'しょうゆ', meaning: 'nước tương' },
          { word: '餃子', reading: 'ぎょうざ', meaning: 'há cảo chiên' },
          {
            word: '一つずつ',
            reading: 'ひとつずつ',
            meaning: 'mỗi thứ một cái',
          },
        ],
      },
      {
        id: 5,
        startTime: 20.2,
        endTime: 25.5,
        japanese: 'かしこまりました。少々お待ちくださいませ。',
        furigana:
          'かしこまりました。[少々:しょうしょう]お[待:ま]ちくださいませ。',
        romaji: 'Kashikomarimashita. Shoushou omachi kudasai mase.',
        vietnamese: 'Tôi đã hiểu rồi ạ. Xin quý khách vui lòng đợi một chút.',
        keywords: [
          {
            word: 'かしこまりました',
            meaning: 'tôi đã hiểu rõ (kính ngữ phục vụ)',
          },
          {
            word: '少々',
            reading: 'しょうしょう',
            meaning: 'một chút, một lát',
          },
        ],
      },
    ],
  },
  {
    id: 'sh-02',
    title: 'Mua sắm & Thanh toán tại cửa hàng tiện lợi Conbini',
    description:
      'Học cách trả lời nhân viên thu ngân về túi nilon, hâm nóng đồ ăn và thẻ tích điểm.',
    level: 'N4',
    category: 'Đời sống',
    youtubeId: 'qs8mDlRMeLo',
    duration: '01:10',
    dialogues: [
      {
        id: 1,
        startTime: 0.0,
        endTime: 4.5,
        japanese: 'お弁当温めますか？',
        furigana: 'お[弁当:べんとう][温:あたた]めますか？',
        romaji: 'Obentou atatamemasu ka?',
        vietnamese: 'Cơm hộp có cần hâm nóng lại không ạ?',
        keywords: [
          { word: '弁当', reading: 'べんとう', meaning: 'cơm hộp' },
          {
            word: '温める',
            reading: 'あたためる',
            meaning: 'làm nóng, hâm nóng',
          },
        ],
      },
      {
        id: 2,
        startTime: 5.0,
        endTime: 8.8,
        japanese: 'はい、お願いします。レジ袋も一枚ください。',
        furigana:
          'はい、お[願:ねが]いします。レジ[袋:ぶくろ]も[一枚:いちまい]ください。',
        romaji: 'Hai, onegaishimasu. Rejibukuro mo ichimai kudasai.',
        vietnamese:
          'Vâng, nhờ bạn nhé. Cho tôi xin thêm một chiếc túi nilon nữa.',
        keywords: [
          {
            word: 'レジ袋',
            reading: 'レジぶくろ',
            meaning: 'túi nilon tính tiền',
          },
          { word: '一枚', reading: 'いちまい', meaning: '1 tờ / 1 chiếc' },
        ],
      },
      {
        id: 3,
        startTime: 9.2,
        endTime: 13.5,
        japanese: 'ポイントカードはお持ちですか？',
        furigana: 'ポイントカードはお[持:も]ちですか？',
        romaji: 'Pointo kaado wa omochi desu ka?',
        vietnamese: 'Quý khách có mang theo thẻ tích điểm không ạ?',
        keywords: [
          { word: 'ポイントカード', meaning: 'thẻ tích điểm' },
          { word: 'お持ち', reading: 'おもち', meaning: 'mang theo' },
        ],
      },
      {
        id: 4,
        startTime: 14.0,
        endTime: 18.5,
        japanese: 'いいえ、持っていません。Suicaで支払います。',
        furigana: 'いいえ、[持:も]っていません。Suicaで[支払:しはら]います。',
        romaji: 'Iie, motte imasen. Suica de shiharaimasu.',
        vietnamese: 'Không, tôi không có. Tôi thanh toán bằng thẻ Suica nhé.',
        keywords: [
          {
            word: '支払う',
            reading: 'しはらう',
            meaning: 'chi trả, thanh toán',
          },
        ],
      },
    ],
  },
  {
    id: 'sh-03',
    title: 'Hỏi đường đến ga tàu điện ngầm Shinjuku',
    description:
      'Cách hỏi đường lịch sự và lắng nghe chỉ dẫn phương hướng của người dân địa phương.',
    level: 'N3',
    category: 'Giao tiếp',
    youtubeId: 'vBfipXaPRr4',
    duration: '01:05',
    dialogues: [
      {
        id: 1,
        startTime: 0.0,
        endTime: 5.0,
        japanese: 'あのう、すみません。地下鉄の駅はどちらですか？',
        furigana:
          'あのう、すみません。[地下鉄:ちかてつ]の[駅:えき]はどちらですか？',
        romaji: 'Anou, sumimasen. Chikatetsu no eki wa dochira desu ka?',
        vietnamese: 'Xin lỗi cho tôi hỏi. Ga tàu điện ngầm ở hướng nào vậy ạ?',
        keywords: [
          { word: '地下鉄', reading: 'ちかてつ', meaning: 'tàu điện ngầm' },
          { word: '駅', reading: 'えき', meaning: 'nhà ga' },
          { word: 'どちら', meaning: 'hướng nào / phía nào (lịch sự)' },
        ],
      },
      {
        id: 2,
        startTime: 5.5,
        endTime: 10.8,
        japanese:
          'この道をまっすぐ行って、二つ目の交差点を右に曲がってください。',
        furigana:
          'この[道:みち]をまっすぐ[行:い]って、[二:ふた]つ[目:め]の[交差点:こうさてん]を[右:みぎ]に[曲:ま]がってください。',
        romaji:
          'Kono michi o massugu itte, futatsume no kousaten o migi ni magatte kudasai.',
        vietnamese:
          'Bạn đi thẳng con đường này, đến ngã tư thứ hai thì rẽ sang bên phải nhé.',
        keywords: [
          { word: '道', reading: 'みち', meaning: 'con đường' },
          { word: '交差点', reading: 'こうさてん', meaning: 'ngã tư, giao lộ' },
          { word: '曲がる', reading: 'まがる', meaning: 'rẽ, quẹo' },
        ],
      },
      {
        id: 3,
        startTime: 11.2,
        endTime: 15.5,
        japanese: 'わかりました！ご丁寧にありがとうございます。',
        furigana: 'わかりました！ご[丁寧:ていねい]にありがとうございます。',
        romaji: 'Wakarimashita! Goteinei ni arigatou gozaimasu.',
        vietnamese:
          'Tôi hiểu rồi ạ! Cảm ơn bạn rất nhiều vì đã tận tình chỉ dẫn.',
        keywords: [
          {
            word: '丁寧',
            reading: 'ていねい',
            meaning: 'lịch sự, chu đáo, tận tình',
          },
        ],
      },
    ],
  },
];
