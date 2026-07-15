export const PHONE = "+94723003000";
export const PHONE_DISPLAY = "072 300 3000";
export const WHATSAPP = "94702504044";
export const EMAIL = "info@agrataxis.com";
export const WA_DEFAULT_MESSAGE = "Hello Agra Taxis, I'd like a fare estimate.";

export function waLink(message: string = WA_DEFAULT_MESSAGE) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
}
