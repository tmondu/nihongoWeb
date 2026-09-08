-- Sample exercise data for JLPT N5
INSERT INTO `exercises` (`title`, `description`, `level`, `time_limit`, `questions`, `is_published`)
VALUES (
  'Bài tập nhập môn JLPT N5: Chữ Hán & Từ vựng cơ bản',
  'Đề luyện tập tổng hợp giúp bạn kiểm tra vốn từ vựng, chữ Hán và trợ từ tiếng Nhật sơ cấp.',
  'n5',
  10,
  '[{"id":1,"question":"Từ nào sau đây có nghĩa là \\"Ngày mai\\"?","options":["きのう","あした","きょう","あさって"],"correct_answer":"B","explanation":"あした (ashita) nghĩa là ngày mai. きのう là hôm qua, きょう là hôm nay, あさって là ngày kia."},{"id":2,"question":"Chọn cách đọc đúng của chữ Hán: 「先生」","options":["せんせい","がくせい","いしゃ","かいしゃいん"],"correct_answer":"A","explanation":"先生 đọc là せんせい (sensei) - có nghĩa là giáo viên / thầy cô."},{"id":3,"question":"Điền trợ từ thích hợp: わたし ___ ベトナム人です。","options":["を","に","は","で"],"correct_answer":"C","explanation":"は (wa) là trợ từ đứng sau chủ ngữ trong câu giới thiệu / khẳng định cơ bản."},{"id":4,"question":"Câu chào \\"ありがとうございます\\" có nghĩa là gì?","options":["Xin lỗi","Cảm ơn","Tạm biệt","Chúc ngủ ngon"],"correct_answer":"B","explanation":"ありがとうございます (arigatou gozaimasu) có nghĩa là Cảm ơn rất nhiều."},{"id":5,"question":"Số 7 trong tiếng Nhật đọc là gì?","options":["なな / しち","ろく","はち","きゅう"],"correct_answer":"A","explanation":"Số 7 đọc là なな (nana) hoặc しち (shichi)."}]',
  1
) ON DUPLICATE KEY UPDATE `id` = `id`;
