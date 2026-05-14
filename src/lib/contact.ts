export const PHONE = "+94723003000";
export const PHONE_DISPLAY = "072 300 3000";
export const WHATSAPP = "94723003000";
export const EMAIL = "info@agrataxis.com";
export function waLink(message: string) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
}
