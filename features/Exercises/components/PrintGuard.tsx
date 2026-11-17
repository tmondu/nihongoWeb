import React from 'react';

interface PrintGuardProps {
  /** true: ẩn toàn bộ nội dung khi in (Ctrl+P, menu in, Lưu thành PDF). */
  blocked: boolean;
  children: React.ReactNode;
}

// Chỉ admin được in đề. Với người khác, nội dung đề bị ẩn trong chế độ in,
// nên Ctrl+P hay "Lưu thành PDF" của trình duyệt chỉ ra một trang thông báo.
export const PrintGuard: React.FC<PrintGuardProps> = ({
  blocked,
  children,
}) => (
  <>
    <div className={blocked ? 'print:hidden' : undefined}>{children}</div>
    {blocked && (
      <p className='font-vietnamese hidden p-10 text-center text-sm text-black print:block'>
        Đề thi này chỉ cho phép làm bài trực tuyến, không hỗ trợ in. Vui lòng
        liên hệ giáo viên nếu cần bản in.
      </p>
    )}
  </>
);
