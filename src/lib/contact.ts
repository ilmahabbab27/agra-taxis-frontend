export const PHONE = "+94726789789";
export const PHONE_DISPLAY = "072 678 9789";
export const WHATSAPP = "94726789789";
export const EMAIL = "info@agrataxis.com";
export const WA_DEFAULT_MESSAGE = "Hello Agra Taxis, I'd like to chat with your AI chatbot for fare estimation.";

export function waLink(message: string = WA_DEFAULT_MESSAGE) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
}
