import React from 'react';
import { View, Image, StyleSheet, ImageStyle } from 'react-native';

export interface AvatarsStackProps {
  avatars: string[];
  maxVisible?: number;
  size?: number;
  overlap?: number; // negative marginLeft amount
  imageStyle?: ImageStyle;
}

const AvatarsStack: React.FC<AvatarsStackProps> = ({ avatars, maxVisible = 3, size = 24, overlap = -8, imageStyle }) => {
  const visible = avatars.slice(0, maxVisible);
  return (
    <View style={styles.avatarsStackContainer}>
      {visible.map((uri, index) => (
        <Image
          key={`${uri}-${index}`}
          source={{ uri }}
          style={[
            styles.avatarsStackAvatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: index === 0 ? 0 : overlap,
            },
            imageStyle,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarsStackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarsStackAvatar: {
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: '#F0F0F0',
  },
});

export default AvatarsStack;
