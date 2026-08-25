import { ShadowingVideo } from '../types';

export const SAMPLE_SHADOWING_VIDEOS: ShadowingVideo[] = [
  {
    id: 'sh-01',
    title: 'Giao tiếp gọi món tại quán ăn Nhật Bản',
    description:
      'Học cách vào quán, gọi món ramen, hỏi xin thêm nước và thanh toán tiền.',
    level: 'N5',
    category: 'Giao tiếp',
    youtubeId: 'kJQP7kiw5Fk', // Ví dụ video ID
    duration: '01:30',
    dialogues: [
      {
        id: 1,
        startTime: 0,
        endTime: 4.5,
        japanese: 'いらっしゃいませ！何名様ですか？',
        furigana: 'いらっしゃいませ！[何名様:なんめいさま]ですか？',
        romaji: 'Irasshaimase! Nan-mei sama desu ka?',
        vietnamese: 'Kính chào quý khách! Quý khách đi mấy người ạ?',
        keywords: [
          {
            word: '何名様',
            reading: 'なんめいさま',
            meaning: 'mấy vị / mấy người (kính ngữ)',
          },
          { word: 'いらっしゃいませ', meaning: 'kính chào quý khách' },
        ],
      },
      {
        id: 2,
        startTime: 5.0,
        endTime: 9.0,
        japanese: '二人です。奥の席は空いていますか？',
        furigana:
          '[二人:ふたり]です。[奥:おく]の[席:せき]は[空:あ]いていますか？',
        romaji: 'Futari desu. Oku no seki wa aite imasu ka?',
        vietnamese: 'Hai người ạ. Chỗ ngồi phía trong còn trống không?',
        keywords: [
          { word: '二人', reading: 'ふたり', meaning: '2 người' },
          { word: '奥', reading: 'おく', meaning: 'bên trong, phía trong' },
          {
            word: '空いている',
            reading: 'あいている',
            meaning: 'còn trống, chưa có người',
          },
        ],
      },
      {
        id: 3,
        startTime: 9.5,
        endTime: 14.2,
        japanese: 'はい、どうぞこちらへご案内いたします。',
        furigana: 'はい、どうぞこちらへご[案内:あんない]いたします。',
        romaji: 'Hai, douzo kochira e go-annai itashimasu.',
        vietnamese: 'Vâng, xin mời đi theo hướng này để tôi dẫn đường ạ.',
        keywords: [
          {
            word: 'ご案内',
            reading: 'ごあんない',
            meaning: 'hướng dẫn, dẫn đường (khiêm nhường ngữ)',
          },
        ],
      },
      {
        id: 4,
        startTime: 14.8,
        endTime: 19.5,
        japanese: 'すみません、おすすめのラーメンを教えてください。',
        furigana: 'すみません、おすすめのラーメンを[教:おし]えてください。',
        romaji: 'Sumimasen, osusume no raamen o oshiete kudasai.',
        vietnamese:
          'Xin lỗi, cho tôi hỏi quán có món ramen nào ngon đề xuất không ạ?',
        keywords: [
          { word: 'おすすめ', meaning: 'gợi ý, món được đề xuất' },
          {
            word: '教えてください',
            reading: 'おしえてください',
            meaning: 'xin hãy chỉ cho tôi',
          },
        ],
      },
      {
        id: 5,
        startTime: 20.0,
        endTime: 24.8,
        japanese: '当店一番人気は特製醤油ラーメンです！',
        furigana:
          '[当店:とうてん][一番:いちばん][人気:にんき]は[特製:とくせい][醤油:しょうゆ]ラーメンです！',
        romaji: 'Touten ichiban ninki wa tokusei shouyu raamen desu!',
        vietnamese:
          'Món được yêu thích số 1 của quán chúng tôi là Ramen nước tương đặc biệt ạ!',
        keywords: [
          { word: '当店', reading: 'とうてん', meaning: 'quán của chúng tôi' },
          {
            word: '特製',
            reading: 'とくせい',
            meaning: 'đặc chế, món đặc biệt',
          },
          { word: '醤油', reading: 'しょうゆ', meaning: 'nước tương Nhật' },
        ],
      },
      {
        id: 6,
        startTime: 25.2,
        endTime: 29.5,
        japanese: 'じゃあ、それを一つお願いします。',
        furigana: 'じゃあ、それを[一:ひと]つお[願:ねが]いします。',
        romaji: 'Jaa, sore o hitotsu onegaishimasu.',
        vietnamese: 'Vậy thì, làm ơn cho tôi một bát đó nhé.',
        keywords: [
          { word: '一つ', reading: 'ひとつ', meaning: '1 cái / 1 phần' },
          {
            word: 'お願いします',
            reading: 'おねがいします',
            meaning: 'làm ơn, xin vui lòng',
          },
        ],
      },
    ],
  },
  {
    id: 'sh-02',
    title: 'Hỏi đường tại ga tàu điện Shinjuku Tokyo',
    description:
      'Tình huống hỏi lối ra và đường đi đến toà nhà Tokyo Metropolitan.',
    level: 'N4',
    category: 'Đời sống',
    youtubeId: '9bZkp7q19f0',
    duration: '01:15',
    dialogues: [
      {
        id: 1,
        startTime: 0,
        endTime: 5.2,
        japanese:
          'あのう、すみません。都庁に行きたいんですが、どの出口ですか？',
        furigana:
          'あのう、すみません。[都庁:とちょう]に[行:い]きたいんですが、どの[出口:でぐち]ですか？',
        romaji:
          'Anou, sumimasen. Tochou ni ikitai n desu ga, dono deguchi desu ka?',
        vietnamese:
          'Xin lỗi cho tôi hỏi. Tôi muốn đến Toà nhà Toà thị chính (Tochou), phải đi lối ra nào ạ?',
        keywords: [
          { word: '都庁', reading: 'とちょう', meaning: 'Toà thị chính Tokyo' },
          { word: '出口', reading: 'でぐち', meaning: 'lối ra' },
        ],
      },
      {
        id: 2,
        startTime: 5.8,
        endTime: 10.5,
        japanese: '西口を出て、まっすぐ歩いて５分くらいですよ。',
        furigana:
          '[西口:にしぐち]を[出:で]て、まっすぐ[歩:ある]いて５[分:ふん]くらいですよ。',
        romaji: 'Nishiguchi o dete, massugu aruite gofun kurai desu yo.',
        vietnamese:
          'Bạn ra Cửa Tây (Nishiguchi), đi bộ thẳng khoảng 5 phút là tới nha.',
        keywords: [
          { word: '西口', reading: 'にしぐち', meaning: 'Cửa Tây' },
          { word: 'まっすぐ', meaning: 'thẳng một mạch' },
          { word: '歩く', reading: 'あるく', meaning: 'đi bộ' },
        ],
      },
      {
        id: 3,
        startTime: 11.0,
        endTime: 14.5,
        japanese: '地下通路を通って行くこともできますか？',
        furigana:
          '[地下通路:ちかつうろ]を[通:とお]って[行:い]くこともできますか？',
        romaji: 'Chika tsuuro o tootte iku koto mo dekimasu ka?',
        vietnamese: 'Tôi có thể đi qua đường hầm dưới lòng đất được không ạ?',
        keywords: [
          {
            word: '地下通路',
            reading: 'ちかつうろ',
            meaning: 'đường hầm ngầm',
          },
          {
            word: '通る',
            reading: 'とおる',
            meaning: 'đi ngang qua, băng qua',
          },
        ],
      },
      {
        id: 4,
        startTime: 15.0,
        endTime: 19.8,
        japanese: 'はい、雨の日は地下通路のほうが便利ですよ。',
        furigana:
          'はい、[雨:あめ]の[日:ひ]は[地下通路:ちかつうろ]のほうが[便利:べんり]ですよ。',
        romaji: 'Hai, ame no hi wa chika tsuuro no hou ga benri desu yo.',
        vietnamese:
          'Vâng, vào những ngày mưa thì đi đường hầm ngầm sẽ tiện hơn đó.',
        keywords: [
          { word: '雨の日', reading: 'あめのひ', meaning: 'ngày mưa' },
          { word: '便利', reading: 'べんり', meaning: 'tiện lợi' },
        ],
      },
    ],
  },
  {
    id: 'sh-03',
    title: 'Hội thoại rủ bạn bè đi xem phim cuối tuần',
    description:
      'Luyện ngữ điệu tự nhiên, từ ngữ thân mật giữa bạn bè thân thiết.',
    level: 'N3',
    category: 'Anime & Phim',
    youtubeId: '3JZ_D3ELwOQ',
    duration: '01:05',
    dialogues: [
      {
        id: 1,
        startTime: 0,
        endTime: 4.8,
        japanese: 'ねえ、今週末何か予定ある？一緒に映画見に行かない？',
        furigana:
          'ねえ、[今週末:こんしゅうまつ][何:なに]か[予定:よてい]ある？[一緒:いっしょ]に[映画:えいが][見:み]に[行:い]かない？',
        romaji:
          'Nee, konshuumatsu nanika yotei aru? Issho ni eiga mi ni ikanai?',
        vietnamese:
          'Nè, cuối tuần này cậu có kế hoạch gì chưa? Đi xem phim cùng tớ không?',
        keywords: [
          {
            word: '今週末',
            reading: 'こんしゅうまつ',
            meaning: 'cuối tuần này',
          },
          { word: '予定', reading: 'よてい', meaning: 'dự định, kế hoạch' },
        ],
      },
      {
        id: 2,
        startTime: 5.2,
        endTime: 9.5,
        japanese: 'いいね！ちょうど気になってた新作があるんだよね。',
        furigana:
          'いいね！ちょうど[気:き]になってた[新作:しんさく]があるんだよね。',
        romaji: 'Ii ne! Choudo ki ni natteta shinsaku ga aru n da yo ne.',
        vietnamese: 'Được đó! Tớ cũng vừa khéo đang tò mò bộ phim mới ra này.',
        keywords: [
          {
            word: '気になる',
            reading: 'きになる',
            meaning: 'để ý, tò mò, quan tâm',
          },
          {
            word: '新作',
            reading: 'しんさく',
            meaning: 'tác phẩm mới, phim mới',
          },
        ],
      },
      {
        id: 3,
        startTime: 10.0,
        endTime: 14.8,
        japanese:
          'じゃあ土曜日の午後２時、映画館のチケット売り場で待ち合わせしよう！',
        furigana:
          'じゃあ[土曜日:どようび]の[午後:ごご]２[時:じ]、[映画館:えいがかん]のチケット[売:う]り[場:ば]で[待:ま]ち[合:あ]わせしよう！',
        romaji:
          'Jaa doyoubi no gogo niji, eigakan no chiketto uriba de machiawase shiyou!',
        vietnamese:
          'Thế thì 2 giờ chiều thứ Bảy, hẹn gặp nhau ở quầy bán vé rạp chiếu phim nha!',
        keywords: [
          { word: '売り場', reading: 'うりば', meaning: 'quầy bán, nơi bán' },
          { word: '待ち合わせ', reading: 'まちあわせ', meaning: 'hẹn gặp' },
        ],
      },
    ],
  },
];
