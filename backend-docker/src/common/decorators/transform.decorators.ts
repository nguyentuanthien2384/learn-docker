import { Transform } from 'class-transformer';

/** Cắt khoảng trắng hai đầu nếu giá trị là chuỗi. */
export const Trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

/** Chuẩn hoá email: cắt khoảng trắng và đưa về chữ thường. */
export const NormalizeEmail = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value));
