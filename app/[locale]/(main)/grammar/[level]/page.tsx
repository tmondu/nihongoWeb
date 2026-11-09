import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { routing } from '@/core/i18n/routing';
import { Breadcrumbs } from '@/shared/ui-composite/Breadcrumbs';
import { ModernGrammarStudy } from '@/features/Grammar';
import {
  BookOpen,
  MessageCircle,
  GraduationCap,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';

const VALID_LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1', 'kaiwa'] as const;
type LevelKey = (typeof VALID_LEVELS)[number];

export function generateStaticParams() {
  return routing.locales.flatMap(locale =>
    VALID_LEVELS.map(level => ({
      locale,
      level,
    })),
  );
}

export const revalidate = 3600;

interface LevelDetail {
  titleVi: string;
  titleEn: string;
  badge: string;
  summaryVi: string;
  summaryEn: string;
  patterns: Array<{
    title: string;
    meaningVi: string;
    meaningEn: string;
    formula: string;
    exampleJp: string;
    exampleVi: string;
    exampleEn: string;
  }>;
}

const LEVEL_DATA: Record<LevelKey, LevelDetail> = {
  n5: {
    titleVi: 'Ngữ Pháp JLPT N5 (Sơ cấp 1)',
    titleEn: 'JLPT N5 Grammar (Beginner 1)',
    badge: 'N5',
    summaryVi:
      'Các cấu trúc nền tảng cơ bản nhất của tiếng Nhật, bao gồm các thể khẳng định/phủ định, trợ từ cơ bản và thể Te.',
    summaryEn:
      'Foundational Japanese patterns including standard polite forms, essential particles, and the versatile Te-form.',
    patterns: [
      {
        title: '～は～です',
        meaningVi: 'A là B (khẳng định cơ bản)',
        meaningEn: 'A is B (basic statement)',
        formula: 'Danh từ 1 + は + Danh từ 2 + です',
        exampleJp: 'わたしはベトナム人です。',
        exampleVi: 'Tôi là người Việt Nam.',
        exampleEn: 'I am Vietnamese.',
      },
      {
        title: '～てください',
        meaningVi: 'Hãy làm gì (yêu cầu, chỉ dẫn lịch sự)',
        meaningEn: 'Please do (polite instruction/request)',
        formula: 'Động từ thể て + ください',
        exampleJp: 'ここに名前を書いてください。',
        exampleVi: 'Xin hãy viết tên của bạn vào đây.',
        exampleEn: 'Please write your name here.',
      },
      {
        title: '～てもいいです',
        meaningVi: 'Được phép làm gì (xin phép / cho phép)',
        meaningEn: 'May do / You are allowed to do',
        formula: 'Động từ thể て + もいいです',
        exampleJp: '写真を撮ってもいいですか。',
        exampleVi: 'Tôi có thể chụp ảnh ở đây được không?',
        exampleEn: 'May I take a photo here?',
      },
      {
        title: '～てはいけません',
        meaningVi: 'Không được phép làm gì (cấm chỉ lịch sự)',
        meaningEn: 'You must not do (prohibition)',
        formula: 'Động từ thể て + はいけません',
        exampleJp: 'ここでタバコを吸ってはいけません。',
        exampleVi: 'Không được hút thuốc ở đây.',
        exampleEn: 'You must not smoke here.',
      },
      {
        title: '～たいです',
        meaningVi: 'Muốn làm gì (mong muốn của bản thân)',
        meaningEn: 'Want to do (speaker desire)',
        formula: 'Động từ thể ます (bỏ ます) + たいです',
        exampleJp: '日本へ旅行に行きたいです。',
        exampleVi: 'Tôi muốn đi du lịch Nhật Bản.',
        exampleEn: 'I want to travel to Japan.',
      },
      {
        title: '～たことがあります',
        meaningVi: 'Đã từng làm gì (nói về trải nghiệm trong quá khứ)',
        meaningEn: 'Have ever done (past experience)',
        formula: 'Động từ thể た + ことがあります',
        exampleJp: '富士山に登ったことがあります。',
        exampleVi: 'Tôi đã từng leo núi Phú Sĩ.',
        exampleEn: 'I have climbed Mount Fuji before.',
      },
    ],
  },
  n4: {
    titleVi: 'Ngữ Pháp JLPT N4 (Sơ cấp 2)',
    titleEn: 'JLPT N4 Grammar (Beginner 2)',
    badge: 'N4',
    summaryVi:
      'Các cấu trúc câu điều kiện, thể bị động, thể sai khiến, cho nhận hành động và kính ngữ sơ cấp.',
    summaryEn:
      'Conditionals, passive/causative conjugations, giving and receiving favors, and beginner honorifics.',
    patterns: [
      {
        title: '～たら / ～ば',
        meaningVi: 'Nếu... thì... (câu điều kiện)',
        meaningEn: 'If... then... (conditionals)',
        formula: 'Thể thường / quá khứ + ら | Thể điều kiện + ば',
        exampleJp: '雨が降ったら、出かけません。',
        exampleVi: 'Nếu trời mưa thì tôi sẽ không ra ngoài.',
        exampleEn: 'If it rains, I will not go out.',
      },
      {
        title: '～られる (Bị động)',
        meaningVi: 'Bị / Được làm gì (thể bị động)',
        meaningEn: 'Passive voice (acted upon)',
        formula: 'Động từ chia thể bị động (Group 1: a+れる, Group 2: られる)',
        exampleJp: '先生に褒められました。',
        exampleVi: 'Tôi đã được giáo viên khen ngợi.',
        exampleEn: 'I was praised by the teacher.',
      },
      {
        title: '～させる (Sai khiến)',
        meaningVi: 'Cho phép / Bắt ai đó làm gì',
        meaningEn: 'Causative voice (make/let someone do)',
        formula:
          'Động từ chia thể sai khiến (Group 1: a+せる, Group 2: させる)',
        exampleJp: '母は妹に部屋を掃除させました。',
        exampleVi: 'Mẹ đã bắt em gái dọn phòng.',
        exampleEn: 'Mother made younger sister clean the room.',
      },
      {
        title: '～てあげる / もらう / くれる',
        meaningVi: 'Làm gì cho ai / Nhận hành động từ ai',
        meaningEn: 'Giving / receiving acts of kindness',
        formula: 'Động từ thể て + あげる / もらう / くれる',
        exampleJp: '友達に日本語を教えてもらいました。',
        exampleVi: 'Tôi đã được bạn dạy tiếng Nhật cho.',
        exampleEn: 'I had my friend teach me Japanese.',
      },
      {
        title: '～ようにする',
        meaningVi: 'Cố gắng / Để tâm làm một việc gì đó',
        meaningEn: 'Make an effort to do / Try to do',
        formula: 'Động từ thể từ điển / thể ない + ようにする',
        exampleJp: '毎日野菜をたくさん食べるようにしています。',
        exampleVi: 'Tôi đang cố gắng ăn nhiều rau mỗi ngày.',
        exampleEn: 'I make an effort to eat lots of vegetables every day.',
      },
    ],
  },
  n3: {
    titleVi: 'Ngữ Pháp JLPT N3 (Trung cấp 1)',
    titleEn: 'JLPT N3 Grammar (Intermediate 1)',
    badge: 'N3',
    summaryVi:
      'Giai đoạn cầu nối trung cấp: diễn đạt sắc thái ý định, lý do, nguyên nhân - hệ quả và dự đoán.',
    summaryEn:
      'Intermediate bridging grammar: nuance expressions, reasons, conjectural phrases, and intention.',
    patterns: [
      {
        title: '～わけがない',
        meaningVi: 'Không lý nào / Tuyệt đối không thể nào...',
        meaningEn: 'There is no way that / Impossible that...',
        formula: 'Thể thông thường + わけがない',
        exampleJp: '彼が嘘をつくわけがありません。',
        exampleVi: 'Không lý nào anh ấy lại nói dối.',
        exampleEn: 'There is no way he would lie.',
      },
      {
        title: '～わりに(は)',
        meaningVi: 'Dù... nhưng so với mức độ thì (khác mong đợi)',
        meaningEn: 'Considering that / In spite of...',
        formula: 'Danh từ + の / Động từ thể thường + わりに(は)',
        exampleJp: 'この料理は値段のわりに美味しい。',
        exampleVi: 'Món ăn này ngon so với mức giá của nó.',
        exampleEn: 'This dish is delicious considering its price.',
      },
      {
        title: '～ことにする',
        meaningVi: 'Quyết định làm gì (do bản thân quyết định)',
        meaningEn: 'Decide to do (personal resolution)',
        formula: 'Động từ thể từ điển / thể ない + ことにする',
        exampleJp: '来月からジムに通うことにしました。',
        exampleVi: 'Tôi đã quyết định từ tháng sau sẽ đi tập gym.',
        exampleEn: 'I decided to start going to the gym next month.',
      },
      {
        title: '～たびに',
        meaningVi: 'Mỗi lần... thì lại (cứ hễ A thì luôn xảy ra B)',
        meaningEn: 'Every time that... / Whenever...',
        formula: 'Động từ thể từ điển / Danh từ + の + たびに',
        exampleJp: 'この曲を聴くたびに、故郷を思い出す。',
        exampleVi: 'Mỗi lần nghe ca khúc này, tôi lại nhớ về quê hương.',
        exampleEn: 'Every time I listen to this song, I remember my hometown.',
      },
    ],
  },
  n2: {
    titleVi: 'Ngữ Pháp JLPT N2 (Trung cấp 2)',
    titleEn: 'JLPT N2 Grammar (Intermediate 2)',
    badge: 'N2',
    summaryVi:
      'Ngữ pháp phục vụ công việc và đọc hiểu văn bản: phán đoán logic, điều kiện giả định và văn phong trang trọng.',
    summaryEn:
      'Grammar for professional reading and work: logical inferences, hypothetical conditionals, and formal writing.',
    patterns: [
      {
        title: '～に違いない',
        meaningVi: 'Chắc chắn là... (phán đoán có căn cứ mạnh mẽ)',
        meaningEn: 'Must be / No doubt that...',
        formula:
          'Thể thông thường (Danh từ / Tính từ Na không だ) + に違いない',
        exampleJp: '毎日一生懸命練習したから、彼は合格するに違いない。',
        exampleVi: 'Luyện tập chăm chỉ mỗi ngày nên chắc chắn anh ấy sẽ đỗ.',
        exampleEn:
          'He practiced diligently every day, so he will definitely pass.',
      },
      {
        title: '～どころではない',
        meaningVi: 'Không phải là lúc / Hoàn cảnh không cho phép làm gì',
        meaningEn: 'Far from / Not the right time to...',
        formula: 'Danh từ / Động từ thể từ điển + どころではない',
        exampleJp: '忙しくて旅行どころではありません。',
        exampleVi: 'Bận đến mức không phải lúc để tính chuyện đi du lịch.',
        exampleEn: 'I am so busy that going on a trip is out of the question.',
      },
      {
        title: '～ざるを得ない',
        meaningVi: 'Đành phải / Buộc lòng phải làm gì (dù không muốn)',
        meaningEn: 'Cannot help but / Have no choice but to...',
        formula:
          'Động từ thể ない (bỏ ない) + ざるを得ない (する -> せざるを得ない)',
        exampleJp: '台風が近づいているので、イベントを中止せざるを得ない。',
        exampleVi: 'Vì bão đang đến gần nên buộc phải hủy bỏ sự kiện.',
        exampleEn:
          'With the typhoon approaching, we have no choice but to cancel the event.',
      },
    ],
  },
  n1: {
    titleVi: 'Ngữ Pháp JLPT N1 (Cao cấp)',
    titleEn: 'JLPT N1 Grammar (Advanced)',
    badge: 'N1',
    summaryVi:
      'Văn phong nghị luận, báo chí, tài liệu chuyên sâu và các cấu trúc ngữ pháp cổ có sắc thái biểu cảm cao.',
    summaryEn:
      'Academic prose, journalistic commentary, and nuanced classical grammar patterns.',
    patterns: [
      {
        title: '～であれ',
        meaningVi: 'Dù là... / Cho dù có là ai hay hoàn cảnh nào',
        meaningEn: 'Even if / Whether it be...',
        formula: 'Danh từ + であれ',
        exampleJp: '理由が何であれ、不正行為は許されない。',
        exampleVi:
          'Bất kể lý do là gì thì hành vi gian lận cũng không được tha thứ.',
        exampleEn:
          'Whatever the reason may be, dishonest behavior is unforgivable.',
      },
      {
        title: '～ならではの',
        meaningVi: 'Chỉ có ở / Đặc trưng riêng biệt mà nơi khác không có',
        meaningEn: 'Unique to / Distinctive of...',
        formula: 'Danh từ + ならではの + Danh từ',
        exampleJp: '京都ならではの風情を楽しむ。',
        exampleVi: 'Thưởng thức phong cảnh thanh tao đặc trưng chỉ có ở Kyoto.',
        exampleEn: 'Enjoy the charming atmosphere unique to Kyoto.',
      },
      {
        title: '～まみれ',
        meaningVi: 'Dính đầy / Phủ đầy (bụi bặm, bùn đất, nợ nần...)',
        meaningEn: 'Covered in / Plagued with (mud, dust, blood, debt)',
        formula: 'Danh từ + まみれ',
        exampleJp: '泥まみれになりながら、サッカーボールを追いかけた。',
        exampleVi:
          'Dù người lấm lem bùn đất, cậu bé vẫn mải mê đuổi theo trái bóng.',
        exampleEn: 'Covered in mud, he kept chasing after the soccer ball.',
      },
    ],
  },
  kaiwa: {
    titleVi: 'Hội Thoại Kaiwa Thực Tế',
    titleEn: 'Practical Kaiwa Dialogues',
    badge: 'Kaiwa',
    summaryVi:
      'Tổng hợp các mẫu câu nói tắt, biến âm đời sống và cách diễn đạt tự nhiên chuẩn người bản xứ.',
    summaryEn:
      'Spoken conversational shortcuts, contractions, and native Japanese phrasing patterns.',
    patterns: [
      {
        title: '～ちゃう / ～じゃう',
        meaningVi: 'Lỡ làm gì mất rồi (nói tắt của ～てしまう / ～でしまう)',
        meaningEn:
          'Accidentally did / Ended up doing (contraction of -te shimau)',
        formula: 'Động từ thể て (bỏ て) + ちゃう / thể で (bỏ で) + じゃう',
        exampleJp: '宿題を家に忘れちゃった！',
        exampleVi: 'Em lỡ để quên bài tập ở nhà mất rồi!',
        exampleEn: 'I accidentally forgot my homework at home!',
      },
      {
        title: '～んじゃない？',
        meaningVi: 'Chẳng phải là... sao? (đưa ra suy đoán nhẹ nhàng)',
        meaningEn: 'Isn’t it...? / Don’t you think so?',
        formula: 'Thể thông thường + んじゃない？',
        exampleJp: 'この店のラーメン、美味しいんじゃない？',
        exampleVi: 'Mì ramen ở quán này trông có vẻ ngon đấy chứ nhỉ?',
        exampleEn: 'Don’t you think the ramen here looks delicious?',
      },
      {
        title: '～とく',
        meaningVi: 'Làm sẵn / chuẩn bị trước (nói tắt của ～ておく)',
        meaningEn: 'Do in advance (contraction of -te oku)',
        formula: 'Động từ thể て (bỏ て) + とく',
        exampleJp: '明日のチケット、先に買っとくね。',
        exampleVi: 'Vé ngày mai tớ mua sẵn trước rồi nhé.',
        exampleEn: 'I will buy tomorrow’s tickets in advance, okay?',
      },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; level: string }>;
}): Promise<Metadata> {
  const { locale, level } = await params;
  const isVi = locale === 'vi';
  const levelKey = level.toLowerCase() as LevelKey;
  const detail = LEVEL_DATA[levelKey];

  if (!detail) {
    return {
      title: 'Ngữ Pháp | Mondu',
    };
  }

  return {
    title: `${isVi ? detail.titleVi : detail.titleEn} | Mondu`,
    description: isVi ? detail.summaryVi : detail.summaryEn,
  };
}

export default async function GrammarLevelPage({
  params,
}: {
  params: Promise<{ locale: string; level: string }>;
}) {
  const { locale, level } = await params;
  const isVi = locale === 'vi';
  const levelKey = level.toLowerCase() as LevelKey;

  if (!VALID_LEVELS.includes(levelKey)) {
    notFound();
  }

  const currentLevel = LEVEL_DATA[levelKey];

  return (
    <div className='mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6'>
      <Breadcrumbs
        items={[
          { name: isVi ? 'Trang chủ' : 'Home', url: '/' },
          { name: isVi ? 'Ngữ pháp' : 'Grammar', url: '/grammar' },
          {
            name: currentLevel.badge,
            url: `/grammar/${levelKey}`,
          },
        ]}
      />

      {/* Level Selection Switcher Tabs */}
      <div className='flex items-center gap-2 overflow-x-auto pb-1'>
        {VALID_LEVELS.map(lvl => {
          const isActive = lvl === levelKey;
          return (
            <Link
              key={lvl}
              href={`/grammar/${lvl}`}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
                isActive
                  ? 'border-b-2 border-(--main-color-accent) bg-(--main-color) text-(--background-color) shadow-sm'
                  : 'border border-(--border-color) bg-(--card-color) text-(--secondary-color) hover:border-(--main-color) hover:text-(--main-color)'
              }`}
            >
              {lvl === 'kaiwa' ? (
                <MessageCircle className='size-3.5' />
              ) : (
                <span className='font-black uppercase'>{lvl}</span>
              )}
              <span>
                {lvl === 'kaiwa'
                  ? isVi
                    ? 'Kaiwa'
                    : 'Dialogue'
                  : LEVEL_DATA[lvl].badge}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Hero Card */}
      <div className='rounded-3xl border border-(--border-color) bg-(--card-color) p-6 shadow-sm sm:p-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-1.5'>
            <div className='flex items-center gap-2'>
              <span className='flex size-9 items-center justify-center rounded-xl bg-(--main-color) font-black text-(--background-color)'>
                {currentLevel.badge}
              </span>
              <h1 className='text-2xl font-black text-(--foreground-color) sm:text-3xl'>
                {isVi ? currentLevel.titleVi : currentLevel.titleEn}
              </h1>
            </div>
            <p className='text-xs leading-relaxed text-(--secondary-color) sm:text-sm'>
              {isVi ? currentLevel.summaryVi : currentLevel.summaryEn}
            </p>
          </div>
          <div className='flex shrink-0 items-center gap-2 rounded-2xl border border-(--border-color) bg-(--background-color) px-3.5 py-2 text-xs font-semibold text-(--secondary-color)'>
            <GraduationCap className='size-4 text-(--main-color)' />
            <span>
              {currentLevel.patterns.length}{' '}
              {isVi ? 'mẫu tiêu biểu' : 'core patterns'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Lesson-by-Lesson Grammar Study */}
      {levelKey !== 'kaiwa' && (
        <section className='space-y-4 pt-2'>
          <ModernGrammarStudy level={levelKey} />
        </section>
      )}

      {/* Notice box */}
      <div className='flex items-center gap-3 rounded-2xl border border-(--main-color)/20 bg-(--main-color)/5 p-4 text-xs text-(--secondary-color) sm:text-sm'>
        <Info className='size-5 shrink-0 text-(--main-color)' />
        <p>
          {isVi
            ? 'Dữ liệu ngữ pháp mở rộng và bài tập trắc nghiệm chuyên sâu đang được liên tục cập nhật vào hệ thống.'
            : 'Extended grammar exercises and quiz assessments are being continuously updated for this level.'}
        </p>
      </div>

      {/* Grammar Patterns List */}
      <div className='space-y-4'>
        <h2 className='flex items-center gap-2 text-base font-bold text-(--main-color) sm:text-lg'>
          <BookOpen className='size-4' />
          <span>
            {isVi ? 'Các cấu trúc trọng tâm' : 'Core Grammar Patterns'}
          </span>
        </h2>

        <div className='grid grid-cols-1 gap-4 sm:gap-5'>
          {currentLevel.patterns.map((item, idx) => (
            <div
              key={idx}
              className='space-y-3 rounded-2xl border border-(--border-color) bg-(--card-color) p-5 shadow-sm transition-all hover:border-(--main-color)/40'
            >
              <div className='flex flex-wrap items-center justify-between gap-2 border-b border-(--border-color)/50 pb-2.5'>
                <div className='flex items-center gap-2'>
                  <span className='flex size-6 items-center justify-center rounded-lg bg-(--main-color)/10 text-xs font-bold text-(--main-color)'>
                    {idx + 1}
                  </span>
                  <span className='text-base font-black text-(--main-color) sm:text-lg'>
                    {item.title}
                  </span>
                </div>
                <span className='text-xs font-semibold text-(--secondary-color) sm:text-sm'>
                  {isVi ? item.meaningVi : item.meaningEn}
                </span>
              </div>

              {/* Formula */}
              <div className='flex items-center gap-2 rounded-xl bg-(--background-color) px-3 py-2 text-xs'>
                <span className='font-bold text-(--main-color)'>
                  {isVi ? 'Cấu trúc:' : 'Formula:'}
                </span>
                <code className='font-medium text-(--foreground-color)'>
                  {item.formula}
                </code>
              </div>

              {/* Example */}
              <div className='space-y-1 rounded-xl border border-(--border-color)/60 bg-(--background-color)/40 p-3 text-xs'>
                <p className='font-bold text-(--foreground-color) sm:text-sm'>
                  {item.exampleJp}
                </p>
                <p className='text-(--secondary-color)'>
                  {isVi ? item.exampleVi : item.exampleEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className='flex items-center justify-between border-t border-(--border-color) pt-6'>
        <Link
          href='/grammar'
          className='inline-flex items-center gap-1.5 text-xs font-bold text-(--secondary-color) transition-colors hover:text-(--main-color)'
        >
          <Layers className='size-3.5' />
          <span>{isVi ? 'Về danh mục Ngữ pháp' : 'All Grammar Levels'}</span>
        </Link>
        <Link
          href='/exercises'
          className='inline-flex items-center gap-1.5 rounded-xl border-b-2 border-(--main-color-accent) bg-(--main-color) px-4 py-2 text-xs font-bold text-(--background-color) shadow-sm hover:opacity-95'
        >
          <span>
            {isVi ? 'Luyện bài tập ngữ pháp' : 'Practice Grammar Quizzes'}
          </span>
          <ChevronRight className='size-3.5' />
        </Link>
      </div>
    </div>
  );
}
