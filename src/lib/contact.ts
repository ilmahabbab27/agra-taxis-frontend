export const PHONE = "+94702504044";
export const PHONE_DISPLAY = "070 250 4044";
export const WHATSAPP = "94702504044";
export const EMAIL = "info@agrataxis.com";
export const WA_DEFAULT_MESSAGE = "Hello Agra Taxis, I'd like to chat with your AI chatbot for fare estimation.";

export function waLink(message: string = WA_DEFAULT_MESSAGE) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
}
