import React from "react";
import { Film, Music, Video, Play, File } from "lucide-react";

export type ContentTypeIconProps = {
  type: "movie" | "series" | "trailer" | "music_video" | "short_film";
  size?: number;
  className?: string;
};

export const ContentTypeIcon: React.FC<ContentTypeIconProps> = ({ type, size = 16, className = "" }) => {
  switch (type) {
    case "movie":
      return <Film size={size} className={className} />;
    case "series":
      return <Video size={size} className={className} />;
    case "trailer":
      return <Play size={size} className={className} />;
    case "music_video":
      return <Music size={size} className={className} />;
    case "short_film":
      return <File size={size} className={className} />;
    default:
      return <Film size={size} className={className} />;
  }
};

export const getContentTypeLabel = (type: string): string => {
  switch (type) {
    case "movie":
      return "Movie";
    case "series":
      return "Series";
    case "trailer":
      return "Trailer";
    case "music_video":
      return "Music Video";
    case "short_film":
      return "Short Film";
    default:
      return "Video";
  }
};