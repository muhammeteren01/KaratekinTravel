import * as ImagePicker from "expo-image-picker";

/** Avatarın veritabanına sığması ve isteğin şişmemesi için üst sınır. */
export const AVATAR_MAX_BYTES = 400 * 1024;

export type PickAvatarResult =
  | { status: "picked"; dataUri: string }
  | { status: "cancelled" }
  | { status: "denied" }
  | { status: "too-large"; bytes: number }
  | { status: "failed" };

/**
 * Galeriden kare bir avatar seçtirir ve data URI olarak döndürür.
 *
 * Avatar API'ye base64 olarak gidiyor (User.Avatar sütunu
 * ExpandUserAvatarToText migration'ıyla TEXT'e genişletildi), bu yüzden
 * ayrı bir yükleme ucu gerekmiyor. Yine de boyut sınırlanıyor: sınırsız
 * base64 hem isteği hem satırı şişirir.
 *
 * Hiçbir durumda istisna fırlatmıyor; çağıran taraf sonucu ayırt edip
 * kullanıcıya uygun mesajı gösterebilsin diye durum döndürüyor.
 */
export async function pickAvatar(): Promise<PickAvatarResult> {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return { status: "denied" };

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });

    if (result.canceled) return { status: "cancelled" };

    const asset = result.assets?.[0];
    if (!asset?.base64) return { status: "failed" };

    // base64 uzunlugundan yaklasik bayt sayisi
    const bytes = Math.floor((asset.base64.length * 3) / 4);
    if (bytes > AVATAR_MAX_BYTES) return { status: "too-large", bytes };

    const mime = asset.mimeType || "image/jpeg";
    return { status: "picked", dataUri: `data:${mime};base64,${asset.base64}` };
  } catch {
    return { status: "failed" };
  }
}
