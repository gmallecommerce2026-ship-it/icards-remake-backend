import { Transform } from 'class-transformer';

/** Form FE hay gửi chuỗi rỗng "" cho ô bỏ trống -> coi như không có giá trị. */
export const EmptyToUndefined = () =>
  Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value));
