import type { ImageSourcePropType } from "react-native";
import { resolveImage } from "@/core/data/schemas";

/**
 * Kullanıcının avatarı; yoksa uygulama logosu.
 *
 * Ekranlarda sabit bir Unsplash adresi gösteriliyordu — giriş yapan kişinin
 * fotoğrafı değil, bir stok görseldi. Üstelik dış bir adrese bağlıydı: ağ
 * yoksa veya adres değişirse kırık görsel çıkıyordu.
 */
export function userAvatarSource(
  avatar?: string | null,
): ImageSourcePropType {
  return (
    (resolveImage(avatar ?? undefined) as ImageSourcePropType | undefined) ??
    (require("../../assets/logo.png") as ImageSourcePropType)
  );
}
