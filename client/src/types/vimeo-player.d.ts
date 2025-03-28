declare module '@vimeo/player' {
  export interface VimeoPlayerOptions {
    id?: number | string;
    url?: string;
    autopause?: boolean;
    autoplay?: boolean;
    background?: boolean;
    controls?: boolean;
    dnt?: boolean;
    height?: number;
    loop?: boolean;
    maxheight?: number;
    maxwidth?: number;
    muted?: boolean;
    playsinline?: boolean;
    portrait?: boolean;
    responsive?: boolean;
    speed?: boolean;
    title?: boolean;
    transparent?: boolean;
    width?: number;
  }

  export interface VimeoTimeObject {
    duration: number;
    percent: number;
    seconds: number;
  }

  export default class Player {
    constructor(element: HTMLIFrameElement | HTMLElement | string, options?: VimeoPlayerOptions);
    
    on(event: string, callback: Function): void;
    off(event: string, callback?: Function): void;
    loadVideo(id: number): Promise<number>;
    ready(): Promise<void>;
    enableTextTrack(language: string, kind?: string): Promise<object>;
    disableTextTrack(): Promise<void>;
    pause(): Promise<void>;
    play(): Promise<void>;
    unload(): Promise<void>;
    getAutopause(): Promise<boolean>;
    setAutopause(autopause: boolean): Promise<boolean>;
    getColor(): Promise<string>;
    setColor(color: string): Promise<string>;
    getCurrentTime(): Promise<number>;
    setCurrentTime(seconds: number): Promise<number>;
    getDuration(): Promise<number>;
    getEnded(): Promise<boolean>;
    getLoop(): Promise<boolean>;
    setLoop(loop: boolean): Promise<boolean>;
    getMuted(): Promise<boolean>;
    setMuted(muted: boolean): Promise<boolean>;
    getPaused(): Promise<boolean>;
    getPlayed(): Promise<VimeoTimeObject[]>;
    getSeekable(): Promise<VimeoTimeObject[]>;
    getBuffered(): Promise<VimeoTimeObject[]>;
    getTextTracks(): Promise<object[]>;
    getVideoEmbedCode(): Promise<string>;
    getVideoId(): Promise<number>;
    getVideoTitle(): Promise<string>;
    getVideoWidth(): Promise<number>;
    getVideoHeight(): Promise<number>;
    getVideoUrl(): Promise<string>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<number>;
  }
}