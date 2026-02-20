// src/components/molecules/AuthVideoBackground.tsx
import MediaPath from "@/constants/MediaPath";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { ReactNode } from "react";
import { View } from "react-native";

interface AuthVideoBackgroundProps {
  children?: ReactNode;
}

export default function AuthVideoBackground({
  children,
}: AuthVideoBackgroundProps) {
  const player = useVideoPlayer(MediaPath.videos.authBackground, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <VideoView
        player={player}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
        }}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
      />
      <View style={{ flex: 1, backgroundColor: "transparent" }}>
        {children}
      </View>
    </View>
  );
}
